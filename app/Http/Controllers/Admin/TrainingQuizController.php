<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingQuiz;
use App\Models\TrainingSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainingQuizController extends Controller
{
    public function edit(Training $training, TrainingSection $section)
    {
        $this->ensureSectionBelongsToTraining($training, $section);

        $quiz = TrainingQuiz::with('questions')
            ->where('training_section_id', $section->id)
            ->first();

        return inertia('backend/trainings/quizzes/edit', [
            'training' => $training,
            'section' => $section,
            'quiz' => $quiz,
        ]);
    }

    public function update(Request $request, Training $training, TrainingSection $section)
    {
        $this->ensureSectionBelongsToTraining($training, $section);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'passing_score' => ['required', 'integer', 'min:1', 'max:100'],
            'is_published' => ['boolean'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2', 'max:6'],
            'questions.*.options.*' => ['required', 'string'],
            'questions.*.correct_option_index' => ['required', 'integer', 'min:0'],
            'questions.*.points' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        foreach ($validated['questions'] as $question) {
            abort_if(
                $question['correct_option_index'] >= count($question['options']),
                422,
                'L\'index de bonne reponse est invalide pour une question.'
            );
        }

        DB::transaction(function () use ($validated, $training, $section) {
            $quiz = TrainingQuiz::updateOrCreate(
                ['training_section_id' => $section->id],
                [
                    'training_id' => $training->id,
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'passing_score' => (int) $validated['passing_score'],
                    'is_published' => (bool) ($validated['is_published'] ?? false),
                ]
            );

            $quiz->questions()->delete();

            foreach ($validated['questions'] as $index => $question) {
                $quiz->questions()->create([
                    'question' => $question['question'],
                    'options' => array_values($question['options']),
                    'correct_option_index' => (int) $question['correct_option_index'],
                    'sort_order' => $index + 1,
                    'points' => (int) ($question['points'] ?? 1),
                ]);
            }
        });

        return redirect()
            ->route('trainings.sections.quiz.edit', ['training' => $training->id, 'section' => $section->id])
            ->with('success', 'Quiz enregistre avec succes.');
    }

    private function ensureSectionBelongsToTraining(Training $training, TrainingSection $section): void
    {
        abort_unless((int) $section->training_id === (int) $training->id, 404);
    }
}
