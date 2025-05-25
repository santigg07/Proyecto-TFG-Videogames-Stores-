<?php
// app/Models/Role.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con usuarios
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Constantes para roles
     */
    const ADMIN = 'admin';
    const CUSTOMER = 'customer';

    /**
     * Scope para obtener rol admin
     */
    public function scopeAdmin($query)
    {
        return $query->where('name', self::ADMIN);
    }

    /**
     * Scope para obtener rol customer
     */
    public function scopeCustomer($query)
    {
        return $query->where('name', self::CUSTOMER);
    }
}