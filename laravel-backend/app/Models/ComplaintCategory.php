<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintCategory extends Model
{
    protected $fillable = ['name', 'description'];

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'category_id');
    }
}
