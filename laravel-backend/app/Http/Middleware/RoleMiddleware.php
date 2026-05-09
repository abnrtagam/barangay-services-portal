<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (! $request->user() || $request->user()->role !== $role) {
            return response()->json(['message' => 'Forbidden. '.$role.' access only.'], 403);
        }

        return $next($request);
    }
}
