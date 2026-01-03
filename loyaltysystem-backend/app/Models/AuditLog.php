<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    // Use created_at only
    public $timestamps = false; // We handle created_at manually or let DB do it, but no updated_at

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'payload',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = now();
            }
        });
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent model (polymorphic).
     */
    public function model(): MorphTo
    {
        return $this->morphTo();
    }

    // Enforce Immutability at Model Level
    public function save(array $options = [])
    {
        if ($this->exists) {
            throw new \Exception("Audit logs are immutable and cannot be updated.");
        }
        return parent::save($options);
    }

    public function update(array $attributes = [], array $options = [])
    {
        throw new \Exception("Audit logs are immutable and cannot be updated.");
    }

    public function delete()
    {
        throw new \Exception("Audit logs are immutable and cannot be deleted.");
    }
}
