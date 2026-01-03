<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\LoyaltyPoint;
use App\Models\Member;
use App\Models\PointRule;
use App\Models\Reward;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Redemption;
use App\Services\QRService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class EndToEndLoyaltyTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $staff;
    protected $memberUser;
    protected $memberProfile;
    protected $category;
    protected $qrService;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Config for Test
        config(['jwt.secret' => 'test_secret_key_1234567890_long_enough_string']);
        config(['app.qr_secret' => 'test_qr_secret_key']);

        // Setup Service
        $this->qrService = app(QRService::class);

        // 1. Create Roles & Users
        $this->admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@example.com']);
        $this->staff = User::factory()->create(['role' => 'staff', 'email' => 'staff@example.com']);
        $this->memberUser = User::factory()->create(['role' => 'member', 'email' => 'member@example.com']);

        // 2. Create Member Profile
        $this->memberProfile = Member::create([
            'user_id' => $this->memberUser->id,
            'member_code' => 'TEST-MEMBER-001',
            'name' => 'John Doe',
            'email' => 'member@example.com',
            'branch' => 'Main',
            'status' => 'active'
        ]);

        // 3. Setup Categories and Rules (Admin Action simulation)
        $this->category = Category::create([
            'name' => 'Purchase',
            'slug' => 'purchase',
            'active' => true
        ]);

        PointRule::create([
            'category_id' => $this->category->id,
            'action' => 'PURCHASE',
            'type' => 'multiplier',
            'value' => 10, // 1 point per 10 currency units
            'active' => true
        ]);
    }

    /** @test */
    public function full_loyalty_lifecycle_flow()
    {
        // STEP 1: Admin Creates Reward
        $rewardData = [
            'name' => 'Coffee Voucher',
            'points_required' => 50,
            'stock' => 100,
            'active' => true
        ];

        $response = $this->actingAs($this->admin, 'api')
            ->postJson('/api/v1/rewards', $rewardData);

        $response->assertStatus(201);
        $rewardId = $response->json('data.id');

        // STEP 2: Member Generates QR
        // In real app, frontend calls API, here we simulate service call or API
        $response = $this->actingAs($this->memberUser, 'api')
            ->getJson("/api/v1/members/{$this->memberProfile->id}/qr");

        $response->assertStatus(200);
        $qrPayload = $response->json('data'); // This is the encrypted/signed payload

        // STEP 3: Staff Scans QR & Processes Transaction
        // Expected Points: Amount 600 / 10 = 60 points
        $transactionData = [
            'qr_payload' => $qrPayload,
            'category_id' => $this->category->id,
            'action' => 'PURCHASE',
            'amount' => 600
        ];

        $response = $this->actingAs($this->staff, 'api')
            ->postJson('/api/v1/scan', $transactionData);

        $response->assertStatus(200)
            ->assertJsonPath('data.points_earned', '60.00');

        // Verify Database State
        $this->assertDatabaseHas('loyalty_points', [
            'member_id' => $this->memberProfile->id,
            'balance' => 60.00
        ]);

        $this->assertDatabaseHas('transactions', [
            'amount' => 600,
            'points_earned' => 60
        ]);

        // STEP 4: Member Checks Balance
        $response = $this->actingAs($this->memberUser, 'api')
            ->getJson("/api/v1/members/{$this->memberProfile->id}/points");

        $response->assertStatus(200)
            ->assertJsonPath('data.balance', 60); // 60.00 might come as string or int depending on cast

        // STEP 5: Member Redeems Reward (Cost: 50 points)
        $response = $this->actingAs($this->memberUser, 'api')
            ->postJson('/api/v1/redemptions', [
                'reward_id' => $rewardId
            ]);

        $response->assertStatus(201);

        // Verify Final State
        // Expected Balance: 60 - 50 = 10
        $this->assertDatabaseHas('loyalty_points', [
            'member_id' => $this->memberProfile->id,
            'balance' => 10.00
        ]);

        // Expected Stock: 100 - 1 = 99
        $this->assertDatabaseHas('rewards', [
            'id' => $rewardId,
            'stock' => 99
        ]);

        // Verify Audit Log Exists
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'REDEMPTION_REQUEST'
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'TRANSACTION_CREATED'
        ]);
    }

    /** @test */
    public function prevents_duplicate_scans()
    {
        // Setup valid QR
        $qrPayload = $this->qrService->generateQRPayload($this->memberProfile);

        $transactionData = [
            'qr_payload' => $qrPayload,
            'category_id' => $this->category->id,
            'action' => 'PURCHASE',
            'amount' => 100
        ];

        // First Scan
        $this->actingAs($this->staff, 'api')
            ->postJson('/api/v1/scan', $transactionData)
            ->assertStatus(200);

        // Second Scan (Immediate Duplicate)
        $this->actingAs($this->staff, 'api')
            ->postJson('/api/v1/scan', $transactionData)
            ->assertStatus(422) // Expecting error due to 30s idempotency check
            ->assertJsonFragment(['message' => 'Duplicate transaction detected. Please wait.']);
    }
}
