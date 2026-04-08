<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Formation;
use App\Models\Post;
use App\Models\Service;
use App\Services\SeoService;
use Illuminate\Support\Facades\Route;

class SitemapController extends Controller
{
    /**
     * Sitemap index listing individual sitemap files.
     */
    public function index()
    {
        $sitemaps = [
            ['loc' => route('sitemap.static'),     'lastmod' => now()->toAtomString()],
            ['loc' => route('sitemap.events'),     'lastmod' => optional(Event::published()->latest('updated_at')->value('updated_at'))->toAtomString() ?? now()->toAtomString()],
            ['loc' => route('sitemap.formations'), 'lastmod' => optional(Formation::published()->latest('updated_at')->value('updated_at'))->toAtomString() ?? now()->toAtomString()],
            ['loc' => route('sitemap.posts'),      'lastmod' => optional(Post::published()->latest('updated_at')->value('updated_at'))->toAtomString() ?? now()->toAtomString()],
            ['loc' => route('sitemap.services'),   'lastmod' => optional(Service::where('status', 1)->latest('updated_at')->value('updated_at'))->toAtomString() ?? now()->toAtomString()],
        ];

        $rows = [];
        foreach ($sitemaps as $sitemap) {
            $rows[] = '  <sitemap>';
            $rows[] = '    <loc>' . htmlspecialchars($sitemap['loc'], ENT_XML1) . '</loc>';
            $rows[] = '    <lastmod>' . $sitemap['lastmod'] . '</lastmod>';
            $rows[] = '  </sitemap>';
        }

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            . "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
            . implode("\n", $rows)
            . "\n</sitemapindex>";

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }

    /**
     * Static pages sitemap.
     */
    public function staticPages()
    {
        $staticRoutes = [
            'home'        => ['changefreq' => 'daily',   'priority' => '1.0'],
            'about'       => ['changefreq' => 'monthly', 'priority' => '0.8'],
            'services'    => ['changefreq' => 'weekly',  'priority' => '0.8'],
            'contact'     => ['changefreq' => 'monthly', 'priority' => '0.7'],
            'formations'  => ['changefreq' => 'daily',   'priority' => '0.8'],
            'evenements'  => ['changefreq' => 'daily',   'priority' => '0.8'],
            'blogs'       => ['changefreq' => 'daily',   'priority' => '0.8'],
            'faq'         => ['changefreq' => 'monthly', 'priority' => '0.6'],
            'terms.show'  => ['changefreq' => 'yearly',  'priority' => '0.3'],
            'policy.show' => ['changefreq' => 'yearly',  'priority' => '0.3'],
            'cookies.show'=> ['changefreq' => 'yearly',  'priority' => '0.3'],
        ];

        $urls = [];
        foreach ($staticRoutes as $routeName => $meta) {
            if (Route::has($routeName)) {
                $urls[] = array_merge(['loc' => route($routeName), 'lastmod' => now()->toAtomString()], $meta);
            }
        }

        return $this->buildXml($urls);
    }

    /**
     * Events sitemap with image support.
     */
    public function events()
    {
        $events = Event::published()->select(['slug', 'title', 'description', 'featured_image', 'updated_at'])->get();

        $urls = $events->map(function ($event) {
            $image = SeoService::firstImageUrl($event->featured_image ?? []);
            return [
                'loc'        => route('evenements.details', ['slug' => $event->slug]),
                'lastmod'    => optional($event->updated_at)->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => '0.7',
                'image'      => $image ? [
                    'loc'     => $image,
                    'title'   => $event->title ?? '',
                    'caption' => SeoService::excerpt($event->description ?? '', 100),
                ] : null,
            ];
        })->all();

        return $this->buildXml($urls, true);
    }

    /**
     * Formations sitemap with image support.
     */
    public function formations()
    {
        $formations = Formation::published()->select(['slug', 'title', 'description', 'featured_image', 'updated_at'])->get();

        $urls = $formations->map(function ($formation) {
            $image = SeoService::firstImageUrl($formation->featured_image ?? []);
            return [
                'loc'        => route('formations.details', ['slug' => $formation->slug]),
                'lastmod'    => optional($formation->updated_at)->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => '0.7',
                'image'      => $image ? [
                    'loc'   => $image,
                    'title' => $formation->title ?? '',
                ] : null,
            ];
        })->all();

        return $this->buildXml($urls, true);
    }

    /**
     * Blog posts sitemap with image support.
     */
    public function posts()
    {
        $posts = Post::published()->select(['slug', 'title', 'excerpt', 'featured_image', 'updated_at'])->get();

        $urls = $posts->map(function ($post) {
            $image = SeoService::firstImageUrl($post->featured_image ?? []);
            return [
                'loc'        => route('blogs.details', ['slug' => $post->slug]),
                'lastmod'    => optional($post->updated_at)->toAtomString(),
                'changefreq' => 'monthly',
                'priority'   => '0.6',
                'image'      => $image ? [
                    'loc'     => $image,
                    'title'   => $post->title ?? '',
                    'caption' => SeoService::excerpt($post->excerpt ?? '', 100),
                ] : null,
            ];
        })->all();

        return $this->buildXml($urls, true);
    }

    /**
     * Services sitemap.
     */
    public function services()
    {
        $services = Service::where('status', 1)->select(['slug', 'updated_at'])->get();

        $urls = $services->map(function ($service) {
            return [
                'loc'        => route('services.details', ['slug' => $service->slug]),
                'lastmod'    => optional($service->updated_at)->toAtomString(),
                'changefreq' => 'monthly',
                'priority'   => '0.6',
            ];
        })->all();

        return $this->buildXml($urls);
    }

    /**
     * Legacy single sitemap (keep the named route 'sitemap' intact).
     */
    public function main()
    {
        $urls = [];

        $staticRoutes = [
            'home'        => ['changefreq' => 'daily',   'priority' => '1.0'],
            'about'       => ['changefreq' => 'monthly', 'priority' => '0.8'],
            'services'    => ['changefreq' => 'weekly',  'priority' => '0.8'],
            'contact'     => ['changefreq' => 'monthly', 'priority' => '0.7'],
            'formations'  => ['changefreq' => 'daily',   'priority' => '0.8'],
            'evenements'  => ['changefreq' => 'daily',   'priority' => '0.8'],
            'blogs'       => ['changefreq' => 'daily',   'priority' => '0.8'],
            'faq'         => ['changefreq' => 'monthly', 'priority' => '0.6'],
            'terms.show'  => ['changefreq' => 'yearly',  'priority' => '0.3'],
            'policy.show' => ['changefreq' => 'yearly',  'priority' => '0.3'],
            'cookies.show'=> ['changefreq' => 'yearly',  'priority' => '0.3'],
        ];

        foreach ($staticRoutes as $routeName => $meta) {
            if (Route::has($routeName)) {
                $urls[] = array_merge(['loc' => route($routeName), 'lastmod' => now()->toAtomString()], $meta);
            }
        }

        Event::published()->select(['slug', 'title', 'featured_image', 'description', 'updated_at'])->get()->each(function ($event) use (&$urls) {
            $image = SeoService::firstImageUrl($event->featured_image ?? []);
            $urls[] = [
                'loc'        => route('evenements.details', ['slug' => $event->slug]),
                'lastmod'    => optional($event->updated_at)->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => '0.7',
                'image'      => $image ? ['loc' => $image, 'title' => $event->title ?? ''] : null,
            ];
        });

        Formation::published()->select(['slug', 'title', 'featured_image', 'updated_at'])->get()->each(function ($formation) use (&$urls) {
            $image = SeoService::firstImageUrl($formation->featured_image ?? []);
            $urls[] = [
                'loc'        => route('formations.details', ['slug' => $formation->slug]),
                'lastmod'    => optional($formation->updated_at)->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => '0.7',
                'image'      => $image ? ['loc' => $image, 'title' => $formation->title ?? ''] : null,
            ];
        });

        Post::published()->select(['slug', 'title', 'featured_image', 'excerpt', 'updated_at'])->get()->each(function ($post) use (&$urls) {
            $image = SeoService::firstImageUrl($post->featured_image ?? []);
            $urls[] = [
                'loc'        => route('blogs.details', ['slug' => $post->slug]),
                'lastmod'    => optional($post->updated_at)->toAtomString(),
                'changefreq' => 'monthly',
                'priority'   => '0.6',
                'image'      => $image ? ['loc' => $image, 'title' => $post->title ?? ''] : null,
            ];
        });

        Service::where('status', 1)->select(['slug', 'updated_at'])->get()->each(function ($service) use (&$urls) {
            $urls[] = [
                'loc'        => route('services.details', ['slug' => $service->slug]),
                'lastmod'    => optional($service->updated_at)->toAtomString(),
                'changefreq' => 'monthly',
                'priority'   => '0.6',
            ];
        });

        return $this->buildXml($urls, true);
    }

    // -----------------------------------------------------------------------
    // XML builder
    // -----------------------------------------------------------------------

    private function buildXml(array $urls, bool $withImages = false): \Illuminate\Http\Response
    {
        $imageNs = $withImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';

        $rows = [];
        foreach ($urls as $url) {
            $rows[] = '  <url>';
            $rows[] = '    <loc>' . htmlspecialchars($url['loc'], ENT_XML1) . '</loc>';

            if (!empty($url['lastmod'])) {
                $rows[] = '    <lastmod>' . $url['lastmod'] . '</lastmod>';
            }
            if (!empty($url['changefreq'])) {
                $rows[] = '    <changefreq>' . $url['changefreq'] . '</changefreq>';
            }
            if (!empty($url['priority'])) {
                $rows[] = '    <priority>' . $url['priority'] . '</priority>';
            }

            if ($withImages && !empty($url['image'])) {
                $img = $url['image'];
                $rows[] = '    <image:image>';
                $rows[] = '      <image:loc>' . htmlspecialchars($img['loc'], ENT_XML1) . '</image:loc>';
                if (!empty($img['title'])) {
                    $rows[] = '      <image:title>' . htmlspecialchars($img['title'], ENT_XML1) . '</image:title>';
                }
                if (!empty($img['caption'])) {
                    $rows[] = '      <image:caption>' . htmlspecialchars($img['caption'], ENT_XML1) . '</image:caption>';
                }
                $rows[] = '    </image:image>';
            }

            $rows[] = '  </url>';
        }

        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . $imageNs . ">\n"
            . implode("\n", $rows)
            . "\n</urlset>";

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
