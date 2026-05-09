<?php

namespace App\Http\Controllers;

use App\Models\{Resident, Complaint, Appointment};
use Illuminate\Http\Request;
use Carbon\Carbon;

class ResidentController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $resident = Resident::where('user_id', $request->user()->id)->firstOrFail();
        $rid      = $resident->id;

        return response()->json([
            'totalComplaints'       => Complaint::where('resident_id', $rid)->count(),
            'pendingComplaints'     => Complaint::where('resident_id', $rid)->where('status', 'Pending')->count(),
            'totalAppointments'     => Appointment::where('resident_id', $rid)->count(),
            'upcomingAppointments'  => Appointment::where('resident_id', $rid)
                ->where('appointment_date', '>=', Carbon::today())
                ->whereIn('status', ['Pending', 'Approved'])
                ->count(),
        ]);
    }
}
