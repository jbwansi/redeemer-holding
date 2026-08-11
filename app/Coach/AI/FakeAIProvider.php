<?php

namespace App\Coach\AI;

use App\Coach\DTO\AIRequest;
use App\Coach\DTO\AIResponse;
use App\Coach\DTO\StructuredAIResponse;
use Illuminate\Support\Str;
use RuntimeException;

class FakeAIProvider implements AIProviderInterface
{
    public function __construct(private string $mode = 'success') {}

    public function generateText(AIRequest $request): AIResponse
    {
        $this->guardMode();
        $content = match ($request->language) {
            'de' => '[de] Demonstrationsantwort des Coaches.',
            'en' => '[en] Demonstration response from the Coach.',
            default => '[fr] Réponse de démonstration du Coach.',
        };

        return new AIResponse($content, 20, 8, 'fake-'.Str::uuid(), 5);
    }

    public function generateStructured(AIRequest $request, array $schema): StructuredAIResponse
    {
        $this->guardMode();
        $data = $this->mode === 'invalid' ? ['unexpected' => true] : $this->structuredData($request);

        return new StructuredAIResponse($data, 24, 18, 'fake-'.Str::uuid(), 7);
    }

    private function structuredData(AIRequest $request): array
    {
        if ($request->promptKey === 'interview.analyze_job') {
            return [
                'role_summary' => "[{$request->language}] Analyse déterministe du poste",
                'key_responsibilities' => ['Piloter les priorités', 'Collaborer avec les parties prenantes'],
                'required_skills' => ['Communication', 'Résolution de problèmes'],
                'candidate_strengths' => ['Expérience transférable'],
                'potential_gaps' => ['Exemples quantifiés à préparer'],
                'interview_focus' => ['Motivation', 'Expérience concrète'],
            ];
        }
        if ($request->promptKey === 'interview.generate_questions') {
            return [
                'questions' => [
                    ['category' => 'motivation', 'question' => "[{$request->language}] Pourquoi ce poste vous intéresse-t-il ?"],
                    ['category' => 'experience', 'question' => "[{$request->language}] Décrivez une réussite pertinente."],
                    ['category' => 'behavioral', 'question' => "[{$request->language}] Comment gérez-vous une priorité conflictuelle ?"],
                    ['category' => 'candidate_questions', 'question' => "[{$request->language}] Que demanderiez-vous au recruteur ?"],
                    ['category' => 'motivation', 'question' => "[{$request->language}] Quelle serait votre première contribution ?"],
                ],
                'candidate_questions' => [
                    'Quels sont les objectifs prioritaires des six premiers mois ?',
                    'Comment la réussite dans ce poste est-elle évaluée ?',
                ],
            ];
        }
        if ($request->promptKey === 'interview.evaluate_answer') {
            return ['feedback' => "[{$request->language}] Réponse claire et pertinente.", 'strength' => 'Exemple concret', 'improvement' => 'Quantifier le résultat', 'score' => 4];
        }
        if ($request->promptKey === 'interview.debrief') {
            return [
                'overall_summary' => "[{$request->language}] Préparation solide à approfondir.",
                'strengths' => ['Réponses structurées'],
                'improvements' => ['Ajouter des résultats mesurables'],
                'recommended_actions' => ['Répéter les exemples à voix haute'],
                'questions_to_rehearse' => ['Pourquoi ce poste ?'],
            ];
        }

        return [
            'summary' => match ($request->language) {
                'de' => '[de] Ihre Anfrage wurde berücksichtigt.',
                'en' => '[en] Your request has been taken into account.',
                default => '[fr] Votre demande a été prise en compte.',
            },
            'next_actions' => match ($request->language) {
                'de' => ['Profil vervollständigen', 'Nächste Aktion festlegen'],
                'en' => ['Complete your profile', 'Define your next action'],
                default => ['Compléter votre profil', 'Définir votre prochaine action'],
            },
        ];
    }

    private function guardMode(): void
    {
        if ($this->mode === 'timeout') {
            throw new RuntimeException('Simulated timeout');
        }
        if ($this->mode === 'error') {
            throw new RuntimeException('Simulated provider error');
        }
    }
}
