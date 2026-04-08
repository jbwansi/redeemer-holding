<?php

namespace App\Services;

class SeoService
{
    public static function defaults(): array
    {
        $siteName   = config('app.name');
        $desc       = config('app.description', 'Découvrez votre véritable potentiel et vivez une vie épanouie grâce à la transformation par les valeurs.');
        $subtitle   = 'Transformation personnelle par les valeurs';

        return [
            'title'          => $siteName . ' – ' . $subtitle,
            'description'    => $desc,
            'og_title'       => $siteName . ' – ' . $subtitle,
            'og_description' => self::excerpt($desc, 200),
            'og_image'       => asset('assets/images/logo.png'),
            'og_type'        => 'website',
            'canonical'      => url()->current(),
            'robots'         => 'index, follow',
            'schema'         => self::websiteSchema(),
        ];
    }

    public static function page(string $title, string $description = '', ?string $image = null, string $type = 'website', ?array $extra = null): array
    {
        $siteName = config('app.name');
        $desc     = $description ?: config('app.description', '');
        $img      = $image ?: asset('assets/images/logo.png');

        $data = [
            'title'          => $title . ' | ' . $siteName,
            'description'    => self::excerpt($desc, 155),
            'og_title'       => $title . ' | ' . $siteName,
            'og_description' => self::excerpt($desc, 200),
            'og_image'       => $img,
            'og_type'        => $type,
            'canonical'      => url()->current(),
            'robots'         => 'index, follow',
            'schema'         => self::websiteSchema(),
        ];

        if ($extra) {
            $data = array_merge($data, $extra);
        }

        return $data;
    }

    public static function article(string $title, string $description, ?string $image, string $publishedAt, string $author = ''): array
    {
        $base = self::page($title, $description, $image, 'article');
        $base['schema'] = array_merge(
            self::websiteSchema(),
            self::articleSchema($title, $description, $image, $publishedAt, $author)
        );

        return $base;
    }

    public static function event(string $title, string $description, ?string $image, string $startDate, ?string $location = null): array
    {
        $base = self::page($title, $description, $image, 'website');
        $base['schema'] = self::eventSchema($title, $description, $image, $startDate, $location);

        return $base;
    }

    // -----------------------------------------------------------------------
    // Image extraction helper
    // -----------------------------------------------------------------------

    /**
     * Extract the first usable URL from a featured_image array.
     * The accessor can return: [[thumb=>url, medium=>url, large=>url], ...]
     * or just [url, url, ...].
     */
    public static function firstImageUrl($featuredImage): ?string
    {
        if (empty($featuredImage) || !is_array($featuredImage)) {
            return null;
        }

        $first = $featuredImage[0] ?? null;

        if (is_string($first)) {
            return $first;
        }

        if (is_array($first)) {
            return $first['medium'] ?? $first['large'] ?? $first['thumbnail'] ?? array_values($first)[0] ?? null;
        }

        return null;
    }

    // -----------------------------------------------------------------------
    // Text helpers
    // -----------------------------------------------------------------------

    public static function excerpt(string $text, int $max): string
    {
        $clean = strip_tags((string) $text);
        $clean = preg_replace('/\s+/', ' ', trim($clean));

        return mb_strlen($clean) > $max
            ? rtrim(mb_substr($clean, 0, $max - 3)) . '...'
            : $clean;
    }

    // -----------------------------------------------------------------------
    // Schema.org helpers
    // -----------------------------------------------------------------------

    private static function websiteSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type'    => 'WebSite',
            'name'     => config('app.name'),
            'url'      => url('/'),
        ];
    }

    private static function articleSchema(string $title, string $description, ?string $image, string $publishedAt, string $author): array
    {
        $schema = [
            '@context'        => 'https://schema.org',
            '@type'           => 'Article',
            'headline'        => $title,
            'description'     => self::excerpt($description, 200),
            'datePublished'   => $publishedAt,
            'publisher'       => [
                '@type' => 'Organization',
                'name'  => config('app.name'),
                'logo'  => ['@type' => 'ImageObject', 'url' => asset('assets/images/logo.png')],
            ],
        ];

        if ($image) {
            $schema['image'] = $image;
        }
        if ($author) {
            $schema['author'] = ['@type' => 'Person', 'name' => $author];
        }

        return $schema;
    }

    private static function eventSchema(string $title, string $description, ?string $image, string $startDate, ?string $location): array
    {
        $schema = [
            '@context'    => 'https://schema.org',
            '@type'       => 'Event',
            'name'        => $title,
            'description' => self::excerpt($description, 200),
            'startDate'   => $startDate,
            'organizer'   => [
                '@type' => 'Organization',
                'name'  => config('app.name'),
                'url'   => url('/'),
            ],
        ];

        if ($image) {
            $schema['image'] = $image;
        }
        if ($location) {
            $schema['location'] = ['@type' => 'Place', 'name' => $location];
        }

        return $schema;
    }
}
