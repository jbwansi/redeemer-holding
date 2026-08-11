<?php
namespace App\Coach\Prompts\Cv;
class CoverLetterPrompt {
    public function key(): string { return 'cv.cover_letter'; }
    public function version(): string { return '1.0'; }
    public function instructions(): string { return 'Rédige une lettre de motivation éditable dans la langue choisie à partir des seuls faits fournis. N’invente aucun fait personnel et ne prétends pas produire un document final.'; }
}
