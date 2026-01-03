<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Member;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MemberController extends ApiController
{
    /**
     * List members (Admin).
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $members = Member::with(['user', 'branch'])
            ->when($search !== '', function ($query) use ($search) {
                $like = '%' . $search . '%';
                $query->where(function ($q) use ($like) {
                    $q->where('member_code', 'like', $like)
                        ->orWhere('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('phone', 'like', $like)
                        ->orWhere('branch', 'like', $like)
                        ->orWhereHas('branch', function ($b) use ($like) {
                            $b->where('name', 'like', $like)
                                ->orWhere('code', 'like', $like);
                        });
                });
            })
            ->latest()
            ->paginate(15);

        return $this->successResponse($members);
    }

    /**
     * Create a member (Admin).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'member_code' => 'nullable|string|max:255|unique:members,member_code',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'branch_id' => ['required', 'integer', Rule::exists('branches', 'id')],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'member'),
                'unique:members,user_id'
            ],
        ]);

        if (empty($data['member_code'])) {
            $data['member_code'] = $this->generateMemberCode();
        }

        $branch = Branch::find($data['branch_id']);
        $data['branch'] = $branch->name;

        $member = Member::create($data);

        // Ensure LoyaltyPoint record exists
        $member->loyaltyPoint()->create(['balance' => 0]);

        return $this->successResponse($member->load(['user', 'branch', 'loyaltyPoint']), 'Member created', 201);
    }

    /**
     * Update a member (Admin).
     */
    public function update(Request $request, Member $member)
    {
        $data = $request->validate([
            'member_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('members', 'member_code')->ignore($member->id),
            ],
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'branch_id' => ['required', 'integer', Rule::exists('branches', 'id')],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'member'),
                Rule::unique('members', 'user_id')->ignore($member->id),
            ],
        ]);

        $branch = Branch::find($data['branch_id']);
        $data['branch'] = $branch->name;

        $member->update($data);

        return $this->successResponse($member->load(['user', 'branch']), 'Member updated');
    }

    /**
     * Delete a member (Admin).
     */
    public function destroy(Member $member)
    {
        $member->delete();

        return $this->successResponse([], 'Member deleted');
    }

    private function generateMemberCode(): string
    {
        do {
            $code = 'MBR-' . strtoupper(Str::random(6));
        } while (Member::where('member_code', $code)->exists());

        return $code;
    }

    /**
     * Get member profile.
     */
    public function show(Member $member)
    {
        // Authorization: Ensure user owns this member record
        if (request()->user()->id !== $member->user_id && !request()->user()->hasRole('admin', 'staff')) {
            return $this->errorResponse('Unauthorized access to member profile', [], 403);
        }

        return $this->successResponse($member->load(['loyaltyPoint', 'branch']));
    }

    /**
     * Lookup members by code, name, email, or phone (Staff/Admin).
     */
    public function lookup(Request $request)
    {
        if (!request()->user()->hasRole('admin', 'staff')) {
            return $this->errorResponse('Unauthorized access', [], 403);
        }

        $term = trim((string) $request->query('q', ''));
        if ($term === '') {
            return $this->errorResponse('Search term is required', [], 422);
        }

        $like = '%' . $term . '%';
        $members = Member::with(['loyaltyPoint', 'branch'])
            ->where(function ($query) use ($term, $like) {
                $query->where('member_code', $term)
                    ->orWhere('member_code', 'like', $like)
                    ->orWhere('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            })
            ->limit(20)
            ->get();

        return $this->successResponse($members);
    }

    /**
     * Get member points balance.
     */
    public function points(Member $member)
    {
        if (request()->user()->id !== $member->user_id && !request()->user()->hasRole('admin', 'staff')) {
            return $this->errorResponse('Unauthorized access', [], 403);
        }

        return $this->successResponse([
            'balance' => $member->balance,
            'member_id' => $member->id
        ]);
    }

    /**
     * Get member transaction history.
     */
    public function transactions(Member $member)
    {
        if (request()->user()->id !== $member->user_id && !request()->user()->hasRole('admin', 'staff')) {
            return $this->errorResponse('Unauthorized access', [], 403);
        }

        $transactions = $member->transactions()
            ->latest()
            ->paginate(15);

        return $this->successResponse($transactions);
    }
}
