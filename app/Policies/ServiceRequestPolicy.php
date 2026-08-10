<?php

namespace App\Policies;

use App\Models\ServiceRequest;
use App\Models\User;

class ServiceRequestPolicy
{
    public function view(User $user, ServiceRequest $serviceRequest): bool
    {
        return $user->can('administer')
            || ($serviceRequest->user_id !== null
                && (int) $serviceRequest->user_id === (int) $user->id);
    }

    public function update(User $user, ServiceRequest $serviceRequest): bool
    {
        return $this->view($user, $serviceRequest);
    }
}
