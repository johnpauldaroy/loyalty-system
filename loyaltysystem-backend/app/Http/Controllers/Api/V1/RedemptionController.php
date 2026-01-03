<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Redemption;
use Illuminate\Http\Request;

class RedemptionController extends ApiController
{
    /**
     * List redemptions.
     * Members see their own. Staff/Admin see all.
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();
        $query = Redemption::with(['reward', 'member', 'processor']);

        if ($user->role === 'member') {
            if (!$user->member) {
                return $this->successResponse([]);
            }
            $query->where('member_id', $user->member->id);
        }

        // Filtering
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $redemptions = $query->latest()->paginate($request->query('per_page', 15));

        return $this->successResponse($redemptions);
    }

    /**
     * Complete a redemption (Staff/Admin).
     */
    public function update(Request $request, Redemption $redemption)
    {
        // Actually we want a specific "complete" action, but update works too
        // Check if already completed
        if ($redemption->status === 'completed') {
            return $this->errorResponse('Redemption is already completed', [], 400);
        }

        $redemption->update([
            'status' => 'completed',
            'processed_by' => auth('api')->id(),
            'processed_at' => now(),
        ]);

        // Audit log
        $auditService = app(\App\Services\AuditService::class);
        $auditService->log('REDEMPTION_COMPLETED', $redemption, [
            'reward_name' => $redemption->reward->name,
            'member_name' => $redemption->member->name,
        ]);

        return $this->successResponse($redemption, 'Redemption marked as claimed');
    }
}
