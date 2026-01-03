<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudRiskScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'risk_score',
        'last_evaluated_at',
    ];

    protected $casts = [
        'risk_score' => 'integer',
        'last_evaluated_at' => 'datetime',
    ];

    /**
     * Get the member that owns the risk score.
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Set the risk score with validation.
     * Use service layer to ensure authorized updates.
     */
    public function setRiskScoreAttribute($value)
    {
        // Enforce 0-100 range at model level as well
        if ($value < 0)
            $value = 0;
        if ($value > 100)
            $value = 100;

        $this->attributes['risk_score'] = $value;
    }
}
