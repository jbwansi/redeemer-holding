<?php

namespace App\Coach\Prompts;

use App\Coach\Prompts\General\GeneralCoachPrompt;
use App\Coach\Prompts\Interview\AnalyzeJobPrompt;
use App\Coach\Prompts\Interview\DebriefPrompt;
use App\Coach\Prompts\Interview\EvaluateAnswerPrompt;
use App\Coach\Prompts\Interview\GenerateQuestionsPrompt;
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
            default => throw new InvalidArgumentException('Prompt Coach inconnu.'),
        };
    }
}
