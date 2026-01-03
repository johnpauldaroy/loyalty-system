<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\QRController;
use App\Http\Controllers\Api\V1\RedemptionController;

// Auth Routes
Route::group(['prefix' => 'v1/auth'], function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('me', [AuthController::class, 'me']);
    });
});

// Protected API Routes
Route::group(['prefix' => 'v1', 'middleware' => 'auth:api'], function () {

    // QR Operations
    Route::post('/scan', [QRController::class, 'scan'])->middleware(['role:staff,admin', 'throttle:60,1']);
    Route::get('/members/{member}/qr', [QRController::class, 'generateQR'])->middleware('role:member,admin,staff');

    // Member Operations
    Route::get('/members/lookup', [\App\Http\Controllers\Api\V1\MemberController::class, 'lookup'])->middleware('role:staff,admin');
    Route::get('/members/{member}', [\App\Http\Controllers\Api\V1\MemberController::class, 'show']);
    Route::get('/members/{member}/points', [\App\Http\Controllers\Api\V1\MemberController::class, 'points']);
    Route::get('/members/{member}/transactions', [\App\Http\Controllers\Api\V1\MemberController::class, 'transactions']);

    // Rewards (Catalog is public to auth users)
    Route::get('/rewards', [\App\Http\Controllers\Api\V1\RewardController::class, 'index']);
    Route::get('/rewards/{reward}', [\App\Http\Controllers\Api\V1\RewardController::class, 'show']);

    // Shared Resources (Staff needs categories for transactions)
    Route::get('/categories', [\App\Http\Controllers\Api\V1\CategoryController::class, 'index']);

    // Redemption
    Route::get('/redemptions', [RedemptionController::class, 'index']);
    Route::post('/redemptions', [\App\Http\Controllers\Api\V1\RewardController::class, 'redeem'])->middleware('role:member');
    Route::patch('/redemptions/{redemption}', [RedemptionController::class, 'update'])->middleware('role:admin,staff');

    // Admin Operations
    Route::middleware(['role:admin'])->group(function () {
        Route::apiResource('branches', \App\Http\Controllers\Api\V1\BranchController::class)->except(['show']);
        Route::get('/members', [\App\Http\Controllers\Api\V1\MemberController::class, 'index']);
        Route::post('/members', [\App\Http\Controllers\Api\V1\MemberController::class, 'store']);
        Route::put('/members/{member}', [\App\Http\Controllers\Api\V1\MemberController::class, 'update']);
        Route::delete('/members/{member}', [\App\Http\Controllers\Api\V1\MemberController::class, 'destroy']);

        Route::post('/rewards', [\App\Http\Controllers\Api\V1\RewardController::class, 'store']);
        Route::apiResource('categories', \App\Http\Controllers\Api\V1\CategoryController::class)->except(['index']);
        Route::apiResource('rewards', \App\Http\Controllers\Api\V1\RewardController::class)->except(['index', 'show', 'store']); // store is already defined above? wait, store is defined above in previous edit? checking context.
        // Actually, previous edit had Route::apiResource('rewards', ...)->except(['index', 'show']).
        // I will just make categories index public like rewards.
        Route::apiResource('point-rules', \App\Http\Controllers\Api\V1\PointRuleController::class);
        Route::get('/audit-logs', [\App\Http\Controllers\Api\V1\AuditLogController::class, 'index']);
        Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);

        // Dashboard Stats
        Route::get('/dashboard/stats', [\App\Http\Controllers\Api\V1\DashboardController::class, 'stats']);
    });
});
