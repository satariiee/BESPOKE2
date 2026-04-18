<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusKomunikasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'jadwal_follow_up_id',
        'metode',
        'status',
        'catatan',
        'follow_up_at',
    ];

    protected function casts(): array
    {
        return [
            'follow_up_at' => 'datetime',
        ];
    }

    public function jadwalFollowUp(): BelongsTo
    {
        return $this->belongsTo(JadwalFollowUp::class);
    }
}
