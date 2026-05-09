<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    protected $fillable = [
        'resident_id', 'category_id', 'subject',
        'details', 'attachment_path', 'status', 'admin_remarks',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function category()
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }
}
