<?php

namespace App\Coach\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CoachDataPurgeService
{
    public function purge(User $user): void
    {
        $documents = $user->coachDocuments()->get(['id', 'disk', 'path']);

        DB::transaction(function () use ($user): void {
            $user->coachAnalyses()->delete();
            $user->interviewSimulations()->delete();
            $user->careerGoals()->delete();
            $user->coachConversations()->delete();
            $user->coachUsages()->delete();
            $user->coachDocuments()->delete();
            $user->professionalProfile()->delete();
        });

        foreach ($documents as $document) {
            Storage::disk($document->disk)->delete($document->path);
        }
    }
}
