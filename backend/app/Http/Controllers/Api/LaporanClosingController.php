<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanClosing;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaporanClosingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LaporanClosing::query()->with(['calonJemaah:id,nama,kontak', 'staff:id,name']);

        if ($search = $request->string('search')->trim()->toString()) {
            $query->whereHas('calonJemaah', function ($builder) use ($search) {
                $builder->where('nama', 'like', "%{$search}%")
                    ->orWhere('kontak', 'like', "%{$search}%");
            });
        }

        if ($from = $request->date('from')) {
            $query->whereDate('tanggal_closing', '>=', $from);
        }

        if ($to = $request->date('to')) {
            $query->whereDate('tanggal_closing', '<=', $to);
        }

        return response()->json([
            'data' => $query->latest('tanggal_closing')->get()->map(fn (LaporanClosing $item) => $this->toPayload($item)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'calon_jemaah_id' => ['required', 'exists:calon_jemaahs,id'],
            'staff_id' => ['nullable', 'exists:users,id'],
            'tanggal_closing' => ['required', 'date'],
            'nilai' => ['nullable', 'numeric', 'min:0'],
            'status_pembayaran' => ['nullable', 'string', 'max:100'],
            'catatan' => ['nullable', 'string'],
        ]);

        $closing = LaporanClosing::updateOrCreate(
            ['calon_jemaah_id' => $validated['calon_jemaah_id']],
            $validated
        );

        ActivityLogService::record(null, 'Mencatat laporan closing', $closing, [
            'calon_jemaah_id' => $closing->calon_jemaah_id,
        ]);

        return response()->json([
            'message' => 'Laporan closing berhasil disimpan.',
            'data' => $this->toPayload($closing->load(['calonJemaah:id,nama,kontak', 'staff:id,name'])),
        ], 201);
    }

    public function show(LaporanClosing $laporanClosing): JsonResponse
    {
        return response()->json([
            'data' => $this->toPayload($laporanClosing->load(['calonJemaah:id,nama,kontak', 'staff:id,name'])),
        ]);
    }

    public function update(Request $request, LaporanClosing $laporanClosing): JsonResponse
    {
        $validated = $request->validate([
            'calon_jemaah_id' => ['sometimes', 'required', 'exists:calon_jemaahs,id'],
            'staff_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'tanggal_closing' => ['sometimes', 'required', 'date'],
            'nilai' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status_pembayaran' => ['sometimes', 'nullable', 'string', 'max:100'],
            'catatan' => ['sometimes', 'nullable', 'string'],
        ]);

        $laporanClosing->fill($validated)->save();

        ActivityLogService::record(null, 'Memperbarui laporan closing', $laporanClosing);

        return response()->json([
            'message' => 'Laporan closing berhasil diperbarui.',
            'data' => $this->toPayload($laporanClosing->fresh()->load(['calonJemaah:id,nama,kontak', 'staff:id,name'])),
        ]);
    }

    public function destroy(LaporanClosing $laporanClosing): JsonResponse
    {
        ActivityLogService::record(null, 'Menghapus laporan closing', $laporanClosing);
        $laporanClosing->delete();

        return response()->json(['message' => 'Laporan closing berhasil dihapus.']);
    }

    private function toPayload(LaporanClosing $item): array
    {
        return [
            'id' => $item->id,
            'calon_jemaah_id' => $item->calon_jemaah_id,
            'calon_jemaah' => $item->calonJemaah?->nama,
            'kontak' => $item->calonJemaah?->kontak,
            'staff' => $item->staff?->name,
            'tanggal_closing' => $item->tanggal_closing?->format('d M Y'),
            'nilai' => $item->nilai,
            'status_pembayaran' => $item->status_pembayaran,
            'catatan' => $item->catatan,
        ];
    }
}
