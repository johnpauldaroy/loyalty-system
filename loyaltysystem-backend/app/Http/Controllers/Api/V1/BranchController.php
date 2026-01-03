<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchController extends ApiController
{
    public function index()
    {
        $branches = Branch::orderBy('created_at')->get();

        return $this->successResponse($branches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:branches,code',
            'name' => 'required|string|max:255|unique:branches,name',
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $branch = Branch::create($validated);

        return $this->successResponse($branch, 'Branch created', 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('branches', 'code')->ignore($branch->id),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('branches', 'name')->ignore($branch->id),
            ],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $branch->update($validated);

        return $this->successResponse($branch, 'Branch updated');
    }

    public function destroy(Branch $branch)
    {
        if ($branch->members()->exists()) {
            return $this->errorResponse('Cannot delete branch with linked members.', [], 409);
        }

        $branch->delete();

        return $this->successResponse([], 'Branch deleted');
    }
}
