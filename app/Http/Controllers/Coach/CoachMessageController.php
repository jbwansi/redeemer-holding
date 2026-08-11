<?php

namespace App\Http\Controllers\Coach;

use App\Coach\Services\DigitalCoachService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Coach\StoreCoachMessageRequest;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class CoachMessageController extends Controller
{
    public function store(StoreCoachMessageRequest $request, int $conversation, DigitalCoachService $coach)
    {
        $model = $request->user()->coachConversations()->findOrFail($conversation);
        $this->authorize('update', $model);

        try {
            $coach->respond(
                $request->user(),
                $model,
                $request->validated('content'),
                $request->validated('document_ids', []),
            );

            return back();
        } catch (RuntimeException $exception) {
            if ($exception instanceof HttpExceptionInterface) {
                throw $exception;
            }

            return back()->with('error', 'Le Coach est temporairement indisponible. Veuillez reessayer.');
        }
    }
}
