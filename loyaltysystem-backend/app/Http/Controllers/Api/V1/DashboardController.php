<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Member;
use App\Models\Transaction;
use App\Models\Reward;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    public function stats()
    {
        // 1. Summary Counts
        $totalMembers = Member::count();
        $activeStaff = User::where('role', 'staff')->count();
        $totalTransactions = Transaction::count();
        $pointsDistributed = Transaction::where('points_earned', '>', 0)->sum('points_earned');

        // 2. Bar Chart: Transactions Last 7 Days
        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $transactionTrends = Transaction::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count'),
            DB::raw('sum(amount) as total_amount')
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // format for frontend (fill missing days if needed, but simple is fine for now)
        $formattedTrends = $transactionTrends->map(function ($item) {
            return [
                'date' => Carbon::parse($item->date)->format('M d'),
                'count' => $item->count,
                'amount' => $item->total_amount
            ];
        });

        // 3. Pie Chart: Transactions by Category
        $categoryDistribution = Transaction::with('category')
            ->select('category_id', DB::raw('count(*) as count'))
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category ? $item->category->name : 'Unknown',
                    'value' => $item->count
                ];
            });

        // 4. Recent Activity
        $recentTransactions = Transaction::with(['member', 'creator', 'category'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'member' => $t->member ? $t->member->name : 'Unknown',
                    'processed_by' => $t->creator ? $t->creator->name : 'System',
                    'action' => $t->action,
                    'amount' => $t->amount,
                    'points' => $t->points_earned,
                    'time' => $t->created_at->diffForHumans()
                ];
            });

        return $this->successResponse([
            'summary' => [
                'total_members' => $totalMembers,
                'active_staff' => $activeStaff,
                'total_transactions' => $totalTransactions,
                'points_issued' => $pointsDistributed
            ],
            'trends' => $formattedTrends,
            'distribution' => $categoryDistribution,
            'recent_activity' => $recentTransactions
        ]);
    }
}
