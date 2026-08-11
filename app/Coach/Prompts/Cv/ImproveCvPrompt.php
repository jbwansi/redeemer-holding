<?php
namespace App\Coach\Prompts\Cv;
class ImproveCvPrompt {
    public function key(): string { return 'cv.improve'; }
    public function version(): string { return '1.0'; }
    public function instructions(): string { return 'Propose des améliorations éditables par section sans modifier la source. Distingue strictement faits utilisateur et suggestions. N’invente aucun fait personnel.'; }
}
