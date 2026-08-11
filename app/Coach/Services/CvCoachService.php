<?php

namespace App\Coach\Services;

use App\Coach\Prompts\PromptRegistry;
use App\Models\CoachAnalysis;
use App\Models\User;
use App\Models\UserDocument;
use RuntimeException;
use Throwable;

class CvCoachService
{
    public function __construct(
        private DigitalCoachService $coach,
        private CoachContextService $contexts,
        private CoachSettingsService $settings,
        private PromptRegistry $prompts,
    ) {}

    public function analyze(User $user, array $data): CoachAnalysis
    {
        abort_unless($this->settings->moduleEnabled('cv'), 403, 'Le module CV & candidatures est désactivé.');

        $existing = $user->coachAnalyses()->where('submission_token', $data['submission_token'])->first();
        if ($existing) { return $existing; }

        $cv = $this->ownedDocument($user, (int) $data['cv_document_id'], ['cv']);
        $offer = $this->ownedDocument($user, (int) $data['job_document_id'], ['job_offer', 'job_description']);
        $conversation = $user->coachConversations()->create([
            'module' => 'cv',
            'title' => 'Candidature — '.$data['job_title'],
            'language' => $data['language'],
            'status' => 'active',
        ]);
        $analysis = $user->coachAnalyses()->create([
            'coach_conversation_id' => $conversation->id,
            'cv_document_id' => $cv->id,
            'job_document_id' => $offer->id,
            'job_title' => $data['job_title'],
            'company_name' => $data['company_name'] ?? null,
            'language' => $data['language'],
            'status' => 'pending',
            'analysis_type' => 'cv_job_match',
            'prompt_key' => 'cv.compare',
            'prompt_version' => $this->prompts->forKey('cv.compare')->version(),
            'submission_token' => $data['submission_token'],
        ]);

        try {
            $context = $this->factsContext($user, $analysis, $cv, $offer);
            $comparison = $this->operation($user, $analysis, 'cv.compare', $context, [
                'match_level' => 'string', 'match_summary' => 'string', 'strengths' => 'array',
                'missing_or_weak_skills' => 'array', 'important_keywords' => 'array',
                'experience_alignment' => 'array', 'improvement_recommendations' => 'array', 'interview_risks' => 'array',
            ]);
            abort_unless(in_array($comparison['match_level'], ['strong', 'moderate', 'weak'], true), 422);
            $this->assertStringArrays($comparison, ['strengths', 'missing_or_weak_skills', 'important_keywords', 'experience_alignment', 'improvement_recommendations', 'interview_risks']);

            $improvement = $this->operation($user, $analysis, 'cv.improve', $context + ['comparison' => $comparison], [
                'summary_recommendation' => 'string', 'experience_recommendations' => 'array',
                'skills_recommendations' => 'array', 'keywords_to_add' => 'array',
                'content_to_remove_or_reduce' => 'array', 'general_advice' => 'array',
            ]);
            $this->assertStringArrays($improvement, ['experience_recommendations', 'skills_recommendations', 'keywords_to_add', 'content_to_remove_or_reduce', 'general_advice']);

            $adapted = $this->operation($user, $analysis, 'cv.adapt', $context + ['comparison' => $comparison, 'improvement' => $improvement], ['adapted_cv_draft' => 'string']);
            $letter = $this->operation($user, $analysis, 'cv.cover_letter', $context + ['verified_strengths' => $comparison['strengths']], ['cover_letter' => 'string']);
            $message = $this->operation($user, $analysis, 'cv.application_message', $context + ['verified_strengths' => $comparison['strengths']], ['application_message' => 'string']);

            $result = compact('comparison', 'improvement', 'adapted', 'letter', 'message');
            $analysis->update(['status' => 'completed', 'result' => $result, 'completed_at' => now()]);
            $conversation->messages()->create(['role' => 'assistant', 'content' => $comparison['match_summary'], 'structured_data' => $result]);

            return $analysis->fresh(['cvDocument', 'jobDocument']);
        } catch (Throwable $exception) {
            $analysis->update(['status' => 'failed']);
            if ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) { throw $exception; }
            throw new RuntimeException('L’analyse CV est temporairement indisponible.', 0, $exception);
        }
    }

    public function factsContext(User $user, CoachAnalysis $analysis, UserDocument $cv, UserDocument $offer): array
    {
        $base = $this->contexts->build($user, $analysis->conversation, '', [$cv->id, $offer->id]);

        return $base + [
            'context_semantics' => [
                'user_facts' => 'Only professional_profile_data, document_data and application_facts are user facts.',
                'coach_suggestions' => 'Every generated output is an editable suggestion and must never be persisted as a user fact.',
                'document_limitation' => 'No extracted document text is available; document metadata is not evidence of CV contents.',
            ],
            'application_facts' => ['job_title' => $analysis->job_title, 'company_name' => $analysis->company_name],
            'source_documents' => [
                'cv' => $cv->only(['id', 'type', 'original_name', 'language']),
                'offer' => $offer->only(['id', 'type', 'original_name', 'language']),
            ],
        ];
    }

    private function operation(User $user, CoachAnalysis $analysis, string $key, array $context, array $schema): array
    {
        return $this->coach->generateStructuredOperation(
            $user, $analysis->conversation, $this->prompts->forKey($key), $context, $schema, $key,
        )->data;
    }

    private function ownedDocument(User $user, int $id, array $types): UserDocument
    {
        $document = $user->coachDocuments()->whereKey($id)->whereIn('type', $types)->first();
        abort_unless($document, 404);

        return $document;
    }

    private function assertStringArrays(array $result, array $keys): void
    {
        foreach ($keys as $key) {
            if (collect($result[$key])->contains(fn ($value) => !is_string($value))) {
                throw new RuntimeException('Invalid structured response');
            }
        }
    }
}
