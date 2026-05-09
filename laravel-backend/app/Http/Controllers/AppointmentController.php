<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    // GET /api/appointments/taken-slots?date=YYYY-MM-DD
    public function takenSlots(Request $request)
    {
        $date = $request->query('date');
        if (!$date) return response()->json(['message' => 'Date required.'], 422);

        $slots = Appointment::where('appointment_date', $date)
            ->whereNotIn('status', ['Cancelled', 'Rejected'])
            ->pluck('time_slot');

        return response()->json($slots);
    }

    // POST /api/appointments
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'appointment_date' => 'required|date|after:today',
            'time_slot'        => 'required|string',
            'purpose'          => 'required|string|min:5',
            'notes'            => 'nullable|string|max:500',
        ]);
        if ($v->fails()) return response()->json(['message' => $v->errors()->first()], 422);

        // Reject weekends
        $dow = Carbon::parse($request->appointment_date)->dayOfWeek;
        if ($dow === 0 || $dow === 6) {
            return response()->json(['message' => 'Appointments are only on weekdays.'], 422);
        }

        $resident = Resident::where('user_id', $request->user()->id)->firstOrFail();

        // Check slot availability
        $taken = Appointment::where('appointment_date', $request->appointment_date)
            ->where('time_slot', $request->time_slot)
            ->whereNotIn('status', ['Cancelled', 'Rejected'])
            ->exists();
        if ($taken) return response()->json(['message' => 'This slot is already taken.'], 409);

        // One appointment per day per resident
        $dup = Appointment::where('resident_id', $resident->id)
            ->where('appointment_date', $request->appointment_date)
            ->whereNotIn('status', ['Cancelled', 'Rejected'])
            ->exists();
        if ($dup) return response()->json(['message' => 'You already have an appointment on this date.'], 409);

        Appointment::create([
            'resident_id'      => $resident->id,
            'appointment_date' => $request->appointment_date,
            'time_slot'        => $request->time_slot,
            'purpose'          => $request->purpose,
            'notes'            => $request->notes,
            'status'           => 'Pending',
        ]);

        return response()->json(['message' => 'Appointment booked successfully.'], 201);
    }

    // GET /api/residents/appointments
    public function myAppointments(Request $request)
    {
        $resident = Resident::where('user_id', $request->user()->id)->firstOrFail();
        $query    = Appointment::where('resident_id', $resident->id);

        if ($request->status) $query->where('status', $request->status);

        $limit = (int) ($request->limit ?? 50);
        $page  = (int) ($request->page  ?? 1);
        $total = $query->count();
        $data  = $query->orderByDesc('appointment_date')->skip(($page - 1) * $limit)->take($limit)->get();

        return response()->json(compact('data', 'total', 'page', 'limit'));
    }
}
