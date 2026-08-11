<?php

namespace App\Coach\Services;

use App\Coach\Prompts\PromptRegistry;
use App\Models\CoachConversation;
use App\Models\InterviewSimulation;
use App\Models\InterviewTurn;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InterviewCoachService
{
    public function __construct(
        private DigitalCoachService $coach,
        private CoachContextService $contexts,
        private CoachSettingsService $settings,
        private PromptRegistry $prompts,
    ) {}

    public function create(User $user, array $data): InterviewSimulation
    {
        abort_unless($this->settings->moduleEnabled('interview'), 403, 'Le module Entretiens est désactivé.');
        $documentIds = array_values(array_filter($data['document_ids'] ?? []));
        abort_unless($user->coachDocuments()->whereKey($documentIds)->count() === count($documentIds), 404);

        $conversation = $user->coachConversations()->create([
            'module' => 'interview', 'title' => 'Entretien — '.$data['job_title'],
            'language' => $data['language'], 'status' => 'active',
        ]);
        $simulation = $user->interviewSimulations()->create([
            ...collect($data)->except(['document_ids'])->all(),
            'document_ids' => $documentIds,
            'coach_conversation_id' => $conversation->id,
            'status' => 'draft',
            'current_turn' => 0,
        ]);
        return $this->prepare($user, $simulation, $documentIds);
    }

    public function prepare(User $user, InterviewSimulation $simulation, array $documentIds = []): InterviewSimulation
    {
        $this->assertOwner($user, $simulation);
        abort_unless($simulation->status === 'draft', 409);
        $documentIds = $documentIds ?: ($simulation->document_ids ?? []);
        abort_unless($user->coachDocuments()->whereKey($documentIds)->count() === count($documentIds), 404);
        $conversation = $simulation->conversation;
        $base = $this->contexts->build($user, $conversation, '', $documentIds) + [
            'job_title' => $simulation->job_title,
            'company_name' => $simulation->company_name,
            'job_description' => $simulation->job_description,
            'interview_type' => $simulation->interview_type,
            'difficulty' => $simulation->difficulty,
        ];

        $analysis = $this->coach->generateStructuredOperation(
            $user, $conversation, $this->prompts->forKey('interview.analyze_job'), $base,
            ['role_summary' => 'string', 'key_responsibilities' => 'array', 'required_skills' => 'array', 'candidate_strengths' => 'array', 'potential_gaps' => 'array', 'interview_focus' => 'array'],
            'interview.analyze_job',
        )->data;
        $plan = $this->coach->generateStructuredOperation(
            $user, $conversation, $this->prompts->forKey('interview.generate_questions'), $base + ['job_analysis' => $analysis],
            ['questions' => 'array', 'candidate_questions' => 'array'],
            'interview.generate_questions',
        )->data;
        $limit = (int) $this->settings->all()['interview_question_limit'];
        $questions = array_slice($plan['questions'], 0, $limit);
        abort_if(count($questions) < 1, 422, 'Aucune question valide générée.');

        DB::transaction(function () use ($simulation, $analysis, $plan, $questions): void {
            $simulation->turns()->delete();
            foreach ($questions as $index => $question) {
                abort_unless(isset($question['category'], $question['question']) && is_string($question['category']) && is_string($question['question']), 422);
                $simulation->turns()->create(['position' => $index + 1, 'category' => $question['category'], 'question' => $question['question']]);
            }
            $simulation->update(['analysis' => $analysis, 'candidate_questions' => $plan['candidate_questions'], 'status' => 'ready', 'current_turn' => 1]);
        });

        return $simulation->fresh('turns');
    }

    public function answer(User $user, InterviewSimulation $simulation, string $answer, string $submissionToken): InterviewSimulation
    {
        $this->assertOwner($user, $simulation);
        $submitted = $simulation->turns()->where('submission_token', $submissionToken)->whereNotNull('answered_at')->first();
        if ($submitted) {
            if ($simulation->status === 'completed') { return $simulation->fresh('turns'); }
            return $simulation->turns()->whereNull('answered_at')->doesntExist()
                ? $this->complete($user, $simulation)
                : $simulation->fresh('turns');
        }
        abort_unless(in_array($simulation->status, ['ready', 'in_progress'], true), 409);
        $turn = $simulation->currentTurn();
        abort_unless($turn, 409);

        abort_if($turn->answered_at || InterviewTurn::where('submission_token', $submissionToken)->exists(), 409, 'Réponse déjà soumise.');

        $feedback = $this->coach->generateStructuredOperation(
            $user, $simulation->conversation, $this->prompts->forKey('interview.evaluate_answer'),
            ['question' => $turn->question, 'current_user_message' => $answer, 'category' => $turn->category, 'difficulty' => $simulation->difficulty],
            ['feedback' => 'string', 'strength' => 'string', 'improvement' => 'string', 'score' => 'int'],
            'interview.evaluate_answer',
        )->data;
        abort_unless($feedback['score'] >= 1 && $feedback['score'] <= 5, 422);

        $turn->update([
            'answer' => $answer, 'feedback' => $feedback['feedback'], 'score' => $feedback['score'],
            'metadata' => ['strength' => $feedback['strength'], 'improvement' => $feedback['improvement']],
            'submission_token' => $submissionToken, 'answered_at' => now(),
        ]);
        $simulation->conversation->messages()->create(['role' => 'user', 'content' => $answer]);

        if ($this->hasNextTurn($simulation, $turn)) {
            $simulation->update(['status' => 'in_progress', 'current_turn' => $turn->position + 1]);
            return $simulation->fresh('turns');
        }

        return $this->complete($user, $simulation);
    }

    public function complete(User $user, InterviewSimulation $simulation): InterviewSimulation
    {
        $this->assertOwner($user, $simulation);
        abort_unless($simulation->turns()->whereNull('answered_at')->doesntExist(), 409);
        if ($simulation->status === 'completed') { return $simulation; }

        $debrief = $this->coach->generateStructuredOperation(
            $user, $simulation->conversation, $this->prompts->forKey('interview.debrief'),
            ['turns' => $simulation->turns()->get(['question', 'answer', 'feedback', 'score'])->toArray(), 'candidate_questions' => $simulation->candidate_questions],
            ['overall_summary' => 'string', 'strengths' => 'array', 'improvements' => 'array', 'recommended_actions' => 'array', 'questions_to_rehearse' => 'array'],
            'interview.debrief',
        )->data;
        $simulation->update([
            'status' => 'completed', 'score' => (int) round($simulation->turns()->avg('score')),
            'summary' => $debrief['overall_summary'], 'strengths' => $debrief['strengths'],
            'improvements' => $debrief['improvements'], 'recommended_actions' => $debrief['recommended_actions'],
            'questions_to_rehearse' => $debrief['questions_to_rehearse'], 'completed_at' => now(),
        ]);

        return $simulation->fresh('turns');
    }

    private function hasNextTurn(InterviewSimulation $simulation, InterviewTurn $turn): bool
    {
        return $simulation->turns()->where('position', '>', $turn->position)->exists();
    }

    private function assertOwner(User $user, InterviewSimulation $simulation): void
    {
        abort_unless($simulation->user_id === $user->id, 404);
        abort_unless($this->settings->moduleEnabled('interview'), 403);
    }
}
