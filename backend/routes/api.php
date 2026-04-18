<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalonJemaahController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JadwalFollowUpController;
use App\Http\Controllers\Api\LaporanClosingController;
use App\Http\Controllers\Api\StatusKomunikasiController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Health check (no auth required)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'jemaah-follow-up-api',
    ]);
});

// Public authentication routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/refresh-token', [AuthController::class, 'refresh']);

    // Dashboard (accessible to all authenticated users)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Activity Log (accessible to all authenticated users)
    Route::apiResource('activity-log', ActivityLogController::class)->only(['index', 'show', 'store', 'destroy']);

    // User management (Admin only)
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('/calon-jemaah/import/preview', [CalonJemaahController::class, 'importPreview']);
        Route::post('/calon-jemaah/import/commit', [CalonJemaahController::class, 'importCommit']);
    });

    // Resources accessible to both admin and staff
    Route::apiResource('calon-jemaah', CalonJemaahController::class);
    Route::apiResource('jadwal-follow-up', JadwalFollowUpController::class);
    Route::apiResource('status-komunikasi', StatusKomunikasiController::class);
    Route::apiResource('laporan-closing', LaporanClosingController::class);
});
