<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'calon_jemaah_id',
        'staff_id',
        'tanggal_closing',
        'nilai',
        'status_pembayaran',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_closing' => 'date',
            'nilai' => 'decimal:2',
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
}
