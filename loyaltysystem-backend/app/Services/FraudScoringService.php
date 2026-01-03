<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class FraudScoringService
{
    // Configurable Thresholds (could be moved to config/fraud.php)
    protected const VELOCITY_WINDOW_MINUTES = 5;
    protected const VELOCITY_THRESHOLD_COUNT = 3;
    protected const HIGH_POINTS_THRESHOLD = 500;
    protected const LATE_NIGHT_START = 23; // 11 PM
    protected const LATE_NIGHT_END = 5;    // 5 AM
    protected const STAFF_PAIRING_WINDOW_HOURS = 24;
    protected const STAFF_PAIRING_THRESHOLD = 5;

    // Risk Levels
    public const RISK_LOW = 'LOW';
    public const RISK_MEDIUM = 'MEDIUM';
    public const RISK_HIGH = 'HIGH';

    /**
     * Evaluate transaction context for fraud signals.
     *
     * @param Member $member
     * @param array $context ['amount', 'points', 'staff_id', 'timestamp']
     * @return array ['score_delta' => int, 'risk_level' => string, 'reasons' => array]
     */
    public function evaluate(Member $member, array $context): array
    {
        $scoreDelta = 0;
        $reasons = [];

        // 1. Velocity Check (Rapid Repeated Scans)
        $recentTransactions = Transaction::where('member_id', $member->id)
            ->where('created_at', '>=', Carbon::now()->subMinutes(self::VELOCITY_WINDOW_MINUTES))
            ->count();

        if ($recentTransactions >= self::VELOCITY_THRESHOLD_COUNT) {
            $scoreDelta += 20;
            $reasons[] = "High velocity: $recentTransactions scans in last " . self::VELOCITY_WINDOW_MINUTES . " mins";
        }

        // 2. High Points Check
        if (($context['points'] ?? 0) > self::HIGH_POINTS_THRESHOLD) {
            $scoreDelta += 15;
            $reasons[] = "High value transaction: " . $context['points'] . " points";
        }

        // 3. Time-of-Day Anomalies
        $hour = Carbon::parse($context['timestamp'] ?? now())->hour;
        if ($hour >= self::LATE_NIGHT_START || $hour < self::LATE_NIGHT_END) {
            $scoreDelta += 10;
            $reasons[] = "Late night activity (Hour: $hour)";
        }

        // 4. Staff-Member Pairing Anomalies
        if (isset($context['staff_id'])) {
            $staffTransactions = Transaction::where('member_id', $member->id)
                ->where('created_by', $context['staff_id'])
                ->where('created_at', '>=', Carbon::now()->subHours(self::STAFF_PAIRING_WINDOW_HOURS))
                ->count();

            if ($staffTransactions >= self::STAFF_PAIRING_THRESHOLD) {
                $scoreDelta += 25;
                $reasons[] = "Unusual staff pairing frequency ($staffTransactions times with Staff ID {$context['staff_id']})";
            }
        }

        // Calculate Risk Level
        $riskLevel = $this->determineRiskLevel($scoreDelta);

        return [
            'score_delta' => $scoreDelta,
            'risk_level' => $riskLevel,
            'reasons' => $reasons,
        ];
    }

    private function determineRiskLevel(int $score): string
    {
        if ($score >= 50)
            return self::RISK_HIGH;
        if ($score >= 20)
            return self::RISK_MEDIUM;
        return self::RISK_LOW;
    }
}
