<?php
namespace App\Coach\Prompts\Cv;
class CompareCvToOfferPrompt {
    public function key(): string { return 'cv.compare'; }
    public function version(): string { return '1.0'; }
    public function instructions(): string { return 'Compare uniquement les faits utilisateur fournis avec l’offre. N’invente aucune compétence, expérience, certification, formation ou donnée personnelle. Retourne la structure demandée dans la langue choisie et qualifie la correspondance par strong, moderate ou weak, sans faux pourcentage.'; }
}
