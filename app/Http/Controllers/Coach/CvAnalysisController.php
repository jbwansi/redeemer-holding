<?php

namespace App\Http\Controllers\Coach;

use App\Coach\Services\CoachSettingsService;
use App\Coach\Services\CvCoachService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Coach\StoreCvAnalysisRequest;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class CvAnalysisController extends Controller
{
    public function index(Request $request, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $analyses = $request->user()->coachAnalyses()
            ->with(['cvDocument:id,original_name', 'jobDocument:id,original_name'])
            ->latest()->paginate(20)->withQueryString();

        return inertia('Frontend/Coach/Cv/Index', ['analyses' => $analyses]);
    }

    public function create(Request $request, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $documents = $request->user()->coachDocuments()
            ->whereIn('type', ['cv', 'job_offer', 'job_description'])
            ->get(['id', 'type', 'original_name', 'language']);

        return inertia('Frontend/Coach/Cv/Analyze', [
            'documents' => $documents,
            'languages' => array_values(array_intersect($settings->all()['languages'], ['fr', 'de', 'en'])),
            'defaultLanguage' => $settings->all()['default_language'],
        ]);
    }

    public function store(StoreCvAnalysisRequest $request, CvCoachService $service)
    {
        try {
            $analysis = $service->analyze($request->user(), $request->validated());
            if ($analysis->status === 'failed') {
                return back()->withInput()->with('error', 'Cette analyse a déjà échoué. Lancez une nouvelle demande.');
            }
            return redirect()->route('coach.cv.show', $analysis);
        } catch (RuntimeException $exception) {
            if ($exception instanceof HttpExceptionInterface) { throw $exception; }
            return back()->withInput()->with('error', 'L’analyse CV a échoué. Aucun résultat incomplet n’a été présenté.');
        }
    }

    public function show(Request $request, int $analysis, CoachSettingsService $settings)
    {
        $this->ensureEnabled($settings);
        $model = $request->user()->coachAnalyses()
            ->with(['cvDocument:id,original_name', 'jobDocument:id,original_name'])
            ->findOrFail($analysis);
        $this->authorize('view', $model);

        return inertia('Frontend/Coach/Cv/Show', ['analysis' => $model]);
    }

    private function ensureEnabled(CoachSettingsService $settings): void
    {
        abort_unless($settings->moduleEnabled('cv'), 403, 'Le module CV & candidatures est désactivé.');
    }
}
