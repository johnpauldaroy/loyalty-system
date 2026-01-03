<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Services\QRService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QRController extends ApiController
{
    protected $qrService;
    protected $transactionService;

    public function __construct(QRService $qrService, TransactionService $transactionService)
    {
        $this->qrService = $qrService;
        $this->transactionService = $transactionService;

        // Ensure authentication and role checks are applied via routes or constructor middleware
        // $this->middleware('role:staff,admin'); // Can be done here or in routes
    }

    /**
     * Process a QR scan transaction.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function scan(Request $request)
    {
        // 1. Validate Inputs
        $validated = $request->validate([
            'qr_payload' => 'required|array',
            'category_id' => 'required|exists:categories,id',
            'action' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:255',
        ]);

        // 2. Validate QR Integrity & Expiration
        $qrResult = $this->qrService->validateQRPayload($validated['qr_payload']);

        if (!$qrResult['valid']) {
            return $this->errorResponse($qrResult['error'], [], 400);
        }

        // 3. Retrieve Member
        $memberCode = $qrResult['member_code'];
        $member = Member::where('member_code', $memberCode)->first();

        if (!$member) {
            return $this->errorResponse('Member not found', [], 404);
        }

        if ($member->status !== 'active') {
            return $this->errorResponse('Member is not active', [], 403);
        }

        try {
            // 4. Process Transaction via Service
            $transactionData = [
                'member_id' => $member->id,
                'category_id' => $validated['category_id'],
                'action' => $validated['action'],
                'amount' => $validated['amount'],
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ];

            $transaction = $this->transactionService->processTransaction($transactionData);

            // 5. Return Success Response
            // Refresh to ensure we have latest balance
            $newBalance = $member->loyaltyPoint->refresh()->balance;

            return $this->successResponse([
                'transaction_id' => $transaction->id,
                'reference_no' => $transaction->reference_no,
                'points_earned' => $transaction->points_earned,
                'new_balance' => $newBalance,
                'member_name' => $member->name,
            ], 'Transaction processed successfully');

        } catch (\Exception $e) {
            Log::error('Scan Transaction Failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            // Return safe error message (TransactionService throws specific messages for blocks)
            return $this->errorResponse($e->getMessage(), [], 422);
        }
    }

    /**
     * Generate a QR code payload for a member.
     *
     * @param Member $member
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateQR(Member $member)
    {
        // Implementation for simple generation endpoint
        $payload = $this->qrService->generateQRPayload($member);
        return $this->successResponse($payload);
    }
}
