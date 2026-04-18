<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated',
                'errors' => [
                    'authorization' => ['Unauthorized']
                ]
            ], 401);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role Anda tidak memiliki izin untuk mengakses resource ini.',
                'errors' => [
                    'authorization' => ['Unauthorized']
                ]
            ], 403);
        }

        return $next($request);
    }
}
