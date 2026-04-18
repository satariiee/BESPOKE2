<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalonJemaah;
use App\Models\JadwalFollowUp;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JadwalFollowUpController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JadwalFollowUp::query()->with(['calonJemaah:id,nama,kontak', 'staff:id,name', 'statusKomunikasi']);

        $user = $request->user();
        if ($user?->role === 'staff') {
            $query->where('staff_id', $user->id);
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        if ($staffId = $request->integer('staff_id')) {
            $query->where('staff_id', $staffId);
        }

        if ($metode = $request->string('metode')->trim()->toString()) {
            $query->where('metode', $metode);
        }

        return response()->json([
            'data' => $query->latest('tanggal')->get()->map(fn (JadwalFollowUp $item) => $this->toPayload($item)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'calon_jemaah_id' => [
                'required',
                'exists:calon_jemaahs,id',
                Rule::unique('jadwal_follow_ups', 'calon_jemaah_id'),
            ],
            'staff_id' => ['nullable', 'exists:users,id'],
            'tanggal' => ['required', 'date'],
            'metode' => ['required', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['Pending', 'In Progress', 'Done'])],
            'catatan' => ['nullable', 'string'],
        ]);

        $jadwal = JadwalFollowUp::create([
            ...$validated,
            'status' => $validated['status'] ?? 'Pending',
        ]);

        $calonJemaah = CalonJemaah::find($validated['calon_jemaah_id']);
        if ($calonJemaah) {
            $calonJemaah->update([
                'staff_id' => $validated['staff_id'] ?? $calonJemaah->staff_id,
                'last_follow_up_at' => $validated['tanggal'],
            ]);
        }

        ActivityLogService::record($request->user(), 'Membuat jadwal follow up', $jadwal, [
            'calon_jemaah_id' => $jadwal->calon_jemaah_id,
        ]);

        return response()->json([
            'message' => 'Jadwal follow up berhasil dibuat.',
            'data' => $this->toPayload($jadwal->load(['calonJemaah:id,nama,kontak', 'staff:id,name', 'statusKomunikasi'])),
        ], 201);
    }

    public function show(JadwalFollowUp $jadwalFollowUp): JsonResponse
    {
        return response()->json([
            'data' => $this->toPayload($jadwalFollowUp->load(['calonJemaah:id,nama,kontak', 'staff:id,name', 'statusKomunikasi'])),
        ]);
    }

    public function update(Request $request, JadwalFollowUp $jadwalFollowUp): JsonResponse
    {
        $validated = $request->validate([
            'calon_jemaah_id' => [
                'sometimes',
                'required',
                'exists:calon_jemaahs,id',
                Rule::unique('jadwal_follow_ups', 'calon_jemaah_id')->ignore($jadwalFollowUp->id),
            ],
            'staff_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'tanggal' => ['sometimes', 'required', 'date'],
            'metode' => ['sometimes', 'required', 'string', 'max:100'],
            'status' => ['sometimes', 'required', Rule::in(['Pending', 'In Progress', 'Done'])],
            'catatan' => ['sometimes', 'nullable', 'string'],
        ]);

        $jadwalFollowUp->fill($validated)->save();

        if (array_key_exists('staff_id', $validated) || array_key_exists('tanggal', $validated)) {
            $jadwalFollowUp->calonJemaah?->update([
                'staff_id' => $validated['staff_id'] ?? $jadwalFollowUp->calonJemaah?->staff_id,
                'last_follow_up_at' => $validated['tanggal'] ?? $jadwalFollowUp->tanggal,
            ]);
        }

        ActivityLogService::record($request->user(), 'Memperbarui jadwal follow up', $jadwalFollowUp, [
            'status' => $jadwalFollowUp->status,
        ]);

        return response()->json([
            'message' => 'Jadwal follow up berhasil diperbarui.',
            'data' => $this->toPayload($jadwalFollowUp->fresh()->load(['calonJemaah:id,nama,kontak', 'staff:id,name', 'statusKomunikasi'])),
        ]);
    }

    public function destroy(JadwalFollowUp $jadwalFollowUp): JsonResponse
    {
        ActivityLogService::record($request->user(), 'Menghapus jadwal follow up', $jadwalFollowUp);
        $jadwalFollowUp->delete();

        return response()->json(['message' => 'Jadwal follow up berhasil dihapus.']);
    }

    private function toPayload(JadwalFollowUp $item): array
    {
        return [
            'id' => $item->id,
            'calon_jemaah_id' => $item->calon_jemaah_id,
            'calon_jemaah' => $item->calonJemaah?->nama,
            'kontak' => $item->calonJemaah?->kontak,
            'staff_id' => $item->staff_id,
            'staff' => $item->staff?->name,
            'tanggal' => $item->tanggal?->format('d M Y'),
            'metode' => $item->metode,
            'status' => $item->status,
            'catatan' => $item->catatan,
            'status_komunikasi' => $item->statusKomunikasi?->status,
        ];
    }
}
