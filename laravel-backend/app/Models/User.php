<?php
// ── User.php ───────────────────────────────────────────────
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'address', 'password', 'role',
    ];
    protected $hidden = ['password', 'remember_token'];
    protected $casts  = ['password' => 'hashed'];

    public function resident() { return $this->hasOne(Resident::class); }
    public function admin()    { return $this->hasOne(Admin::class); }
}
