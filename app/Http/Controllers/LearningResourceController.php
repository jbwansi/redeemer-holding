<?php

namespace App\Http\Controllers;

use App\Models\TrainingResource;
use App\Services\LearningProgressService;
use Illuminate\Support\Facades\Storage;

class LearningResourceController extends Controller
{
public function download(TrainingResource $resource)
{
    $lesson = $resource->lesson()->with('training')->firstOrFail();
    $training = $lesson->training;

    abort_unless($resource->is_downloadable, 403, 'Cette ressource ne peut pas être téléchargée.');

    if (!($resource->is_public ?? false)) {
        app(LearningProgressService::class)->ensureTrainingAccess($training, auth()->user());
    }

    if (!empty($resource->external_url) && empty($resource->file_path)) {
        return redirect()->away($resource->external_url);
    }

    abort_if(empty($resource->file_path), 404, 'Fichier introuvable.');

    $disk = $resource->file_disk ?: 'public';
    $filesystem = Storage::disk($disk);

    abort_unless($filesystem->exists($resource->file_path), 404, 'Fichier introuvable.');

    return response()->download(
        $filesystem->path($resource->file_path),
        $resource->title
    );
}

}
