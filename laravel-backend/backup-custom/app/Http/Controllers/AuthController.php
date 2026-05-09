<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Resident;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // POST /api/auth/register
    public function register(Request $request)
    {
        $v = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'phone'      => 'required|string|max:20',
            'address'    => 'required|string',
            'password'   => 'required|string|min:8|confirmed',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first()], 422);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'address'    => $request->address,
            'password'   => Hash::make($request->password),
            'role'       => 'resident',
        ]);

        Resident::create(['user_id' => $user->id]);

        return response()->json(['message' => 'Registration successful.'], 201);
    }

    // POST /api/auth/login
    public function login(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('role', 'resident')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token    = $user->createToken('resident-token')->plainTextToken;
        $resident = Resident::where('user_id', $user->id)->first();

        return response()->json([
            'token' => $token,
            'user'  => array_merge($user->toArray(), ['resident_id' => $resident?->id]),
        ]);
    }

    // POST /api/auth/admin-login
    public function adminLogin(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first()], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('role', 'admin')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        $token = $user->createToken('admin-token')->plainTextToken;
        $admin = Admin::where('user_id', $user->id)->first();

        return response()->json([
            'token' => $token,
            'user'  => array_merge($user->toArray(), [
                'admin_id' => $admin?->id,
                'name'     => $user->first_name . ' ' . $user->last_name,
            ]),
        ]);
    }
}
