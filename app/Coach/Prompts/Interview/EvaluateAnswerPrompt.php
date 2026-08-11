<?php
namespace App\Coach\Prompts\Interview;
class EvaluateAnswerPrompt { public function key(): string { return 'interview.evaluate_answer'; } public function version(): string { return '1.0'; } public function instructions(): string { return 'Évaluez prudemment la réponse sur une échelle simple de 1 à 5 et fournissez un retour actionnable dans la langue demandée.'; } }
