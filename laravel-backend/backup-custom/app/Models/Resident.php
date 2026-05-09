<?php
// ── Resident.php ───────────────────────────────────────────
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model {
    protected $fillable = ['user_id'];
    public function user()         { return $this->belongsTo(User::class); }
    public function complaints()   { return $this->hasMany(Complaint::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
}
