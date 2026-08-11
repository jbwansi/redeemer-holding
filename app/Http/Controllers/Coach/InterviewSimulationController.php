<?php

namespace App\Http\Controllers\Coach;

use App\Coach\Services\CoachSettingsService;
use App\Coach\Services\InterviewCoachService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Coach\StoreInterviewAnswerRequest;
use App\Http\Requests\Coach\StoreInterviewSimulationRequest;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class InterviewSimulationController extends Controller
{
    public function index(Request $request, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $simulations = $request->user()->interviewSimulations()->withCount(['turns', 'turns as answered_turns_count' => fn ($query) => $query->whereNotNull('answered_at')])->latest()->get();
        return inertia('Frontend/Coach/Interviews/Index', ['simulations' => $simulations]);
    }

    public function create(Request $request, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        return inertia('Frontend/Coach/Interviews/Create', [
            'documents' => $request->user()->coachDocuments()->whereIn('type', ['cv', 'job_offer', 'job_description'])->get(['id', 'type', 'original_name']),
            'languages' => $settings->all()['languages'], 'defaultLanguage' => $settings->all()['default_language'],
        ]);
    }

    public function store(StoreInterviewSimulationRequest $request, InterviewCoachService $service)
    {
        try {
            $simulation = $service->create($request->user(), $request->validated());
            return redirect()->route('coach.interviews.show', $simulation);
        } catch (RuntimeException $exception) {
            if ($exception instanceof HttpExceptionInterface) { throw $exception; }
            return back()->withInput()->with('error', 'La préparation de l’entretien a échoué. Vous pourrez réessayer.');
        }
    }

    public function show(Request $request, int $simulation, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $model = $request->user()->interviewSimulations()->with('turns')->findOrFail($simulation);
        $this->authorize('view', $model);
        if ($model->status === 'completed') { return redirect()->route('coach.interviews.debrief', $model); }
        return inertia('Frontend/Coach/Interviews/Show', ['simulation' => $model, 'progress' => $model->progressPercentage(), 'currentTurn' => $model->currentTurn()]);
    }

    public function retry(Request $request, int $simulation, InterviewCoachService $service)
    {
        $model = $request->user()->interviewSimulations()->findOrFail($simulation);
        try { $service->prepare($request->user(), $model); return redirect()->route('coach.interviews.show', $model); }
        catch (RuntimeException $exception) { if ($exception instanceof HttpExceptionInterface) { throw $exception; } return back()->with('error', 'La préparation reste indisponible. Réessayez plus tard.'); }
    }

    public function answer(StoreInterviewAnswerRequest $request, int $simulation, InterviewCoachService $service)
    {
        $model = $request->user()->interviewSimulations()->findOrFail($simulation);
        try {
            $updated = $service->answer($request->user(), $model, $request->validated('answer'), $request->validated('submission_token'));
            return $updated->status === 'completed' ? redirect()->route('coach.interviews.debrief', $updated) : back();
        } catch (RuntimeException $exception) {
            if ($exception instanceof HttpExceptionInterface) { throw $exception; }
            return back()->withInput()->with('error', 'Le feedback est indisponible. Votre progression est conservée.');
        }
    }

    public function debrief(Request $request, int $simulation, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $model = $request->user()->interviewSimulations()->with('turns')->findOrFail($simulation);
        $this->authorize('view', $model); abort_unless($model->status === 'completed', 404);
        return inertia('Frontend/Coach/Interviews/Debrief', ['simulation' => $model]);
    }

    private function ensureEnabled(CoachSettingsService $settings): void { abort_unless($settings->moduleEnabled('interview'), 403, 'Le module Entretiens est désactivé.'); }
}
