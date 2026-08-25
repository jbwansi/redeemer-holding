<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    private function defaultMeta(): array
    {
        return [
            'hero_badge'       => 'Coaching de vie',
            'hero_title_line1' => 'Vous avez l’impression de tourner en rond ?',
            'hero_title_line2' => '',
            'hero_title_line3' => '',
            'hero_subtitle'    => 'Retrouvez une direction claire et passez à l’action.',
            'hero_cta_text'    => 'Clarifier ma situation',
            'hero_secondary_cta_text' => 'Découvrir les accompagnements',
            'hero_cta_url'     => '',
            'hero_image'       => '/assets/images/portrait.jpg',
            'hero_steps'       => [
                ['icon' => 'Clock', 'title' => 'Révélez votre potentiel',      'description' => 'Découvrez vos forces cachées et définissez votre vision personnelle'],
                ['icon' => 'Brain', 'title' => 'Transformez vos habitudes',    'description' => 'Développez des routines quotidiennes soutenues par la science'],
                ['icon' => 'Zap',   'title' => 'Optimisez votre productivité', 'description' => 'Atteignez vos objectifs avec mon système éprouvé'],
            ],
            'hero_testimonial' => [
                'content'  => '',
                'author'   => '',
                'position' => '',
            ],
            'hero_stats'       => [],
            'stats'            => [
                ['value' => '150+', 'label' => 'Clients accompagnés'],
                ['value' => '10+',  'label' => 'Années d\'expérience'],
                ['value' => '40+',  'label' => 'Formations & ateliers'],
                ['value' => '97%',  'label' => 'Taux de satisfaction'],
            ],
            'process_title'    => 'Mon processus d\'accompagnement',
            'process_subtitle' => 'Une méthode simple, humaine et orientée résultats.',
            'process'          => [
                ['icon' => 'MessageCircle', 'title' => 'Premier contact',       'description' => 'Nous clarifions vos objectifs, défis et attentes.'],
                ['icon' => 'Search',        'title' => 'Diagnostic personnalisé', 'description' => 'Nous identifions vos leviers de progression prioritaires.'],
                ['icon' => 'Clipboard',     'title' => 'Plan d\'action',         'description' => 'Vous repartez avec un plan concret et progressif.'],
                ['icon' => 'Target',        'title' => 'Transformation durable', 'description' => 'Nous ajustons ensemble pour ancrer des résultats durables.'],
            ],
            'for_whom_title'   => 'Ce coaching est fait pour vous si…',
            'for_whom_subtitle'=> 'Entrepreneurs, salariés, leaders et porteurs de projet en quête de clarté et d\'impact.',
            'for_whom'         => [
                ['icon' => 'Briefcase', 'title' => 'Entrepreneur(e)s', 'description' => 'Vous voulez structurer votre vision et mieux prioriser vos actions.'],
                ['icon' => 'Users',     'title' => 'Managers & leaders', 'description' => 'Vous souhaitez mieux fédérer, décider et communiquer.'],
                ['icon' => 'Rocket',    'title' => 'Professionnels en transition', 'description' => 'Vous cherchez un nouveau cap clair et réaliste.'],
            ],
            'testimonials_title' => 'Ce que disent mes clients',
            'testimonials'     => [],
            'trainings_title' => 'Prochaines formations',
            'video_enabled'  => false,
            'video_url'      => '',
            'video_title'    => 'Bienvenue dans mon univers',
            'video_subtitle' => 'Une courte vidéo pour faire connaissance et vous présenter ma démarche.',
            'events_gallery_enabled' => true,
            'events_gallery_title' => 'Galerie photos',
            'events_gallery_images' => [],
            'events_gallery_captions' => [],
            'blog_title'       => 'Derniers articles',
            'cta_benefits'     => [
                ['text' => 'Identifiez vos blocages actuels et opportunités inexploitées'],
                ['text' => 'Découvrez les 3 étapes clés pour transformer votre productivité'],
                ['text' => 'Repartez avec un plan d\'action personnalisé et applicable immédiatement'],
            ],
        ];
    }

    public function edit()
    {
        $page = Page::query()->firstOrCreate(
            ['slug' => 'accueil'],
            [
                'title'   => 'Accueil',
                'content' => '',
                'meta'    => $this->defaultMeta(),
                'status'  => true,
                'user_id' => Auth::id() ?? User::query()->value('id'),
            ]
        );

        return Inertia::render('backend/home/edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request)
{
    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'nullable|string',
        'meta'    => 'nullable|array',

        'gallery_uploads'   => 'nullable|array',
        'gallery_uploads.*' => 'nullable|image|max:5120',

        'hero_uploads'   => 'nullable|array',
        'hero_uploads.*' => 'nullable|image|max:5120',
    ]);

    $page = Page::where('slug', 'accueil')->firstOrFail();

    $meta = $validated['meta'] ?? [];
    $galleryImages = data_get($meta, 'events_gallery_images', []);
    $galleryCaptions = data_get($meta, 'events_gallery_captions', []);
    $heroImages = data_get($meta, 'hero_images', []);

    $imageService = app(ImageService::class);

    foreach (($request->file('gallery_uploads') ?? []) as $index => $file) {
        if ($file) {
            $uploaded = $imageService->uploadImage($file, 'home/gallery', [
                'large' => ['width' => 1600, 'height' => 1100],
            ]);

            $storedPath = data_get($uploaded, 'large', data_get($uploaded, 'original'));
            $galleryImages[$index] = asset('storage/' . $storedPath);
        }
    }

    foreach (($request->file('hero_uploads') ?? []) as $index => $file) {
        if ($file) {
            $uploaded = $imageService->uploadImage($file, 'home/hero', [
                'large' => ['width' => 1800, 'height' => 1400],
            ]);

            $storedPath = data_get($uploaded, 'large', data_get($uploaded, 'original'));
            $heroImages[$index] = asset('storage/' . $storedPath);
        }
    }

    $meta['events_gallery_enabled'] = filter_var(
        data_get($meta, 'events_gallery_enabled', true),
        FILTER_VALIDATE_BOOLEAN,
        FILTER_NULL_ON_FAILURE
    );

    if ($meta['events_gallery_enabled'] === null) {
        $meta['events_gallery_enabled'] = true;
    }

    $meta['video_enabled'] = filter_var(
        data_get($meta, 'video_enabled', false),
        FILTER_VALIDATE_BOOLEAN,
        FILTER_NULL_ON_FAILURE
    ) ?? false;

    $meta['video_url'] = trim((string) data_get($meta, 'video_url', ''));

    $meta['hero_images'] = array_values(array_filter(array_map(function ($image) {
        return is_string($image) ? trim($image) : '';
    }, $heroImages), function ($image) {
        return $image !== '';
    }));

    $meta['events_gallery_images'] = array_values(array_map(function ($image) {
        return is_string($image) ? trim($image) : '';
    }, $galleryImages));

    $meta['events_gallery_captions'] = array_values(array_map(function ($caption) {
        return is_string($caption) ? trim($caption) : '';
    }, $galleryCaptions));

    $galleryCount = count($meta['events_gallery_images']);
    $meta['events_gallery_captions'] = array_pad(
        array_slice($meta['events_gallery_captions'], 0, $galleryCount),
        $galleryCount,
        ''
    );

    $page->update([
        'title'   => $validated['title'],
        'content' => $validated['content'] ?? null,
        'meta'    => $meta,
    ]);

    return back()->with('success', 'Page d\'accueil mise à jour avec succès.');
}
}
