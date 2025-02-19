<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
class EventCategory extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'description', 'color'];

    protected static function boot()
    {
        parent::boot();
        static::creating(fn($category) => $category->slug = rand(1000, 9999) . Str::slug($category->name));
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'category_id')->where('is_published', 1);
    }
}
