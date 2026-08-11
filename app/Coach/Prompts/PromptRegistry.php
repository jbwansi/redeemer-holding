<?php

namespace App\Coach\Prompts;

use App\Coach\Prompts\General\GeneralCoachPrompt;
use App\Coach\Prompts\Interview\AnalyzeJobPrompt;
use App\Coach\Prompts\Interview\DebriefPrompt;
use App\Coach\Prompts\Interview\EvaluateAnswerPrompt;
use App\Coach\Prompts\Interview\GenerateQuestionsPrompt;
use App\Coach\Prompts\Cv\AdaptCvPrompt;
use App\Coach\Prompts\Cv\ApplicationMessagePrompt;
use App\Coach\Prompts\Cv\CompareCvToOfferPrompt;
use App\Coach\Prompts\Cv\CoverLetterPrompt;
use App\Coach\Prompts\Cv\ImproveCvPrompt;
use App\Coach\Prompts\Career\AnalyzeSituationPrompt;
use App\Coach\Prompts\Career\BuildActionPlanPrompt;
use App\Coach\Prompts\Career\ExploreRolesPrompt;
use App\Coach\Prompts\Career\GapAnalysisPrompt;
use InvalidArgumentException;

class PromptRegistry
{
    public function forModule(string $module): GeneralCoachPrompt
    {
        if ($module !== 'general') { throw new InvalidArgumentException('Module Coach non disponible.'); }
        return new GeneralCoachPrompt();
    }

    public function forKey(string $key): object
    {
        return match ($key) {
            'interview.analyze_job' => new AnalyzeJobPrompt(),
            'interview.generate_questions' => new GenerateQuestionsPrompt(),
            'interview.evaluate_answer' => new EvaluateAnswerPrompt(),
            'interview.debrief' => new DebriefPrompt(),
            'cv.compare' => new CompareCvToOfferPrompt(),
            'cv.improve' => new ImproveCvPrompt(),
            'cv.adapt' => new AdaptCvPrompt(),
            'cv.cover_letter' => new CoverLetterPrompt(),
            'cv.application_message' => new ApplicationMessagePrompt(),
            'career.analyze_situation' => new AnalyzeSituationPrompt(),
            'career.gap_analysis' => new GapAnalysisPrompt(),
            'career.explore_roles' => new ExploreRolesPrompt(),
            'career.build_action_plan' => new BuildActionPlanPrompt(),
            default => throw new InvalidArgumentException('Prompt Coach inconnu.'),
        };
    }
}
