<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\ChatbotLead;
use App\Models\Page;
use App\Services\VisitorChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(private readonly VisitorChatbotService $chatbotService)
    {
    }

    public function message(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $result = $this->chatbotService->reply($validated['message']);

        return response()->json($result);
    }

    public function config(): JsonResponse
    {
        $meta = Page::where('slug', 'chatbot')->value('meta') ?? [];

        return response()->json([
            'enabled' => (bool) data_get($meta, 'enabled', true),
            'title' => (string) data_get($meta, 'title', 'Assistant Redeemer'),
            'welcome_message' => (string) data_get($meta, 'welcome_message', 'Bonjour. Je suis l\'assistant Redeemer. Je peux vous aider 24h/24 sur les formations, événements, services et contacts.'),
            'quick_questions' => data_get($meta, 'quick_questions', [
                'Quelles formations sont disponibles ?',
                'Comment participer à un événement ?',
                'Comment vous contacter ?',
            ]),
            'lead_capture_enabled' => (bool) data_get($meta, 'lead_capture_enabled', true),
            'lead_prompt' => (string) data_get($meta, 'lead_prompt', 'Laissez votre email pour être recontacté rapidement.'),
        ]);
    }

    public function lead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        ChatbotLead::query()->create([
            'email' => $validated['email'],
            'name' => $validated['name'] ?? null,
            'source' => 'visitor_chatbot',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Merci, vos coordonnées ont bien été enregistrées.',
        ]);
    }
}
