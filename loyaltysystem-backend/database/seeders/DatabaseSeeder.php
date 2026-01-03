<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\PointRule;
use App\Models\User;
use App\Models\Member;
use App\Models\Branch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Roles & Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Front Desk Staff',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ]
        );

        $memberUser = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'role' => 'member',
            ]
        );

        $mainBranch = Branch::firstOrCreate(
            ['code' => 'MAIN'],
            ['name' => 'Main Branch', 'status' => 'active']
        );

        // 2. Create Member Profile
        if (!$memberUser->member) {
            Member::create([
                'user_id' => $memberUser->id,
                'member_code' => 'MEM-' . strtoupper(uniqid()),
                'name' => 'John Doe',
                'email' => 'member@example.com',
                'branch_id' => $mainBranch->id,
                'branch' => $mainBranch->name,
                'status' => 'active',
            ]);
        }

        // 3. Categories
        $categories = [
            ['name' => 'Purchase', 'slug' => 'purchase', 'description' => 'General store purchases'],
            ['name' => 'Loan Payment', 'slug' => 'loan-payment', 'description' => 'Monthly loan amortization'],
            ['name' => 'Event Attendance', 'slug' => 'event', 'description' => 'AGM and seminar attendance'],
            ['name' => 'Marketplace', 'slug' => 'marketplace', 'description' => 'Online marketplace transactions'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // 4. Default Rules
        $purchaseCat = Category::where('slug', 'purchase')->first();
        if ($purchaseCat) {
            PointRule::firstOrCreate(
                ['category_id' => $purchaseCat->id, 'action' => 'PURCHASE'],
                [
                    'type' => 'multiplier',
                    'value' => 200, // 1 point per 200 units (example)
                    'min_amount' => 0,
                    'active' => true,
                ]
            );
        }
    }
}
