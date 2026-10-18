<?php

namespace App\Services\Blog;

use App\Models\BlogActor;
use App\Models\Post;
use App\Models\PostComment;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PostCommentService
{
    public function formToken(Post $post, BlogActor $actor): string
    {
        return Crypt::encryptString(json_encode([
            'post' => $post->id, 'actor' => $actor->id, 'issued' => now()->timestamp,
            'key' => (string) Str::uuid(),
        ], JSON_THROW_ON_ERROR));
    }

    public function submit(Post $post, BlogActor $actor, array $data): void
    {
        try {
            $form = json_decode(Crypt::decryptString($data['comment_form_token']), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Exception) {
            throw ValidationException::withMessages(['comment_form_token' => 'Formulaire invalide ou expiré.']);
        }
        if (! is_array($form) || ! is_int($form['issued'] ?? null)) {
            throw ValidationException::withMessages(['comment_form_token' => 'Formulaire invalide ou expiré.']);
        }
        $age = now()->timestamp - $form['issued'];
        if (($form['post'] ?? null) !== $post->id || ($form['actor'] ?? null) !== $actor->id
            || ! Str::isUuid($form['key'] ?? '') || $age < config('blog.comments.minimum_seconds')
            || $age > config('blog.comments.form_lifetime_seconds')) {
            throw ValidationException::withMessages(['comment_form_token' => 'Formulaire invalide, trop rapide ou expiré.']);
        }
        $body = trim(str_replace(["\r\n", "\r"], "\n", $data['body']));
        if (preg_match_all('~https?://|www\.~i', $body) > config('blog.comments.max_links')) {
            throw ValidationException::withMessages(['body' => 'Le commentaire contient trop de liens.']);
        }
        $hash = hash('sha256', preg_replace('/\s+/u', ' ', $body));
        DB::transaction(function () use ($post, $actor, $data, $form, $body, $hash) {
            // Serialize submissions per actor on MySQL. SQLite serializes writes.
            BlogActor::query()->whereKey($actor->id)->lockForUpdate()->firstOrFail();
            $existing = $actor->comments()->where('submission_key', $form['key'])->first();
            if ($existing) {
                if ($existing->post_id !== $post->id || $existing->content_hash !== $hash) {
                    throw ValidationException::withMessages(['comment_form_token' => 'Ce formulaire a déjà été utilisé.']);
                }

                return;
            }
            if ($actor->comments()->where('post_id', $post->id)->where('content_hash', $hash)
                ->where('created_at', '>=', now()->subSeconds(config('blog.comments.duplicate_window_seconds')))->exists()) {
                throw ValidationException::withMessages(['body' => 'Vous avez déjà envoyé ce commentaire récemment.']);
            }
            PostComment::create([
                'post_id' => $post->id, 'blog_actor_id' => $actor->id,
                'display_name' => trim($data['display_name']),
                'body' => $body, 'status' => 'pending', 'submission_key' => $form['key'], 'content_hash' => $hash,
            ]);
        }, 3);
    }
}
