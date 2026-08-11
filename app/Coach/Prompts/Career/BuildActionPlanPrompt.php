<?php
namespace App\Coach\Prompts\Career;
class BuildActionPlanPrompt { public function key():string{return 'career.build_action_plan';} public function version():string{return '1.0';} public function instructions():string{return 'Propose des actions concrètes à valider par l’utilisateur. N’invente aucun fait personnel, diplôme, certification, expérience ou compétence acquise.';} }
