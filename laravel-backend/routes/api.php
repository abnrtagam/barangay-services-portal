<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes — Barangay Complaint & Appointment System
|--------------------------------------------------------------------------
*/

// ── Public Routes ────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register',    [AuthController::class, 'register']);
    Route::post('/login',       [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
});

// ── Authenticated Resident Routes ────────────────────────────
Route::middleware(['auth:sanctum', 'role:resident'])->group(function () {
    Route::get('/residents/dashboard-stats', [ResidentController::class, 'dashboardStats']);
    Route::get('/residents/complaints',      [ComplaintController::class, 'myComplaints']);
    Route::get('/residents/appointments',    [AppointmentController::class, 'myAppointments']);

    Route::get('/complaints/categories',     [ComplaintController::class, 'categories']);
    Route::post('/complaints',               [ComplaintController::class, 'store']);

    Route::get('/appointments/taken-slots',  [AppointmentController::class, 'takenSlots']);
    Route::post('/appointments',             [AppointmentController::class, 'store']);

    Route::get('/announcements',             [AnnouncementController::class, 'index']);
});

// ── Authenticated Admin Routes ───────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);

    // Complaints
    Route::get('/complaints',              [AdminController::class, 'indexComplaints']);
    Route::patch('/complaints/{id}/status',[AdminController::class, 'updateComplaintStatus']);

    // Appointments
    Route::get('/appointments',               [AdminController::class, 'indexAppointments']);
    Route::patch('/appointments/{id}/status', [AdminController::class, 'updateAppointmentStatus']);

    // Residents
    Route::get('/residents', [AdminController::class, 'indexResidents']);

    // Announcements
    Route::post('/announcements',       [AnnouncementController::class, 'store']);
    Route::put('/announcements/{id}',   [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{id}',[AnnouncementController::class, 'destroy']);

    // Reports
    Route::get('/reports',        [AdminController::class, 'reports']);
    Route::get('/reports/export', [AdminController::class, 'exportReport']);
});
