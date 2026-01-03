<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PointRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'action',
        'type',
        'value',
        'min_amount',
        'max_points',
        'active',
    ];

    protected $casts = [
        'value' => 'decimal:4',
        'min_amount' => 'decimal:2',
        'max_points' => 'decimal:2',
        'active' => 'boolean',
    ];

    /**
     * Scope a query to only include active rules.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('active', true);
    }

    /**
     * Get the category that owns the point rule.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
