<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatbotController extends Controller
{
    private function defaultMeta(): array
    {
        return [
            'enabled' => true,
            'title' => 'Assistant Redeemer',
            'welcome_message' => 'Bonjour. Je suis l\'assistant Redeemer. Je peux vous aider 24h/24 sur les formations, evenements, services et contacts.',
            'quick_questions' => [
                'Quelles formations sont disponibles ?',
                'Comment participer a un evenement ?',
                'Comment vous contacter ?',
            ],
            'lead_capture_enabled' => true,
            'lead_prompt' => 'Laissez votre email pour etre recontacte rapidement.',
            'faqs' => [
                ['question' => 'Comment m\'inscrire ?', 'answer' => 'Vous pouvez vous inscrire directement depuis la page de la formation ou de l\'evenement.'],
                ['question' => 'Proposez-vous du coaching ?', 'answer' => 'Oui, plusieurs accompagnements sont disponibles selon votre besoin.'],
            ],
        ];
    }

    public function edit()
    {
        $page = Page::query()->firstOrCreate(
            ['slug' => 'chatbot'],
            [
                'title' => 'Chatbot',
                'content' => '',
                'meta' => $this->defaultMeta(),
                'status' => true,
                'user_id' => Auth::id() ?? User::query()->value('id'),
            ]
        );

        return Inertia::render('backend/chatbot/edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        $page = Page::where('slug', 'chatbot')->firstOrFail();
        $page->update($validated);

        return back()->with('success', 'Configuration chatbot mise à jour avec succès.');
    }
}
