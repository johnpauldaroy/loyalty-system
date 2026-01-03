<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    /**
     * Log an action to the audit trail.
     *
     * @param string $action
     * @param Model|null $model
     * @param array $payload
     * @param int|null $userId
     * @return AuditLog
     */
    public function log(string $action, ?Model $model = null, array $payload = [], ?int $userId = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model ? $model->getKey() : null,
            'payload' => $payload,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
