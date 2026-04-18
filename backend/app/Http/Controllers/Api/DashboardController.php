<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CalonJemaah;
use App\Models\JadwalFollowUp;
use App\Models\LaporanClosing;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $jemaahQuery = CalonJemaah::query();
        $jadwalQuery = JadwalFollowUp::query();
        $closingQuery = LaporanClosing::query();
        $activityQuery = ActivityLog::query()->with('user:id,name');

        if ($user?->role === 'staff') {
            $jemaahQuery->where('staff_id', $user->id);
            $jadwalQuery->where('staff_id', $user->id);
            $closingQuery->where('staff_id', $user->id);
            $activityQuery->where('user_id', $user->id);
        }

        $totalJemaah = (clone $jemaahQuery)->count();
        $followUpHariIni = (clone $jadwalQuery)->whereDate('tanggal', now()->toDateString())->count();
        $totalClosing = $closingQuery->count();
        $conversionRate = $totalJemaah > 0 ? round(($totalClosing / $totalJemaah) * 100, 1) : 0;

        $jadwalForCharts = clone $jadwalQuery;
        $closingForCharts = clone $closingQuery;

        return response()->json([
            'data' => [
                'stats' => [
                    'total_jemaah' => $totalJemaah,
                    'follow_up_hari_ini' => $followUpHariIni,
                    'total_closing' => $totalClosing,
                    'conversion_rate' => $conversionRate,
                ],
                'follow_up_activity' => $this->buildMonthlySeries(
                    $jadwalForCharts->select(['tanggal'])->get(),
                    'tanggal',
                    'count'
                ),
                'closing_per_month' => $this->buildMonthlySeries(
                    $closingForCharts->select(['tanggal_closing'])->get(),
                    'tanggal_closing',
                    'closing'
                ),
                'recent_follow_ups' => (clone $jadwalQuery)->with(['calonJemaah:id,nama,kontak', 'staff:id,name', 'statusKomunikasi'])
                    ->latest('tanggal')
                    ->limit(5)
                    ->get()
                    ->map(fn (JadwalFollowUp $item) => [
                        'id' => $item->id,
                        'nama' => $item->calonJemaah?->nama,
                        'kontak' => $item->calonJemaah?->kontak,
                        'tanggal' => Carbon::parse($item->tanggal)->format('d M Y'),
                        'metode' => $item->metode,
                        'status_komunikasi' => $item->statusKomunikasi?->status ?? $item->status,
                        'status_jadwal' => $item->status,
                        'staff' => $item->staff?->name,
                    ]),
                'status_overview' => (clone $jemaahQuery)
                    ->selectRaw('status_komunikasi, COUNT(*) as total')
                    ->groupBy('status_komunikasi')
                    ->orderByDesc('total')
                    ->get()
                    ->map(fn ($item) => [
                        'status' => $item->status_komunikasi,
                        'total' => (int) $item->total,
                    ]),
                'staff_performance' => $this->buildStaffPerformance($user),
                'recent_activity' => $activityQuery
                    ->latest()
                    ->limit(6)
                    ->get()
                    ->map(fn (ActivityLog $log) => [
                        'id' => $log->id,
                        'aktivitas' => $log->aktivitas,
                        'user' => $log->user?->name,
                        'waktu' => $log->created_at?->diffForHumans(),
                    ]),
            ],
        ]);
    }

    private function buildMonthlySeries(Collection $records, string $dateField, string $valueKey): array
    {
        $months = collect(range(5, 0))->map(function (int $offset) {
            $month = now()->subMonths($offset)->startOfMonth();

            return [
                'key' => $month->format('Y-m'),
                'label' => $month->translatedFormat('M'),
            ];
        });

        $counts = $records->groupBy(function ($record) use ($dateField) {
            return Carbon::parse($record->{$dateField})->format('Y-m');
        })->map->count();

        return $months->map(function (array $month) use ($counts, $valueKey) {
            return [
                'month' => $month['label'],
                $valueKey => (int) ($counts[$month['key']] ?? 0),
            ];
        })->values()->all();
    }

    private function buildStaffPerformance(?\App\Models\User $currentUser = null): array
    {
        $closingQuery = LaporanClosing::query();

        if ($currentUser?->role === 'staff') {
            $closingQuery->where('staff_id', $currentUser->id);
        }

        $closingCounts = $closingQuery
            ->whereNotNull('staff_id')
            ->selectRaw('staff_id, COUNT(*) as total')
            ->groupBy('staff_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $staffNames = User::query()
            ->whereIn('id', $closingCounts->pluck('staff_id'))
            ->pluck('name', 'id');

        return $closingCounts->map(function ($item) use ($staffNames) {
            return [
                'name' => $staffNames[$item->staff_id] ?? 'Unknown',
                'closing' => (int) $item->total,
            ];
        })->values()->all();
    }
}
