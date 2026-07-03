<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingResource;
use Illuminate\Support\Facades\Storage;

class LearningResourceController extends Controller
{
public function download(TrainingResource $resource)
{
    $lesson = $resource->lesson()->with('training')->firstOrFail();
    $training = $lesson->training;

    abort_unless($resource->is_downloadable, 403, 'Cette ressource ne peut pas être téléchargée.');

    if (!($resource->is_public ?? false)) {
        $this->authorizeAccess($training);
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

private function authorizeAccess(Training $training): void
{
    $user = auth()->user();

    abort_unless($user, 403);

    if ($user->is_admin ?? false) {
        return;
    }

    $query = TrainingParticipant::where('training_id', $training->id)
        ->where('user_id', $user->id)
        ->whereIn('status', [
            TrainingParticipant::STATUS_REGISTERED,
            TrainingParticipant::STATUS_CONFIRMED,
            TrainingParticipant::STATUS_IN_PROGRESS,
            TrainingParticipant::STATUS_COMPLETED,
        ]);

    if ((float) $training->price > 0) {
        $query->where('payment_confirmed', true);
    }

    abort_unless($query->exists(), 403);
}
}