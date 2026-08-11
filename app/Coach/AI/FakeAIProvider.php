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
        if ($request->promptKey === 'career.analyze_situation') return ['current_position_summary'=>"[{$request->language}] Synthèse indicative fondée sur les faits déclarés.",'strengths'=>['Expérience déclarée à valoriser'],'transferable_skills'=>['Communication à confirmer'],'gaps'=>['Écart à vérifier'],'opportunities'=>['Explorer une transition progressive'],'risks_or_constraints'=>['Valider les hypothèses avec le marché']];
        if ($request->promptKey === 'career.gap_analysis') return ['target'=>"[{$request->language}] Objectif professionnel déclaré",'existing_strengths'=>['Forces issues du contexte'],'missing_skills'=>['Compétence suggérée à développer'],'experience_gaps'=>['Expérience à documenter'],'knowledge_gaps'=>['Connaissance à approfondir'],'priority_gaps'=>['Priorité indicative à valider']];
        if ($request->promptKey === 'career.explore_roles') return ['recommended_roles'=>[['title'=>"[{$request->language}] Piste professionnelle",'why_it_fits'=>'Correspondance indicative avec les faits déclarés','strengths_used'=>['Force déclarée'],'gaps_to_close'=>['Écart suggéré']]]];
        if ($request->promptKey === 'career.build_action_plan') return ['actions'=>[['title'=>"[{$request->language}] Clarifier le projet",'description'=>'Documenter les critères de décision','priority'=>'high','suggested_due_window'=>'Dans les 30 jours'],['title'=>'Valider une compétence cible','description'=>'Recueillir des preuves et retours','priority'=>'medium','suggested_due_window'=>'Dans les 60 jours']]];
        if ($request->promptKey === 'cv.compare') {
            return [
                'match_level' => 'moderate',
                'match_summary' => "[{$request->language}] Le profil présente des éléments transférables à vérifier avec le CV source.",
                'strengths' => ['Expérience professionnelle déclarée dans le contexte'],
                'missing_or_weak_skills' => ['Éléments non démontrés à documenter'],
                'important_keywords' => ['collaboration', 'résultats'],
                'experience_alignment' => ['Relier les expériences vérifiées aux responsabilités du poste'],
                'improvement_recommendations' => ['Ajouter des exemples factuels et mesurables'],
                'interview_risks' => ['Ne pas revendiquer une compétence absente des faits fournis'],
            ];
        }
        if ($request->promptKey === 'cv.improve') {
            return [
                'summary_recommendation' => "[{$request->language}] Clarifier la proposition de valeur avec des faits vérifiables.",
                'experience_recommendations' => ['Décrire contexte, action et résultat sans ajouter de fait'],
                'skills_recommendations' => ['Conserver uniquement les compétences démontrées'],
                'keywords_to_add' => ['Ajouter seulement les mots-clés réellement maîtrisés'],
                'content_to_remove_or_reduce' => ['Réduire les formulations génériques'],
                'general_advice' => ['Relire et valider chaque proposition avant utilisation'],
            ];
        }
        if ($request->promptKey === 'cv.adapt') {
            return ['adapted_cv_draft' => "[{$request->language}] BROUILLON À RELIRE\n\nTitre et résumé fondés uniquement sur les informations utilisateur disponibles."];
        }
        if ($request->promptKey === 'cv.cover_letter') {
            return ['cover_letter' => "[{$request->language}] Madame, Monsieur,\n\nJe vous propose ma candidature sur la base des expériences que j’ai personnellement vérifiées.\n\nCordialement"];
        }
        if ($request->promptKey === 'cv.application_message') {
            return ['application_message' => "[{$request->language}] Bonjour, je souhaite vous proposer ma candidature. Vous trouverez mon CV à relire en pièce jointe."];
        }
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
