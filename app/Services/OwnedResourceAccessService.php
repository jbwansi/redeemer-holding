<?php

namespace App\Services;

use App\Models\EventParticipant;
use App\Models\ServiceRequest;
use App\Models\TrainingParticipant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use InvalidArgumentException;

class OwnedResourceAccessService
{
    public function authorize(Model $resource, string $ability = 'view'): void
    {
        if (auth()->check()) {
            Gate::forUser(auth()->user())->authorize($ability, $resource);

            return;
        }

        abort_unless(session()->has($this->guestSessionKey($resource)), 403);
    }

    private function guestSessionKey(Model $resource): string
    {
        return match (true) {
            $resource instanceof EventParticipant,
            $resource instanceof TrainingParticipant => 'temp_participant_' . $resource->getKey(),
            $resource instanceof ServiceRequest => 'temp_service_request_' . $resource->getKey(),
            default => throw new InvalidArgumentException(
                'Unsupported owned resource: ' . $resource::class
            ),
        };
    }
}
