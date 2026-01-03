<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\PointRule;
use App\Services\AuditService;
use Illuminate\Http\Request;

class PointRuleController extends ApiController
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index()
    {
        return $this->successResponse(PointRule::with('category')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'action' => 'required|string',
            'type' => 'required|in:fixed,multiplier',
            'value' => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_points' => 'nullable|numeric|min:0',
            'active' => 'boolean'
        ]);

        $rule = PointRule::create($validated);

        $this->auditService->log('RULE_CREATED', $rule, $validated);

        return $this->successResponse($rule, 'Point rule created successfully', 201);
    }

    public function show(PointRule $pointRule)
    {
        return $this->successResponse($pointRule->load('category'));
    }

    public function update(Request $request, PointRule $pointRule)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'action' => 'sometimes|string',
            'type' => 'sometimes|in:fixed,multiplier',
            'value' => 'sometimes|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_points' => 'nullable|numeric|min:0',
            'active' => 'boolean'
        ]);

        $pointRule->update($validated);

        $this->auditService->log('RULE_UPDATED', $pointRule, $validated);

        return $this->successResponse($pointRule, 'Point rule updated successfully');
    }

    public function destroy(PointRule $pointRule)
    {
        $pointRule->delete();

        $this->auditService->log('RULE_DELETED', null, ['rule_id' => $pointRule->id]);

        return $this->successResponse(null, 'Point rule deleted successfully');
    }
}
