<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\LoyaltyPoint;
use App\Models\Member;
use App\Models\FraudRiskScore;
use App\Services\FraudScoringService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class TransactionService
{
    protected $pointsEngine;
    protected $auditService;
    protected $fraudService; // Added

    public function __construct(
        PointsEngineService $pointsEngine,
        AuditService $auditService,
        FraudScoringService $fraudService // Added
    ) {
        $this->pointsEngine = $pointsEngine;
        $this->auditService = $auditService;
        $this->fraudService = $fraudService; // Added
    }

    /**
     * Process a points transaction atomically.
     *
     * @param array $data
     * @return Transaction
     * @throws Exception
     */
    public function processTransaction(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            // 1. Validation & Setup
            $member = Member::findOrFail($data['member_id']);

            // 1b. Duplicate Check (Idempotency / Velocity)
            // Prevent same member, same amount, same category within 30 seconds
            $duplicate = Transaction::where('member_id', $member->id)
                ->where('amount', $data['amount'])
                ->where('category_id', $data['category_id'])
                ->where('created_at', '>=', now()->subSeconds(30))
                ->exists();

            if ($duplicate) {
                // Return existing transaction or throw error?
                // Throwing specific error allows frontend to say "Already processed"
                throw new Exception("Duplicate transaction detected. Please wait.");
            }

            // 2. Fraud Risk Evaluation
            $context = [
                'amount' => $data['amount'],
                'points' => 0, // Points not calculated yet, but passed for context if needed or updated later
                'staff_id' => Auth::id() ?? $data['created_by'] ?? null,
                'timestamp' => now(),
            ];

            // Pre-calculate points for fraud check context if needed by rules
            // (Though current rules rely mainly on amount/velocity, high points is a factor)
            $preCalcPoints = $this->pointsEngine->calculatePoints(
                $member,
                $data['category_id'],
                $data['action'],
                $data['amount']
            );
            $context['points'] = $preCalcPoints;

            $riskEval = $this->fraudService->evaluate($member, $context);

            // 2b. Log Fraud Evaluation (Always)
            $this->auditService->log('FRAUD_EVALUATION', $member, [
                'score_delta' => $riskEval['score_delta'],
                'risk_level' => $riskEval['risk_level'],
                'reasons' => $riskEval['reasons'],
                'context' => $context
            ]);

            // 3. Update Member Risk Score
            $this->updateFraudRiskScore($member, $riskEval['score_delta']);

            // 4. Handle Risk Outcomes
            if ($riskEval['risk_level'] === FraudScoringService::RISK_HIGH) {
                // Log and Block
                $this->auditService->log('FRAUD_BLOCK', $member, [
                    'risk_level' => 'HIGH',
                    'reasons' => $riskEval['reasons'],
                    'transaction_attempt' => $data
                ]);

                throw new Exception("Transaction blocked due to high fraud risk: " . implode(", ", $riskEval['reasons']));
            }

            $notes = $data['notes'] ?? '';
            if ($riskEval['risk_level'] === FraudScoringService::RISK_MEDIUM) {
                // Flag and Continue
                $notes .= " [RISK FLAG: MEDIUM - " . implode(", ", $riskEval['reasons']) . "]";

                $this->auditService->log('TRANSACTION_FLAGGED', $member, [
                    'risk_level' => 'MEDIUM',
                    'reasons' => $riskEval['reasons']
                ]);
            }

            // 5. Create Transaction Record
            $transaction = Transaction::create([
                'member_id' => $member->id,
                'category_id' => $data['category_id'],
                'action' => $data['action'],
                'amount' => $data['amount'],
                'points_earned' => $preCalcPoints,
                'reference_no' => $this->generateReferenceNumber(),
                'notes' => trim($notes) ?: null,
                'created_by' => $context['staff_id'],
            ]);

            // 6. Update Loyalty Balance Atomically
            // Ensure record exists first (firstOrCreate is not atomic across threads without unique constraint handle, but member_id is unique)
            // But we want to lock it.
            $loyaltyPoint = LoyaltyPoint::firstOrCreate(
                ['member_id' => $member->id],
                ['balance' => 0]
            );

            // Acquire lock to prevent race conditions during read-modify-write
            $loyaltyPoint = LoyaltyPoint::where('member_id', $member->id)->lockForUpdate()->first();
            $loyaltyPoint->balance += $preCalcPoints;
            $loyaltyPoint->save();

            // 7. Log Audit Trail
            $this->auditService->log(
                'TRANSACTION_CREATED',
                $transaction,
                [
                    'amount' => $data['amount'],
                    'points' => $preCalcPoints,
                    'new_balance' => $loyaltyPoint->balance,
                    'risk_level' => $riskEval['risk_level']
                ]
            );

            return $transaction;
        });
    }

    /**
     * Update the member's fraud risk score.
     */
    private function updateFraudRiskScore(Member $member, int $delta): void
    {
        if ($delta === 0)
            return;

        $riskScore = FraudRiskScore::firstOrCreate(
            ['member_id' => $member->id],
            ['risk_score' => 0, 'last_evaluated_at' => now()]
        );

        // Apply delta
        $newScore = $riskScore->risk_score + $delta;

        // Model mutator will handle clamping 0-100, checking here doesn't hurt
        $riskScore->risk_score = $newScore;
        $riskScore->last_evaluated_at = now();
        $riskScore->save();
    }

    /**
     * Generate a unique reference number.
     */
    private function generateReferenceNumber(): string
    {
        return 'TRX-' . strtoupper(uniqid());
    }
}
