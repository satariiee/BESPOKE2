<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    public static function record(?User $user, string $activity, ?Model $subject = null, array $metadata = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $user?->id,
            'aktivitas' => $activity,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'metadata' => $metadata ?: null,
        ]);
    }
}