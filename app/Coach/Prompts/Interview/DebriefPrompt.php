<?php
namespace App\Coach\Prompts\Interview;
class DebriefPrompt { public function key(): string { return 'interview.debrief'; } public function version(): string { return '1.0'; } public function instructions(): string { return 'Produisez un débriefing actionnable sans présenter le score comme une vérité absolue. Répondez dans la langue demandée.'; } }
