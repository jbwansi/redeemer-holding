<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('page_contents', function (Blueprint $table) {
    $table->id();
    $table->string('page'); // services, trainings, events
    $table->string('key');  // hero_title, hero_subtitle...
    $table->text('value')->nullable();
    $table->timestamps();

    $table->unique(['page', 'key']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_contents');
    }
};
