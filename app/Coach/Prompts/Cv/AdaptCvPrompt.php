<?php
namespace App\Coach\Prompts\Cv;
class AdaptCvPrompt {
    public function key(): string { return 'cv.adapt'; }
    public function version(): string { return '1.0'; }
    public function instructions(): string { return 'Produis un brouillon textuel de CV, clairement présenté comme proposition à relire. Utilise seulement les faits utilisateur fournis et n’invente jamais emploi, diplôme, compétence ou certification.'; }
}
