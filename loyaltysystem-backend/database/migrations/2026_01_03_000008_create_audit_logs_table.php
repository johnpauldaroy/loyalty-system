<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->comment('User who performed action, null for system');
            $table->string('action')->comment('Action type e.g. QR_SCAN, POINTS_CREDIT');
            $table->string('model_type')->nullable()->comment('Polymorphic relation type');
            $table->unsignedBigInteger('model_id')->nullable()->comment('Polymorphic relation ID');
            $table->json('payload')->comment('Full request/response payload for audit');
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            // Immutable log - created_at only
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
