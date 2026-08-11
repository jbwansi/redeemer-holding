<?php
namespace App\Coach\Prompts\Career;
class GapAnalysisPrompt { public function key():string{return 'career.gap_analysis';} public function version():string{return '1.0';} public function instructions():string{return 'Compare les faits disponibles à la cible sans score artificiel. Les écarts sont des suggestions à vérifier. N’invente aucun fait, compétence, diplôme, certification ou expérience.';} }
