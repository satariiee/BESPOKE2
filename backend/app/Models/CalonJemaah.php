<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CalonJemaah extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'kontak',
        'alamat',
        'sumber',
        'paket',
        'staff_id',
        'status_komunikasi',
        'last_follow_up_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'last_follow_up_at' => 'datetime',
        ];
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function jadwalFollowUps(): HasMany
    {
        return $this->hasMany(JadwalFollowUp::class);
    }

    public function closingReport(): HasOne
    {
        return $this->hasOne(LaporanClosing::class);
    }
}
