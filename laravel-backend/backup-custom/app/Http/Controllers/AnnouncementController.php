<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $limit  = (int) ($request->limit ?? 30);
        $page   = (int) ($request->page  ?? 1);
        $total  = Announcement::count();
        $data   = Announcement::with('creator')
            ->latest()
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->map(fn($a) => array_merge($a->toArray(), [
                'posted_by' => $a->creator ? $a->creator->first_name . ' ' . $a->creator->last_name : 'Admin',
            ]));
        return response()->json(compact('data', 'total'));
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'title'    => 'required|string|max:200',
            'content'  => 'required|string',
            'priority' => 'nullable|in:Normal,Medium,High',
        ]);
        if ($v->fails()) return response()->json(['message' => $v->errors()->first()], 422);

        Announcement::create([
            'title'      => $request->title,
            'content'    => $request->content,
            'priority'   => $request->priority ?? 'Normal',
            'created_by' => $request->user()->id,
        ]);
        return response()->json(['message' => 'Announcement posted.'], 201);
    }

    public function update(Request $request, $id)
    {
        $ann = Announcement::findOrFail($id);
        $ann->update([
            'title'    => $request->title    ?? $ann->title,
            'content'  => $request->content  ?? $ann->content,
            'priority' => $request->priority ?? $ann->priority,
        ]);
        return response()->json(['message' => 'Updated.']);
    }

    public function destroy($id)
    {
        Announcement::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
