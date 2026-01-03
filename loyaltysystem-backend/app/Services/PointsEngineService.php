<?php

namespace App\Services;

use App\Models\Member;
use App\Models\PointRule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PointsEngineService
{
    /**
     * Calculate points based on active rules.
     * 
     * Strategy:
     * - Fetches all active rules matching category and action.
     * - Iterates through rules.
     * - Skips rules where amount < min_amount.
     * - Calculates points based on type (fixed vs multiplier).
     * - caps points at max_points if defined.
     * - Accumulates total points from all matching rules.
     * 
     * @param Member $member The member performing the action (reserved for future tier logic)
     * @param int $categoryId The category of the transaction
     * @param string $action The specific action (e.g., PURCHASE)
     * @param float $amount The transaction amount
     * @return float The total calculated points (deterministic)
     */
    public function calculatePoints(Member $member, int $categoryId, string $action, float $amount): float
    {
        // 1. Fetch relevant rules
        $rules = PointRule::active()
            ->where('category_id', $categoryId)
            ->where('action', $action)
            ->get();

        if ($rules->isEmpty()) {
            return 0.0;
        }

        $totalPoints = 0.0;

        foreach ($rules as $rule) {
            // 2. Check Constraints
            if ($rule->min_amount && $amount < $rule->min_amount) {
                continue;
            }

            // 3. Calculate Base Points
            $points = 0.0;
            switch ($rule->type) {
                case 'fixed':
                    $points = $rule->value;
                    break;

                case 'multiplier':
                    // "value" represents the divisor (e.g., 1 point per 20 PHP -> value = 20)
                    // Avoid division by zero
                    if ($rule->value > 0) {
                        $points = floor($amount / $rule->value);
                    }
                    break;
            }

            // 4. Apply Max Cap
            if ($rule->max_points && $points > $rule->max_points) {
                $points = $rule->max_points;
            }

            $totalPoints += $points;
        }

        // Return deterministic 2-decimal float
        return round($totalPoints, 2);
    }
}
