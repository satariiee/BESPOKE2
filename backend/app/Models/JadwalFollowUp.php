<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JadwalFollowUp extends Model
{
    use HasFactory;

    protected $fillable = [
        'calon_jemaah_id',
        'staff_id',
        'tanggal',
        'metode',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function calonJemaah(): BelongsTo
    {
        return $this->belongsTo(CalonJemaah::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function statusKomunikasi(): HasOne
    {
        // Keep backward compatibility for places that need only current/latest status.
        return $this->hasOne(StatusKomunikasi::class)->latestOfMany('follow_up_at');
    }

    public function statusKomunikasiLogs(): HasMany
    {
        return $this->hasMany(StatusKomunikasi::class);
    }
}
