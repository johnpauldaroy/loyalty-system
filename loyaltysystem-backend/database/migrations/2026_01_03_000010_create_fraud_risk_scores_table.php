<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fraud_risk_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->unsignedTinyInteger('risk_score')->default(0)->comment('Risk score from 0-100');
            $table->timestamp('last_evaluated_at')->nullable();
            $table->timestamps();

            $table->unique('member_id');
            $table->index('risk_score'); // For querying high-risk members
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_risk_scores');
    }
};
