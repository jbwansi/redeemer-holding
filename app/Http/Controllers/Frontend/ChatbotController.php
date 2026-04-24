<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Mail\ChatbotLeadNotification;
use App\Models\ChatbotLead;
use App\Models\Page;
use App\Services\DynamicMailerService;
use App\Services\VisitorChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Services\SettingsService;
use App\Mail\ChatbotLeadConfirmationMail;

class ChatbotController extends Controller
{
    public function __construct(
        private readonly VisitorChatbotService $chatbotService,
        private readonly DynamicMailerService $dynamicMailerService,
        private readonly SettingsService $settingsService
    ) {
    }

    public function message(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:1000'],
        ]);

        try {
            $result = $this->chatbotService->reply(
                trim($validated['message'])
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Chatbot message error', [
                'message' => $validated['message'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Désolé, une erreur est survenue. Veuillez réessayer dans un instant.',
            ], 500);
        }
    }

    public function config(): JsonResponse
    {
        $meta = Page::query()
            ->where('slug', 'chatbot')
            ->value('meta');

        $meta = is_array($meta) ? $meta : [];

        return response()->json([
            'enabled' => (bool) data_get($meta, 'enabled', true),
            'title' => (string) data_get($meta, 'title', 'Assistant Redeemer'),
            'welcome_message' => (string) data_get(
                $meta,
                'welcome_message',
                'Bonjour. Je suis l’assistant Redeemer. Je peux vous aider 24h/24 sur les formations, événements, services et contacts.'
            ),
            'quick_questions' => array_values((array) data_get($meta, 'quick_questions', [
                'Quelles formations sont disponibles ?',
                'Comment participer à un événement ?',
                'Comment vous contacter ?',
            ])),
            'lead_capture_enabled' => (bool) data_get($meta, 'lead_capture_enabled', true),
            'lead_prompt' => (string) data_get(
                $meta,
                'lead_prompt',
                'Laissez votre email pour être recontacté rapidement.'
            ),
        ]);
    }

    public function lead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        $email = strtolower(trim($validated['email']));
        $name = isset($validated['name']) ? trim($validated['name']) : null;

        Log::channel('newsletter')->info('CHATBOT LEAD START', [
            'email_input' => $email,
            'name_input' => $name,
            'ip' => $request->ip(),
        ]);

        try {
            // 🔥 Sauvegarde ou update
            $lead = ChatbotLead::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'source' => 'visitor_chatbot',
                ]
            );

            Log::channel('newsletter')->info('CHATBOT LEAD SAVED', [
                'lead_id' => $lead->id,
                'email' => $lead->email,
            ]);

            // 🔥 Récupération settings
            $settings = $this->settingsService->getAllSettings();

            Log::channel('newsletter')->info('CHATBOT SETTINGS', [
                'contact_email' => $settings['contact_email'] ?? null,
                'sender_email' => $settings['sender_email'] ?? null,
                'mail_from' => config('mail.from.address'),
            ]);

            // 🔥 Choix email admin
            $adminEmail = $settings['contact_email']
                ?? $settings['sender_email']
                ?? config('mail.from.address')
                ?? 'admin@redeemerholding.com';

            Log::channel('newsletter')->info('CHATBOT ADMIN EMAIL RESOLVED', [
                'admin_email' => $adminEmail,
            ]);

            // 🔥 Envoi email
            $this->dynamicMailerService->send(
                new ChatbotLeadNotification($lead),
                $adminEmail
            );

            Log::channel('newsletter')->info('CHATBOT ADMIN EMAIL SENT', [
                'to' => $adminEmail,
            ]);

            $this->dynamicMailerService->send(
                new ChatbotLeadConfirmationMail($lead),
                $lead->email
            );

            Log::channel('newsletter')->info('CHATBOT USER CONFIRMATION EMAIL SENT', [
                'to' => $lead->email,
            ]);


            return response()->json([
                'success' => true,
                'message' => 'Merci, vos coordonnées ont bien été enregistrées.',
            ]);

        } catch (\Throwable $e) {

            Log::channel('newsletter')->error('CHATBOT LEAD ERROR', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Impossible d’enregistrer vos coordonnées pour le moment.',
            ], 500);
        }
    }

}