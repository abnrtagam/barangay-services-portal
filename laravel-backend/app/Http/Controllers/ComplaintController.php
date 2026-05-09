<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ComplaintController extends Controller
{
    // GET /api/complaints/categories
    public function categories()
    {
        return response()->json(ComplaintCategory::orderBy('name')->get());
    }

    // POST /api/complaints
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'category_id' => 'required|exists:complaint_categories,id',
            'subject'     => 'required|string|min:5|max:200',
            'details'     => 'required|string|min:20',
            'attachment'  => 'nullable|file|max:5120|mimes:jpg,jpeg,png,pdf,doc,docx',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first()], 422);
        }

        $resident = Resident::where('user_id', $request->user()->id)->firstOrFail();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('complaints', 'public');
        }

        Complaint::create([
            'resident_id'     => $resident->id,
            'category_id'     => $request->category_id,
            'subject'         => $request->subject,
            'details'         => $request->details,
            'attachment_path' => $attachmentPath,
            'status'          => 'Pending',
        ]);

        return response()->json(['message' => 'Complaint submitted successfully.'], 201);
    }

    // GET /api/residents/complaints
    public function myComplaints(Request $request)
    {
        $resident = Resident::where('user_id', $request->user()->id)->firstOrFail();

        $query = Complaint::with('category')
            ->where('resident_id', $resident->id);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->search) {
            $query->where('subject', 'like', '%' . $request->search . '%');
        }

        $limit  = (int) ($request->limit ?? 50);
        $page   = (int) ($request->page  ?? 1);
        $total  = $query->count();
        $data   = $query->latest()->skip(($page - 1) * $limit)->take($limit)->get()
            ->map(fn($c) => array_merge($c->toArray(), ['category_name' => $c->category->name ?? '']));

        return response()->json(compact('data', 'total', 'page', 'limit'));
    }
}
