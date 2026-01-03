<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories');
            $table->string('action');
            $table->decimal('amount', 15, 2)->comment('Transaction amount in currency');
            $table->decimal('points_earned', 15, 2)->comment('Calculated points awarded');
            $table->string('reference_no')->unique()->comment('External reference number or generated UUID');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->comment('Staff user who processed transaction');
            $table->timestamps();

            $table->index('member_id');
            $table->index('reference_no');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
