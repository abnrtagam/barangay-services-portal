<?php

namespace App\Http\Controllers;

class PostController extends Controller
{
    public function show($name)
    {
        $posts = [
            ['title' => 'How to Register as a Resident in the Barangay Portal'],
            ['title' => 'How to File a Complaint Online in the Barangay System'],
            ['title' => 'How to Book an Appointment at the Barangay Hall'],
            ['title' => 'How to Track Your Complaint Status in Real Time'],
            ['title' => 'How Admins Manage Complaints and Generate Reports'],
        ];

        return view('posts.show', compact('posts', 'name'));
    }
}