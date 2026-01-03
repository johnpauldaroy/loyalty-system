<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('action')->comment('Specific action e.g. PURCHASE, PAYMENT, ATTENDANCE');
            $table->enum('type', ['fixed', 'multiplier']);
            $table->decimal('value', 10, 4)->comment('Points amount or multiplier factor');
            $table->decimal('min_amount', 15, 2)->nullable()->comment('Minimum transaction amount to trigger rule');
            $table->decimal('max_points', 15, 2)->nullable()->comment('Maximum points cap per transaction');
            $table->boolean('active')->default(true);
            $table->timestamps();

            // Compound index for rule lookup
            $table->index(['category_id', 'action', 'active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_rules');
    }
};
