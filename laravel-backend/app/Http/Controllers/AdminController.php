<?php

namespace App\Http\Controllers;

use App\Models\{Complaint, Appointment, Resident, Announcement, ComplaintCategory, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'totalResidents'        => Resident::count(),
            'totalComplaints'       => Complaint::count(),
            'pendingComplaints'     => Complaint::where('status', 'Pending')->count(),
            'approvedComplaints'    => Complaint::where('status', 'Approved')->count(),
            'scheduledComplaints'   => Complaint::where('status', 'Scheduled')->count(),
            'resolvedComplaints'    => Complaint::where('status', 'Resolved')->count(),
            'rejectedComplaints'    => Complaint::where('status', 'Rejected')->count(),
            'totalAppointments'     => Appointment::count(),
            'pendingAppointments'   => Appointment::where('status', 'Pending')->count(),
            'approvedAppointments'  => Appointment::where('status', 'Approved')->count(),
            'completedAppointments' => Appointment::where('status', 'Completed')->count(),
            'cancelledAppointments' => Appointment::where('status', 'Cancelled')->count(),
            'rejectedAppointments'  => Appointment::where('status', 'Rejected')->count(),
        ]);
    }

    // ── Complaints ──────────────────────────────────────────────
    public function indexComplaints(Request $request)
    {
        $q = Complaint::with(['category', 'resident.user'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date,   fn($q) => $q->whereDate('created_at', $request->date))
            ->when($request->search, fn($q) => $q->whereHas('resident.user', fn($u) =>
                $u->where(DB::raw("CONCAT(first_name,' ',last_name)"), 'like', "%{$request->search}%")
            )->orWhere('subject', 'like', "%{$request->search}%"));

        $limit = (int) ($request->limit ?? 50);
        $page  = (int) ($request->page  ?? 1);
        $total = $q->count();
        $data  = $q->latest()->skip(($page - 1) * $limit)->take($limit)->get()
            ->map(fn($c) => array_merge($c->toArray(), [
                'category_name' => $c->category->name ?? '',
                'resident_name' => $c->resident?->user
                    ? $c->resident->user->first_name . ' ' . $c->resident->user->last_name : 'N/A',
            ]));

        return response()->json(compact('data', 'total'));
    }

    public function updateComplaintStatus(Request $request, $id)
    {
        $valid = ['Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected'];
        if (!in_array($request->status, $valid)) {
            return response()->json(['message' => 'Invalid status.'], 422);
        }
        $complaint = Complaint::findOrFail($id);
        $complaint->update(['status' => $request->status, 'admin_remarks' => $request->admin_remarks]);
        return response()->json(['message' => 'Complaint updated.']);
    }

    // ── Appointments ────────────────────────────────────────────
    public function indexAppointments(Request $request)
    {
        $q = Appointment::with(['resident.user'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->date,   fn($q) => $q->where('appointment_date', $request->date));

        $limit = (int) ($request->limit ?? 50);
        $page  = (int) ($request->page  ?? 1);
        $total = $q->count();
        $data  = $q->orderByDesc('appointment_date')->skip(($page - 1) * $limit)->take($limit)->get()
            ->map(fn($a) => array_merge($a->toArray(), [
                'resident_name' => $a->resident?->user
                    ? $a->resident->user->first_name . ' ' . $a->resident->user->last_name : 'N/A',
            ]));

        return response()->json(compact('data', 'total'));
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
        $valid = ['Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];
        if (!in_array($request->status, $valid)) {
            return response()->json(['message' => 'Invalid status.'], 422);
        }
        Appointment::findOrFail($id)->update(['status' => $request->status, 'admin_remarks' => $request->admin_remarks]);
        return response()->json(['message' => 'Appointment updated.']);
    }

    // ── Residents ───────────────────────────────────────────────
    public function indexResidents(Request $request)
    {
        $q = User::where('role', 'resident')
            ->when($request->search, fn($q) =>
                $q->where(fn($w) =>
                    $w->where('first_name', 'like', "%{$request->search}%")
                      ->orWhere('last_name',  'like', "%{$request->search}%")
                      ->orWhere('email',       'like', "%{$request->search}%")
                      ->orWhere('phone',       'like', "%{$request->search}%")
                )
            );

        $limit = (int) ($request->limit ?? 50);
        $page  = (int) ($request->page  ?? 1);
        $total = $q->count();
        $data  = $q->latest()->skip(($page - 1) * $limit)->take($limit)->get()
            ->makeHidden('password');

        return response()->json(compact('data', 'total'));
    }

    // ── Reports ─────────────────────────────────────────────────
    public function reports(Request $request)
    {
        $from = $request->from;
        $to   = $request->to;

        $cBase = Complaint::query()
            ->when($from && $to, fn($q) => $q->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]));
        $aBase = Appointment::query()
            ->when($from && $to, fn($q) => $q->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]));

        $byCategory = ComplaintCategory::withCount([
            'complaints as total',
            'complaints as pending'  => fn($q) => $q->where('status', 'Pending'),
            'complaints as resolved' => fn($q) => $q->where('status', 'Resolved'),
        ])->get();

        return response()->json([
            'totalResidents'        => Resident::count(),
            'totalComplaints'       => (clone $cBase)->count(),
            'pendingComplaints'     => (clone $cBase)->where('status', 'Pending')->count(),
            'approvedComplaints'    => (clone $cBase)->where('status', 'Approved')->count(),
            'scheduledComplaints'   => (clone $cBase)->where('status', 'Scheduled')->count(),
            'resolvedComplaints'    => (clone $cBase)->where('status', 'Resolved')->count(),
            'rejectedComplaints'    => (clone $cBase)->where('status', 'Rejected')->count(),
            'totalAppointments'     => (clone $aBase)->count(),
            'pendingAppointments'   => (clone $aBase)->where('status', 'Pending')->count(),
            'approvedAppointments'  => (clone $aBase)->where('status', 'Approved')->count(),
            'completedAppointments' => (clone $aBase)->where('status', 'Completed')->count(),
            'cancelledAppointments' => (clone $aBase)->where('status', 'Cancelled')->count(),
            'rejectedAppointments'  => (clone $aBase)->where('status', 'Rejected')->count(),
            'complaintsByCategory'  => $byCategory,
        ]);
    }

    public function exportReport(Request $request)
    {
        $type = $request->query('type', 'complaints');
        if ($type === 'complaints') {
            $rows = Complaint::with(['category', 'resident.user'])->latest()->get();
            $csv  = "ID,Resident,Category,Subject,Status,Filed\n";
            foreach ($rows as $c) {
                $name = $c->resident?->user ? $c->resident->user->first_name . ' ' . $c->resident->user->last_name : 'N/A';
                $csv .= "\"{$c->id}\",\"{$name}\",\"{$c->category->name}\",\"{$c->subject}\",\"{$c->status}\",\"{$c->created_at}\"\n";
            }
        } else {
            $rows = Appointment::with(['resident.user'])->orderByDesc('appointment_date')->get();
            $csv  = "ID,Resident,Date,Time Slot,Purpose,Status,Booked\n";
            foreach ($rows as $a) {
                $name = $a->resident?->user ? $a->resident->user->first_name . ' ' . $a->resident->user->last_name : 'N/A';
                $csv .= "\"{$a->id}\",\"{$name}\",\"{$a->appointment_date}\",\"{$a->time_slot}\",\"{$a->purpose}\",\"{$a->status}\",\"{$a->created_at}\"\n";
            }
        }
        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename={$type}-report.csv",
        ]);
    }
}
