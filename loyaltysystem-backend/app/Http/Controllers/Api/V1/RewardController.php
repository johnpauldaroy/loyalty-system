<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Reward;
use Illuminate\Http\Request;

class RewardController extends ApiController
{
    protected $auditService;

    public function __construct(\App\Services\AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * List available rewards (Catalog).
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $rewards = Reward::where('active', true)
            ->where('stock', '>', 0)
            ->when($search !== '', function ($query) use ($search) {
                $like = '%' . $search . '%';
                $query->where(function ($q) use ($like) {
                    $q->where('name', 'like', $like)
                        ->orWhere('description', 'like', $like);
                });
            })
            ->get();

        return $this->successResponse($rewards);
    }

    /**
     * Show a specific reward.
     */
    public function show(Reward $reward)
    {
        return $this->successResponse($reward);
    }

    /**
     * Store a new reward (Admin only).
     */
    public function store(Request $request)
    {
        // Admin check should be done via middleware on route
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'points_required' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'active' => 'boolean'
        ]);

        $reward = Reward::create($validated);

        $this->auditService->log('REWARD_CREATED', $reward, $validated);

        return $this->successResponse($reward, 'Reward created successfully', 201);
    }

    /**
     * Update a reward (Admin only).
     */
    public function update(Request $request, Reward $reward)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'points_required' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'active' => 'boolean'
        ]);

        $reward->update($validated);

        $this->auditService->log('REWARD_UPDATED', $reward, $validated);

        return $this->successResponse($reward, 'Reward updated successfully');
    }

    /**
     * Delete a reward (Admin only).
     */
    public function destroy(Reward $reward)
    {
        if ($reward->redemptions()->exists()) {
            // Soft delete handled by model trait or just disable? 
            // Logic: disable instead of delete if used
            $reward->update(['active' => false]);
            return $this->successResponse($reward, 'Reward deactivated (cannot delete used reward)');
        }

        $reward->delete();
        $this->auditService->log('REWARD_DELETED', null, ['reward_id' => $reward->id, 'name' => $reward->name]);

        return $this->successResponse(null, 'Reward deleted successfully');
    }

    /**
     * Redeem a reward (Member action).
     */
    public function redeem(Request $request)
    {
        $validated = $request->validate([
            'reward_id' => 'required|exists:rewards,id'
        ]);

        $user = auth('api')->user();
        $member = $user->member;

        if (!$member) {
            return $this->errorResponse('User is not linked to a member profile', [], 400);
        }

        try {
            $redemption = \Illuminate\Support\Facades\DB::transaction(function () use ($member, $validated) {
                // 1. Lock Reward Row
                $reward = Reward::where('id', $validated['reward_id'])->lockForUpdate()->first();

                if (!$reward->active) {
                    throw new \Exception('Reward is no longer active');
                }

                if ($reward->stock <= 0) {
                    throw new \Exception('Reward is out of stock');
                }

                // 2. Lock Loyalty Points Row
                $loyalty = \App\Models\LoyaltyPoint::firstOrCreate(
                    ['member_id' => $member->id],
                    ['balance' => 0]
                );

                $loyalty = \App\Models\LoyaltyPoint::where('member_id', $member->id)->lockForUpdate()->first();

                if ($loyalty->balance < $reward->points_required) {
                    throw new \Exception('Insufficient points balance');
                }

                // 3. Process Deductions
                $loyalty->decrement('balance', $reward->points_required);
                $reward->decrement('stock');

                // 4. Create Redemption Record
                $redemption = \App\Models\Redemption::create([
                    'reward_id' => $reward->id,
                    'member_id' => $member->id,
                    'points_used' => $reward->points_required,
                    'status' => 'pending', // Pending staff approval or auto-completed? Let's say pending for physical items
                    'processed_by' => null,
                ]);

                // 5. Audit Log
                $this->auditService->log('REDEMPTION_REQUEST', $redemption, [
                    'reward_name' => $reward->name,
                    'points_cost' => $reward->points_required,
                    'new_balance' => $loyalty->balance
                ]);

                return $redemption;
            });

            return $this->successResponse($redemption, 'Redemption successful! Please visit branch to claim.', 201);

        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), [], 400);
        }
    }
}
