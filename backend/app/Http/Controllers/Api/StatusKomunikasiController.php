<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalFollowUp;
use App\Models\LaporanClosing;
use App\Models\StatusKomunikasi;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StatusKomunikasiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StatusKomunikasi::query()->with(['jadwalFollowUp.calonJemaah:id,nama,kontak', 'jadwalFollowUp.staff:id,name']);

        $user = $request->user();
        if ($user?->role === 'staff') {
            $query->whereHas('jadwalFollowUp', function ($builder) use ($user) {
                $builder->where('staff_id', $user->id);
            });
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->whereHas('jadwalFollowUp.calonJemaah', function ($builder) use ($search) {
                $builder->where('nama', 'like', "%{$search}%")
                    ->orWhere('kontak', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->latest()->get()->map(fn (StatusKomunikasi $item) => $this->toPayload($item)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'jadwal_follow_up_id' => ['required', 'exists:jadwal_follow_ups,id'],
            'metode' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['Prospek Baru', 'Dihubungi', 'Tertarik', 'Closing', 'Tidak Jadi', 'Menunggu Keputusan'])],
            'catatan' => ['nullable', 'string'],
            'follow_up_at' => ['nullable', 'date'],
            'nilai_pembayaran' => ['sometimes', 'nullable', 'numeric', 'min:0.01'],
            'tipe_pembayaran' => ['sometimes', 'nullable', Rule::in(['DP', 'Lunas', 'dp', 'lunas'])],
        ]);

        $jadwal = JadwalFollowUp::with('calonJemaah')->findOrFail($validated['jadwal_follow_up_id']);

        $isClosingDone = $validated['status'] === 'Closing' && $jadwal->status === 'Done';

        if ($isClosingDone) {
            $request->validate([
                'nilai_pembayaran' => ['required', 'numeric', 'min:0.01'],
                'tipe_pembayaran' => ['required', Rule::in(['DP', 'Lunas', 'dp', 'lunas'])],
            ]);
        }

        $normalizedTipePembayaran = $this->normalizeTipePembayaran($request->string('tipe_pembayaran')->toString());

        // Every follow-up update should create a new log row for full timeline history.
        $statusKomunikasi = StatusKomunikasi::create([
            'jadwal_follow_up_id' => $validated['jadwal_follow_up_id'],
            'metode' => $validated['metode'] ?? $jadwal->metode,
            'status' => $validated['status'],
            'catatan' => $validated['catatan'] ?? null,
            'follow_up_at' => $validated['follow_up_at'] ?? now(),
        ]);

        if ($jadwal->calonJemaah) {
            $jadwal->calonJemaah->update([
                'status_komunikasi' => $validated['status'],
                'last_follow_up_at' => $statusKomunikasi->follow_up_at,
            ]);

            if ($validated['status'] === 'Closing') {
                $closingPayload = [
                    'staff_id' => $jadwal->staff_id,
                    'tanggal_closing' => $statusKomunikasi->follow_up_at?->toDateString() ?? now()->toDateString(),
                    'catatan' => $validated['catatan'] ?? null,
                ];

                if ($request->has('nilai_pembayaran')) {
                    $closingPayload['nilai'] = (float) $request->input('nilai_pembayaran');
                }

                if ($normalizedTipePembayaran !== null) {
                    $closingPayload['status_pembayaran'] = $normalizedTipePembayaran;
                }

                LaporanClosing::updateOrCreate(
                    ['calon_jemaah_id' => $jadwal->calon_jemaah_id],
                    $closingPayload
                );
            }
        }

        ActivityLogService::record($request->user(), 'Memperbarui status komunikasi', $statusKomunikasi, [
            'status' => $statusKomunikasi->status,
        ]);

        return response()->json([
            'message' => 'Status komunikasi berhasil disimpan.',
            'data' => $this->toPayload($statusKomunikasi->load(['jadwalFollowUp.calonJemaah:id,nama,kontak', 'jadwalFollowUp.staff:id,name'])),
        ], 201);
    }

    public function show(StatusKomunikasi $statusKomunikasi): JsonResponse
    {
        return response()->json([
            'data' => $this->toPayload($statusKomunikasi->load(['jadwalFollowUp.calonJemaah:id,nama,kontak', 'jadwalFollowUp.staff:id,name'])),
        ]);
    }

    public function update(Request $request, StatusKomunikasi $statusKomunikasi): JsonResponse
    {
        $validated = $request->validate([
            'jadwal_follow_up_id' => ['sometimes', 'required', 'exists:jadwal_follow_ups,id'],
            'metode' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'required', Rule::in(['Prospek Baru', 'Dihubungi', 'Tertarik', 'Closing', 'Tidak Jadi', 'Menunggu Keputusan'])],
            'catatan' => ['sometimes', 'nullable', 'string'],
            'follow_up_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $statusKomunikasi->fill($validated)->save();

        $jadwal = $statusKomunikasi->jadwalFollowUp()->with('calonJemaah')->first();
        if ($jadwal?->calonJemaah) {
            $jadwal->calonJemaah->update([
                'status_komunikasi' => $statusKomunikasi->status,
                'last_follow_up_at' => $statusKomunikasi->follow_up_at,
            ]);
        }

        ActivityLogService::record($request->user(), 'Mengubah status komunikasi', $statusKomunikasi, [
            'status' => $statusKomunikasi->status,
        ]);

        return response()->json([
            'message' => 'Status komunikasi berhasil diperbarui.',
            'data' => $this->toPayload($statusKomunikasi->fresh()->load(['jadwalFollowUp.calonJemaah:id,nama,kontak', 'jadwalFollowUp.staff:id,name'])),
        ]);
    }

    public function destroy(Request $request, StatusKomunikasi $statusKomunikasi): JsonResponse
    {
        ActivityLogService::record($request->user(), 'Menghapus status komunikasi', $statusKomunikasi);
        $statusKomunikasi->delete();

        return response()->json(['message' => 'Status komunikasi berhasil dihapus.']);
    }

    private function toPayload(StatusKomunikasi $item): array
    {
        return [
            'id' => $item->id,
            'jadwal_follow_up_id' => $item->jadwal_follow_up_id,
            'metode' => $item->metode ?? $item->jadwalFollowUp?->metode,
            'calon_jemaah' => $item->jadwalFollowUp?->calonJemaah?->nama,
            'kontak' => $item->jadwalFollowUp?->calonJemaah?->kontak,
            'staff' => $item->jadwalFollowUp?->staff?->name,
            'status' => $item->status,
            'catatan' => $item->catatan,
            'follow_up_at' => $item->follow_up_at?->format('d M Y H:i'),
        ];
    }

    private function normalizeTipePembayaran(?string $tipePembayaran): ?string
    {
        if ($tipePembayaran === null || $tipePembayaran === '') {
            return null;
        }

        return strtolower($tipePembayaran) === 'dp' ? 'DP' : 'Lunas';
    }
}
