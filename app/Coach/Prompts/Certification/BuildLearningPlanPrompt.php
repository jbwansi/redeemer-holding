<?php
namespace App\Coach\Prompts\Certification;
class BuildLearningPlanPrompt { public function key():string{return 'certification.learning_plan';} public function version():string{return '1.0';} public function instructions():string{return 'Construis un plan progressif de suggestions à valider. N’invente aucune compétence acquise, expérience, certification détenue ou formation suivie. Ne connecte aucun LMS.';} }
