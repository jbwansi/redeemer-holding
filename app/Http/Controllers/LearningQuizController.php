<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingParticipant;
use App\Models\TrainingQuiz;
use App\Models\TrainingQuizAttempt;
use App\Models\TrainingSection;
use App\Services\LearningProgressService;
use Illuminate\Http\Request;

class LearningQuizController extends Controller
{
    public function show(Training $training, TrainingSection $section)
    {
        app(LearningProgressService::class)->ensureSectionAccess($training, $section, auth()->user());

        app(LearningProgressService::class)->ensureCanTakeQuiz(
            $training,
            $section,
            auth()->id()
        );

        $quiz = TrainingQuiz::with('questions')
            ->where('training_section_id', $section->id)
            ->where('is_published', true)
            ->firstOrFail();

        $latestAttempt = TrainingQuizAttempt::where('user_id', auth()->id())
            ->where('training_quiz_id', $quiz->id)
            ->latest('submitted_at')
            ->first();

        return inertia('Frontend/learning/quiz', [
            'training' => $training,
            'section' => $section,
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'passing_score' => $quiz->passing_score,
                'questions' => $quiz->questions->map(fn($question) => [
                    'id' => $question->id,
                    'question' => $question->question,
                    'options' => $question->options,
                    'sort_order' => $question->sort_order,
                ]),
            ],
            'latest_attempt' => $latestAttempt ? [
                'score' => (float) $latestAttempt->score,
                'passed' => (bool) $latestAttempt->passed,
                'correct_answers' => (int) $latestAttempt->correct_answers,
                'total_questions' => (int) $latestAttempt->total_questions,
                'submitted_at' => optional($latestAttempt->submitted_at)->toISOString(),
            ] : null,
        ]);
    }

    public function submit(Request $request, Training $training, TrainingSection $section)
    {
        app(LearningProgressService::class)->ensureSectionAccess($training, $section, auth()->user());

        app(LearningProgressService::class)->ensureCanTakeQuiz(
            $training,
            $section,
            auth()->id()
        );

        $quiz = TrainingQuiz::with('questions')
            ->where('training_section_id', $section->id)
            ->where('is_published', true)
            ->firstOrFail();

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $questions = $quiz->questions;
        abort_if($questions->isEmpty(), 422, 'Ce quiz ne contient aucune question.');

        $correctAnswers = 0;
        foreach ($questions as $question) {
            $submitted = data_get($validated['answers'], (string) $question->id);
            if ($submitted !== null && (int) $submitted === (int) $question->correct_option_index) {
                $correctAnswers++;
            }
        }

        $totalQuestions = $questions->count();
        $score = $totalQuestions > 0 ? round(($correctAnswers / $totalQuestions) * 100, 2) : 0;
        $passed = $score >= (float) $quiz->passing_score;

        TrainingQuizAttempt::create([
            'user_id' => auth()->id(),
            'training_id' => $training->id,
            'training_section_id' => $section->id,
            'training_quiz_id' => $quiz->id,
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'score' => $score,
            'passed' => $passed,
            'answers' => $validated['answers'],
            'started_at' => now(),
            'submitted_at' => now(),
        ]);

        return redirect()
            ->route('learning.quiz.show', ['training' => $training->id, 'section' => $section->id])
            ->with('success', $passed
                ? 'Quiz reussi! Bravo.'
                : 'Quiz termine. Vous pouvez reessayer pour atteindre le score requis.');
    }
}
