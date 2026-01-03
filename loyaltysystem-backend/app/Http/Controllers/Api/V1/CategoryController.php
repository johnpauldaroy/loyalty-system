<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use App\Services\AuditService;
use Illuminate\Http\Request;

class CategoryController extends ApiController
{
    protected $auditService;

    public function __construct(AuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function index()
    {
        return $this->successResponse(Category::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name',
            'slug' => 'required|string|unique:categories,slug',
            'description' => 'nullable|string',
            'active' => 'boolean'
        ]);

        $category = Category::create($validated);

        $this->auditService->log('CATEGORY_CREATED', $category, $validated);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    public function show(Category $category)
    {
        return $this->successResponse($category);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:categories,name,' . $category->id,
            'slug' => 'sometimes|string|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'active' => 'boolean'
        ]);

        $category->update($validated);

        $this->auditService->log('CATEGORY_UPDATED', $category, $validated);

        return $this->successResponse($category, 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        // Check for dependencies (transactions, rules) before deleting?
        // Soft deletes are not enabled for categories in migration, so maybe just check transactions
        if ($category->transactions()->exists()) {
            return $this->errorResponse('Cannot delete category with existing transactions.', [], 409);
        }

        $category->delete();

        $this->auditService->log('CATEGORY_DELETED', null, ['category_id' => $category->id, 'name' => $category->name]);

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
