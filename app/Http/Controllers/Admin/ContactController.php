<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ContactController extends Controller
{
    private function defaultFaqs(): array
    {
        return [
            [
                'question' => 'Comment se deroule une seance de coaching?',
                'answer' => 'Les seances se deroulent en visioconference ou en presentiel selon votre preference. Nous commencons par definir vos objectifs, puis elaborons un plan d\'action personnalise.',
            ],
            [
                'question' => 'Combien de seances sont necessaires?',
                'answer' => 'Le nombre de seances varie selon vos objectifs. Generalement, un programme complet comprend 8 a 12 seances, mais nous adaptons toujours a vos besoins specifiques.',
            ],
            [
                'question' => 'Proposez-vous des tarifs degressifs?',
                'answer' => 'Oui, des forfaits degressifs sont disponibles pour les engagements sur plusieurs seances. N\'hesitez pas a me contacter pour obtenir un devis personnalise.',
            ],
            [
                'question' => 'Comment choisir le bon service ?',
                'answer' => 'Le plus simple est de réserver un premier échange. En 20 à 30 minutes, nous identifions le format le plus adapté à votre besoin.',
            ],
            [
                'question' => 'Les accompagnements sont-ils personnalises ?',
                'answer' => 'Oui. Chaque mission est construite sur vos objectifs, votre contexte et votre rythme d\'exécution.',
            ],
            [
                'question' => 'Les sessions se font-elles a distance ?',
                'answer' => 'Oui, en visio, en présentiel, ou en format hybride selon votre disponibilité et votre localisation.',
            ],
        ];
    }

    private function normalizeFaqs(array $faqs): array
    {
        $clean = collect($faqs)
            ->filter(fn ($faq) => is_array($faq))
            ->map(function ($faq) {
                return [
                    'question' => trim((string) data_get($faq, 'question', '')),
                    'answer' => trim((string) data_get($faq, 'answer', '')),
                ];
            })
            ->filter(fn ($faq) => $faq['question'] !== '' && $faq['answer'] !== '')
            ->values();

        if ($clean->count() < 6) {
            $defaults = collect($this->defaultFaqs());
            $merged = $clean->concat($defaults);

            $dedup = [];
            $seen = [];
            foreach ($merged as $faq) {
                $key = mb_strtolower($faq['question']);
                if (!isset($seen[$key])) {
                    $dedup[] = $faq;
                    $seen[$key] = true;
                }
            }

            return $dedup;
        }

        return $clean->all();
    }

    private function defaultMeta(): array
    {
        return [
            'badge' => 'Contact',
            'hero_title' => 'Discutons de votre transformation',
            'hero_highlight' => 'transformation',
            'hero_subtitle' => 'Je suis là pour répondre à vos questions et vous accompagner dans votre parcours de développement personnel et professionnel.',
            'form_title' => 'Envoyez-moi un message',
            'form_subtitle' => 'Complétez le formulaire ci-dessous et je vous répondrai dans les plus brefs délais.',
            'form_sla_title' => 'Réponse garantie',
            'form_sla_text' => 'Je réponds à chaque demande qualifiée sous 24h ouvrées.',
            'honeypot_enabled' => true,
            'privacy_text' => 'En soumettant ce formulaire, vous acceptez notre politique de confidentialité.',
            'privacy_url' => '/politique-de-confidentialite',
            'calendly_title' => 'Prendre rendez-vous',
            'calendly_subtitle' => 'Consultation gratuite de 30 minutes',
            'calendly_description' => 'Réservez directement un créneau dans mon agenda pour discuter de vos besoins et objectifs.',
            'calendly_button' => 'Réserver un appel',
            'calendly_social_proof' => 'Plus de 300 accompagnements réalisés.',
            'email_description' => 'Réponse sous 24h ouvrées',
            'phone_description' => 'Lun-Ven, 9h-18h',
            'address_description' => 'Suisse',
            'map_embed_url' => 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d43692.81579896015!2d7.175105!3d46.808226!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478e691661b56407%3A0xb72fd47cc9f3dc72!2sAv.%20Jean-Marie-Musy%205%2C%201700%20Fribourg%2C%20Suisse!5e0!3m2!1sfr!2sus!4v1740007896823!5m2!1sfr!2sus',
            'subjects' => [
                ['value' => 'coaching', 'label' => 'Coaching individuel'],
                ['value' => 'consultation', 'label' => 'Consultation'],
                ['value' => 'formation', 'label' => 'Formation en groupe'],
                ['value' => 'partenariat', 'label' => 'Partenariat'],
                ['value' => 'autre', 'label' => 'Autre demande'],
            ],
            'faqs' => $this->defaultFaqs(),
            'faq_title' => 'Questions fréquentes',
            'faq_link_label' => 'Voir toutes les questions fréquentes',
            'faq_link_url' => '/faq',
        ];
    }

    public function edit()
    {
        $page = Page::query()->firstOrCreate(
            ['slug' => 'contact'],
            [
                'title'   => 'Contact',
                'content' => '',
                'meta'    => $this->defaultMeta(),
                'status'  => true,
                'user_id' => Auth::id() ?? User::query()->value('id'),
            ]
        );

        $meta = is_array($page->meta) ? $page->meta : [];
        $normalizedFaqs = $this->normalizeFaqs((array) data_get($meta, 'faqs', []));
        if ($normalizedFaqs !== data_get($meta, 'faqs', [])) {
            $meta['faqs'] = $normalizedFaqs;
            $page->update(['meta' => $meta]);
        }

        return Inertia::render('backend/contact/edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
            'meta'    => 'nullable|array',
        ]);

        $meta = $validated['meta'] ?? [];
        $faqLinkUrl = trim((string) data_get($meta, 'faq_link_url', '/faq'));
        $faqLinkUrlLower = strtolower($faqLinkUrl);
        if (
            $faqLinkUrlLower === '' ||
            $faqLinkUrlLower === '#faq' ||
            $faqLinkUrlLower === '/contact' ||
            $faqLinkUrlLower === 'contact' ||
            str_contains($faqLinkUrlLower, '/contact#faq') ||
            str_contains($faqLinkUrlLower, '/contact/#faq')
        ) {
            $faqLinkUrl = '/faq';
        }
        $meta['faq_link_url'] = $faqLinkUrl;
        $meta['faqs'] = $this->normalizeFaqs((array) data_get($meta, 'faqs', []));
        $validated['meta'] = $meta;

        $page = Page::where('slug', 'contact')->firstOrFail();
        $page->update($validated);

        return back()->with('success', 'Page contact mise à jour avec succès.');
    }
}
