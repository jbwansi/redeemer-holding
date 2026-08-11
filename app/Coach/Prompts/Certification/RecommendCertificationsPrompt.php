<?php
namespace App\Coach\Prompts\Certification;
class RecommendCertificationsPrompt { public function key():string{return 'certification.recommend';} public function version():string{return '1.0';} public function instructions():string{return 'Propose uniquement des suggestions à vérifier, jamais des certifications vérifiées, actuelles ou détenues. N’invente aucun fait utilisateur, diplôme, expérience ou compétence acquise. Aucun catalogue externe.';} }
