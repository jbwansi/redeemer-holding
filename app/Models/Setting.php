<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'type',
        'value',
    ];

    // 🔹 Lire une valeur
    public static function getValue(string $key, $default = null)
    {
        return static::query()
            ->where('key', $key)
            ->value('value') ?? $default;
    }

    // 🔹 Sauvegarder une valeur
    public static function setValue(string $key, $value, string $type = 'string')
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
            ]
        );
    }
}