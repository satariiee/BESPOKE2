<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()->with('user:id,name');

        $user = $request->user();
        if ($user?->role === 'staff') {
            $query->where('user_id', $user->id);
        }

        if ($userId = $request->integer('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where('aktivitas', 'like', "%{$search}%");
        }

        return response()->json([
            'data' => $query->latest()->get()->map(fn (ActivityLog $log) => $this->toPayload($log)),
        ]);
    }

    public function show(ActivityLog $activityLog): JsonResponse
    {
        return response()->json([
            'data' => $this->toPayload($activityLog->load('user:id,name')),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'aktivitas' => ['required', 'string', 'max:255'],
            'subject_type' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['nullable', 'integer'],
            'metadata' => ['nullable', 'array'],
        ]);

        $log = ActivityLog::create([
            'user_id' => $validated['user_id'] ?? null,
            'aktivitas' => $validated['aktivitas'],
            'subject_type' => $validated['subject_type'] ?? null,
            'subject_id' => $validated['subject_id'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json([
            'message' => 'Activity log berhasil disimpan.',
            'data' => $this->toPayload($log->load('user:id,name')),
        ], 201);
    }

    public function destroy(ActivityLog $activityLog): JsonResponse
    {
        $activityLog->delete();

        return response()->json(['message' => 'Activity log berhasil dihapus.']);
    }

    private function toPayload(ActivityLog $log): array
    {
        return [
            'id' => $log->id,
            'user' => $log->user?->name,
            'aktivitas' => $log->aktivitas,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'metadata' => $log->metadata,
            'created_at' => $log->created_at?->format('d M Y H:i'),
        ];
    }
}
