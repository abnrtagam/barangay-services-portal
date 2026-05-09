<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'resident_id', 'appointment_date', 'time_slot',
        'purpose', 'notes', 'status', 'admin_remarks',
    ];

    protected $casts = [
        'appointment_date' => 'date:Y-m-d',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
}
