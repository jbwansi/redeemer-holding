<?php
namespace App\Coach\Prompts\Certification;
class AnalyzeSkillsGapPrompt { public function key():string{return 'certification.skills_gap';} public function version():string{return '1.0';} public function instructions():string{return 'Analyse uniquement les faits fournis. N’invente jamais une compétence acquise, expérience, formation, diplôme ou certification détenue. Sépare FACT et RECOMMANDATION IA et priorise high, medium ou low.';} }
