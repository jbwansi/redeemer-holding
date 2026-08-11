<?php
namespace App\Coach\Prompts\Cv;
class ApplicationMessagePrompt {
    public function key(): string { return 'cv.application_message'; }
    public function version(): string { return '1.0'; }
    public function instructions(): string { return 'Rédige un message court de candidature adapté au contexte et éditable. Utilise exclusivement les faits utilisateur fournis et n’invente aucune qualification.'; }
}
