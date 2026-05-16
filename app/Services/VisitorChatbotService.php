<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Support\Facades\Http;

class VisitorChatbotService
{
    public function reply(string $message): array
    {
        $message = trim($message);

        if ($message === '') {
            return [
                'reply' => 'Je suis la pour vous aider. Posez-moi votre question sur nos trainings, evenements, services ou contacts.',
                'source' => 'fallback',
            ];
        }

        $openAiKey = config('services.openai.key');

        if (!empty($openAiKey)) {
            $aiReply = $this->askOpenAi($message);
            if ($aiReply !== null) {
                return [
                    'reply' => $aiReply,
                    'source' => 'openai',
                ];
            }
        }

        return [
            'reply' => $this->fallbackReply($message),
            'source' => 'fallback',
        ];
    }

    private function askOpenAi(string $message): ?string
    {
        try {
            $model = config('services.openai.model', 'gpt-4o-mini');
            $siteName = get_setting('site_name', 'Redeemer Holding');
            $email = get_setting('contact_email', '');
            $phone = get_setting('company_phone', '');

            $systemPrompt = "Tu es l'assistant virtuel du site {$siteName}. "
                . "Reponds en francais, de maniere concise, professionnelle et chaleureuse. "
                . "Tu aides les visiteurs sur les trainings, evenements, services, inscriptions, paiements et prise de contact. "
                . "Si une information precise n'est pas certaine, propose de contacter l'equipe";

            if (!empty($email) || !empty($phone)) {
                $systemPrompt .= " (email: {$email}, telephone: {$phone}).";
            } else {
                $systemPrompt .= ".";
            }

            $response = Http::timeout(15)
                ->withToken(config('services.openai.key'))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'temperature' => 0.5,
                    'max_tokens' => 300,
                ]);

            if (!$response->successful()) {
                return null;
            }

            $content = data_get($response->json(), 'choices.0.message.content');
            if (!is_string($content) || trim($content) === '') {
                return null;
            }

            return trim($content);
        } catch (\Throwable $e) {
            report($e);
            return null;
        }
    }

    private function fallbackReply(string $message): string
    {
        $m = mb_strtolower($message);
        $faqs = Page::where('slug', 'chatbot')->value('meta')['faqs'] ?? [];

        foreach ($faqs as $faq) {
            $question = mb_strtolower((string) data_get($faq, 'question', ''));
            $answer = (string) data_get($faq, 'answer', '');
            if ($question !== '' && $answer !== '' && (str_contains($question, $m) || str_contains($m, $question))) {
                return $answer;
            }
        }

        if ($this->containsAny($m, ['formation', 'trainings', 'coaching'])) {
            return 'Nous proposons plusieurs trainings et accompagnements. Je peux vous orienter vers la page Trainings pour voir les sessions disponibles et vous inscrire.';
        }

        if ($this->containsAny($m, ['evenement', 'event', 'atelier', 'conference'])) {
            return 'Nos evenements sont mis a jour regulierement. Je vous invite a consulter la page Evenements pour voir les prochaines dates, lieux et inscriptions.';
        }

        if ($this->containsAny($m, ['prix', 'tarif', 'cout', 'paiement'])) {
            return 'Les tarifs dependent du programme choisi. Vous pouvez consulter les details sur chaque fiche formation/evenement. Besoin d\'aide pour choisir ?';
        }

        if ($this->containsAny($m, ['contact', 'email', 'telephone', 'rdv', 'rendez-vous'])) {
            $email = get_setting('contact_email', null);
            $phone = get_setting('company_phone', null);
            $parts = ['Vous pouvez nous contacter directement'];

            if (!empty($email)) {
                $parts[] = "par email: {$email}";
            }

            if (!empty($phone)) {
                $parts[] = "ou par telephone: {$phone}";
            }

            return implode(' ', $parts) . '.';
        }

        if ($this->containsAny($m, ['bonjour', 'salut', 'hello'])) {
            return 'Bonjour et bienvenue. Je peux vous aider pour les trainings, evenements, tarifs, inscriptions et prise de contact.';
        }

        return 'Merci pour votre message. Je peux vous aider sur les trainings, evenements, services, tarifs et contact. Que souhaitez-vous savoir en priorite ?';
    }

    private function containsAny(string $haystack, array $keywords): bool
    {
        foreach ($keywords as $keyword) {
            if (str_contains($haystack, $keyword)) {
                return true;
            }
        }

        return false;
    }
}
