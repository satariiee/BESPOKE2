<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsStaff
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'staff') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya staff yang dapat mengakses resource ini.',
                'errors' => [
                    'authorization' => ['Unauthorized']
                ]
            ], 403);
        }

        return $next($request);
    }
}
