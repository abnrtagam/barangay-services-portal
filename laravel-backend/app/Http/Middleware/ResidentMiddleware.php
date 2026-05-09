<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ResidentMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'resident') {
            return response()->json(['message' => 'Forbidden. Resident access only.'], 403);
        }
        return $next($request);
    }
}
