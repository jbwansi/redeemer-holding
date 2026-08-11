<?php
namespace App\Coach\Prompts\Career;
class AnalyzeSituationPrompt { public function key():string{return 'career.analyze_situation';} public function version():string{return '1.0';} public function instructions():string{return 'Analyse seulement les faits utilisateur. Sépare FACT et SUGGESTION. N’invente aucune expérience, compétence acquise, formation, certification ou diplôme et ne présente aucune supposition comme un fait.';} }
