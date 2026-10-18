<?php

namespace App\Services\Blog;

use App\Models\BlogActor;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class BlogActorService
{
    /**
     * Requests must pass through Laravel's web/EncryptCookies middleware.
     * Resolution never creates an anonymous identity or renews its lifetime.
     * Login uses a separate account actor: anonymous contributions are never
     * transferred, merged or claimed. Logout can resume the unexpired cookie.
     */
    public function resolve(Request $request): ?BlogActor
    {
        if ($user = $request->user()) {
            if (! $user->is_active) {
                throw new AccessDeniedHttpException('Compte inactif.');
            }

            return BlogActor::query()->firstOrCreate(
                ['user_id' => $user->getAuthIdentifier()],
                ['kind' => 'user'],
            );
        }

        $token = $request->cookie(config('blog.anonymous_cookie'));
        if (! is_string($token) || ! preg_match('/\A[a-f0-9]{64}\z/', $token)) {
            return null;
        }

        return BlogActor::query()
            ->where('kind', 'anonymous')
            ->whereNull('user_id')
            ->where('token_hash', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Explicit initialization only. The caller must attach the returned cookie
     * to a response inside the web middleware stack (never exempt this cookie
     * from EncryptCookies). No token is returned in JSON or model attributes.
     *
     * @return array{actor: BlogActor, cookie: ?Cookie}
     */
    public function initialize(Request $request): array
    {
        if ($actor = $this->resolve($request)) {
            return ['actor' => $actor, 'cookie' => null];
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = now()->addMinutes(max(1, (int) config('blog.anonymous_lifetime_minutes')));
        $actor = BlogActor::query()->create([
            'kind' => 'anonymous',
            'token_hash' => hash('sha256', $token),
            'expires_at' => $expiresAt,
        ]);

        return [
            'actor' => $actor,
            'cookie' => Cookie::create(config('blog.anonymous_cookie'))
                ->withValue($token)
                ->withExpires($expiresAt)
                ->withPath('/blogs')
                ->withSecure(app()->environment(['production', 'staging']) || $request->isSecure())
                ->withHttpOnly(true)
                ->withSameSite(Cookie::SAMESITE_LAX),
        ];
    }

    /**
     * Revokes credentials without deleting contributions. Expired actors remain
     * historical authors; even a replayed cookie can no longer resolve them.
     */
    public function revokeAnonymous(BlogActor $actor): void
    {
        if ($actor->kind !== 'anonymous') {
            throw new \InvalidArgumentException('An anonymous actor is required.');
        }

        $actor->forceFill(['token_hash' => null, 'expires_at' => now()])->save();
    }
}
