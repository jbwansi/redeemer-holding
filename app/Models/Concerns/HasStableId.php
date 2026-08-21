<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasStableId
{
    protected static function bootHasStableId(): void
    {
        static::creating(function ($model): void {
            if (blank($model->stable_id)) {
                $model->stable_id = (string) Str::uuid();
            }
        });
    }
}
