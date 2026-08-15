<?php

namespace App\Services;

use App\Coach\Services\CoachSettingsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class AcceptanceDatasetService
{
    public const SLUGS = ['TEST-A383-FREE', 'TEST-A383-PAID', 'TEST-A383-SERVICE-FREE', 'TEST-A383-EVENT-FREE', 'TEST-A383-EVENT-PAID'];

    public function inspect(): array
    {
        $runId = (string) config('acceptance.dataset_id', 'A383-v1');
        $manifestRelative = "acceptance/{$runId}.json";
        if (Storage::disk('local')->exists($manifestRelative)) {
            $manifest = $this->cleanupPlan($runId);

            return ['run_id' => $runId, 'state' => 'already_provisioned', 'manifest' => "storage/app/private/{$manifestRelative}", 'counts' => array_map('count', $manifest['rows']), 'dependencies' => [], 'conflicts' => []];
        }

        $accounts = $this->accountConfiguration();
        $dependencies = $this->configurationErrors($accounts);
        $category = DB::table('event_categories')->whereNull('deleted_at')->orderBy('id')->first();
        if (! $category) {
            $dependencies[] = 'Une catégorie événement existante est requise en lecture seule.';
        }

        $emails = array_values(array_filter(array_column($accounts, 'email')));
        $conflicts = [
            ...DB::table('users')->whereIn('email', $emails)->pluck('email')->all(),
            ...DB::table('trainings')->whereIn('slug', array_slice(self::SLUGS, 0, 2))->pluck('slug')->all(),
            ...DB::table('services')->where('slug', self::SLUGS[2])->pluck('slug')->all(),
            ...DB::table('events')->whereIn('slug', array_slice(self::SLUGS, 3, 2))->pluck('slug')->all(),
        ];
        $careerEnabled = app(CoachSettingsService::class)->moduleEnabled('career');

        return [
            'run_id' => $runId, 'state' => 'ready',
            'manifest' => "storage/app/private/{$manifestRelative}",
            'document' => "storage/app/private/coach/acceptance/{$runId}/TEST-A383-profile.txt",
            'public_resource' => "storage/app/public/acceptance/{$runId}/TEST-A383-resource.txt",
            'event_category_id' => $category?->id, 'career_enabled' => $careerEnabled,
            'dependencies' => array_values(array_unique($dependencies)),
            'conflicts' => array_values(array_unique($conflicts)),
            'counts' => $this->expectedCounts($careerEnabled), 'slugs' => self::SLUGS,
            'accounts' => array_map(static fn (array $account): array => ['name' => $account['name'], 'email_configured' => filled($account['email']), 'role' => $account['role'], 'allowlisted' => $account['allowlisted']], $accounts),
        ];
    }

    public function provision(array $plan): array
    {
        if (($plan['state'] ?? null) === 'already_provisioned') {
            return $this->cleanupPlan($plan['run_id']);
        }
        if ($plan['dependencies'] || $plan['conflicts']) {
            throw new RuntimeException('Provisioning refusé : configuration manquante ou conflit existant.');
        }

        $runId = $plan['run_id'];
        $accounts = $this->accountConfiguration();
        $password = (string) config('acceptance.password');
        $manifest = ['version' => 2, 'dataset_id' => $runId, 'run_id' => $runId, 'created_at' => now()->toAtomString(), 'rows' => [], 'files' => []];
        $documentRelative = "acceptance/{$runId}/TEST-A383-profile.txt";
        $resourceRelative = "acceptance/{$runId}/TEST-A383-resource.txt";
        $manifestRelative = "acceptance/{$runId}.json";

        try {
            DB::transaction(function () use ($plan, $accounts, $password, &$manifest, $documentRelative, $resourceRelative): void {
                $add = function (string $table, array $data, array $identity) use (&$manifest): int {
                    $id = DB::table($table)->insertGetId([...$data, 'created_at' => now(), 'updated_at' => now()]);
                    $manifest['rows'][$table][] = ['id' => $id, 'identity' => $identity];

                    return $id;
                };

                $admin = $this->addAccount($add, $accounts['admin'], $password);
                $client = $this->addAccount($add, $accounts['client'], $password);
                $this->addAccount($add, $accounts['forbidden'], $password);

                $published = now()->subMinute();
                $trainingBase = fn (string $slug, int $price): array => ['user_id' => $admin, 'title' => $slug, 'slug' => $slug, 'excerpt' => 'Dataset de recette contrôlé.', 'content' => '<p>Contenu TEST A3.8.3.</p>', 'start_date' => now()->addDays(30), 'end_date' => now()->addDays(32), 'location' => 'En ligne — TEST', 'max_participants' => 10, 'price' => $price, 'views' => 0, 'is_published' => 1, 'is_featured' => 0, 'published_at' => $published, 'tags' => json_encode(['TEST-A383'])];
                $free = $add('trainings', $trainingBase(self::SLUGS[0], 0), ['slug' => self::SLUGS[0]]);
                $add('trainings', $trainingBase(self::SLUGS[1], 25), ['slug' => self::SLUGS[1]]);
                $section1 = $add('training_sections', ['training_id' => $free, 'title' => 'TEST-A383 Section 1', 'description' => 'Section de recette', 'sort_order' => 1, 'is_published' => 1], ['title' => 'TEST-A383 Section 1']);
                $section2 = $add('training_sections', ['training_id' => $free, 'title' => 'TEST-A383 Section 2', 'description' => 'Section de recette', 'sort_order' => 2, 'is_published' => 1], ['title' => 'TEST-A383 Section 2']);
                $lessons = [];
                foreach ([[$section1, 1], [$section1, 2], [$section2, 3]] as [$section, $order]) {
                    $slug = "TEST-A383-LESSON-{$order}";
                    $lessons[] = $add('training_lessons', ['training_id' => $free, 'training_section_id' => $section, 'title' => $slug, 'slug' => $slug, 'content' => '<p>Leçon de recette.</p>', 'sort_order' => $order, 'is_free' => $order === 1, 'is_published' => 1], ['slug' => $slug]);
                }
                $resourceContent = "TEST-A383\nRessource publique non sensible de recette staging.\n";
                Storage::disk('public')->put($resourceRelative, $resourceContent);
                $add('training_resources', ['training_lesson_id' => $lessons[0], 'title' => 'TEST-A383 Resource', 'description' => 'Ressource publique de recette', 'file_path' => $resourceRelative, 'file_disk' => 'public', 'file_type' => 'txt', 'is_downloadable' => 1, 'is_public' => 1, 'sort_order' => 1], ['title' => 'TEST-A383 Resource']);
                $manifest['files'][] = ['disk' => 'public', 'path' => $resourceRelative, 'sha256' => hash('sha256', $resourceContent)];
                $quiz = $add('training_quizzes', ['training_id' => $free, 'training_section_id' => $section2, 'title' => 'TEST-A383 Quiz', 'description' => 'Quiz de recette', 'passing_score' => 70, 'is_published' => 1], ['title' => 'TEST-A383 Quiz']);
                foreach ([1, 2] as $number) {
                    $add('training_quiz_questions', ['training_quiz_id' => $quiz, 'question' => "TEST-A383 Question {$number}", 'options' => json_encode(['Réponse A', 'Réponse B']), 'correct_option_index' => 0, 'sort_order' => $number, 'points' => 1], ['question' => "TEST-A383 Question {$number}"]);
                }

                $add('services', ['user_id' => $admin, 'name' => self::SLUGS[2], 'slug' => self::SLUGS[2], 'excerpt' => 'Service gratuit de recette', 'content' => '<p>TEST A3.8.3.</p>', 'views' => 0, 'status' => 1], ['slug' => self::SLUGS[2]]);
                foreach ([[self::SLUGS[3], 0], [self::SLUGS[4], 20]] as [$slug, $price]) {
                    $add('events', ['category_id' => $plan['event_category_id'], 'user_id' => $admin, 'title' => $slug, 'slug' => $slug, 'description' => 'Événement de recette', 'content' => '<p>TEST A3.8.3.</p>', 'location' => 'En ligne — TEST', 'start_date' => now()->addDays(40), 'end_date' => now()->addDays(40)->addHours(2), 'price' => $price, 'max_participants' => 10, 'views' => 0, 'is_published' => 1, 'published_at' => $published], ['slug' => $slug]);
                }

                $add('professional_profiles', ['user_id' => $client, 'professional_title' => 'TEST-A383 Profil', 'summary' => 'Profil non personnel de recette', 'career_objective' => 'Valider le parcours Coach', 'default_language' => 'fr', 'target_roles' => json_encode(['TEST-A383 Role']), 'target_sectors' => json_encode(['TEST']), 'languages' => json_encode(['fr'])], ['user_id' => $client]);
                $documentContent = "TEST-A383\nDocument non personnel destiné uniquement à la recette staging.\n";
                Storage::disk('coach_private')->put($documentRelative, $documentContent);
                $document = $add('user_documents', ['user_id' => $client, 'type' => 'other', 'original_name' => 'TEST-A383-profile.txt', 'path' => $documentRelative, 'disk' => 'coach_private', 'mime_type' => 'text/plain', 'size' => strlen($documentContent), 'language' => 'fr', 'sha256' => hash('sha256', $documentContent), 'status' => 'uploaded'], ['path' => $documentRelative]);
                $manifest['files'][] = ['disk' => 'coach_private', 'path' => $documentRelative, 'sha256' => hash('sha256', $documentContent)];
                $conversation = $add('coach_conversations', ['user_id' => $client, 'module' => 'general', 'title' => 'TEST-A383 Conversation', 'language' => 'fr', 'status' => 'active', 'context' => json_encode(['document_id' => $document])], ['title' => 'TEST-A383 Conversation']);
                foreach ([['user', 'Message utilisateur TEST-A383'], ['assistant', 'Réponse de démonstration TEST-A383']] as [$role, $content]) {
                    $add('coach_messages', ['coach_conversation_id' => $conversation, 'role' => $role, 'content' => $content, 'input_tokens' => 0, 'output_tokens' => 0], ['content' => $content]);
                }
                if ($plan['career_enabled']) {
                    $goal = $add('career_goals', ['user_id' => $client, 'coach_conversation_id' => $conversation, 'title' => 'TEST-A383 Objectif', 'current_situation' => 'Situation fictive', 'target_role' => 'TEST-A383 Role', 'language' => 'fr', 'status' => 'active', 'progress' => 0, 'submission_token' => (string) Str::uuid()], ['title' => 'TEST-A383 Objectif']);
                    $add('career_actions', ['career_goal_id' => $goal, 'title' => 'TEST-A383 Action', 'description' => 'Action fictive de recette', 'priority' => 'medium', 'status' => 'todo', 'progress' => 0, 'sort_order' => 1, 'source' => 'manual'], ['title' => 'TEST-A383 Action']);
                }
                Storage::disk('local')->put("acceptance/{$plan['run_id']}.json", json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            });
        } catch (Throwable $exception) {
            Storage::disk('coach_private')->delete($documentRelative);
            Storage::disk('public')->delete($resourceRelative);
            Storage::disk('local')->delete($manifestRelative);
            throw $exception;
        }

        @chmod(Storage::disk('local')->path($manifestRelative), 0600);

        return $manifest;
    }

    public function cleanupPlan(string $runId, bool $verifyWorkflowDependents = false): array
    {
        if ($runId !== (string) config('acceptance.dataset_id', 'A383-v1')) {
            throw new RuntimeException('Run-id non reconnu pour ce paquet acceptance.');
        }
        $path = "acceptance/{$runId}.json";
        if (! Storage::disk('local')->exists($path)) {
            throw new RuntimeException('Manifeste introuvable.');
        }
        $manifest = json_decode(Storage::disk('local')->get($path), true, 512, JSON_THROW_ON_ERROR);
        if (($manifest['run_id'] ?? null) !== $runId || ($manifest['dataset_id'] ?? null) !== $runId) {
            throw new RuntimeException('Identité du manifeste invalide.');
        }
        foreach ($manifest['rows'] as $table => $rows) {
            foreach ($rows as $row) {
                $query = DB::table($table)->where('id', $row['id']);
                foreach ($row['identity'] as $column => $value) {
                    $query->where($column, $value);
                }
                if (! $query->exists()) {
                    throw new RuntimeException("Divergence détectée : {$table}#{$row['id']}.");
                }
            }
        }
        foreach ($manifest['files'] as $file) {
            $disk = Storage::disk($file['disk']);
            if (! $disk->exists($file['path']) || hash('sha256', $disk->get($file['path'])) !== $file['sha256']) {
                throw new RuntimeException('Divergence détectée sur un fichier du manifeste.');
            }
        }
        if ($verifyWorkflowDependents) {
            $this->assertNoWorkflowDependents($manifest);
        }

        return $manifest;
    }

    public function cleanup(string $runId): array
    {
        $manifest = $this->cleanupPlan($runId, true);
        $order = ['career_actions', 'career_goals', 'coach_messages', 'coach_conversations', 'user_documents', 'professional_profiles', 'training_quiz_questions', 'training_quizzes', 'training_resources', 'training_lessons', 'training_sections', 'events', 'services', 'trainings', 'users'];
        DB::transaction(function () use ($manifest, $order): void {
            foreach ($order as $table) {
                $ids = array_column($manifest['rows'][$table] ?? [], 'id');
                if ($ids) {
                    DB::table($table)->whereIn('id', $ids)->delete();
                }
            }
        });
        foreach ($manifest['files'] as $file) {
            Storage::disk($file['disk'])->delete($file['path']);
        }
        Storage::disk('local')->delete("acceptance/{$runId}.json");

        return $manifest;
    }

    private function addAccount(callable $add, array $account, string $password): int
    {
        return $add('users', ['name' => $account['name'], 'email' => $account['email'], 'password' => Hash::make($password), 'role' => $account['role'], 'is_active' => 1, 'email_verified_at' => now()], ['email' => $account['email'], 'name' => $account['name'], 'role' => $account['role']]);
    }

    private function accountConfiguration(): array
    {
        $allowed = array_map('strtolower', config('mail.staging.allowed_recipients', []));
        $accounts = (array) config('acceptance.accounts', []);

        return [
            'admin' => [...($accounts['admin'] ?? []), 'role' => 'admin', 'allowlisted' => in_array(strtolower((string) ($accounts['admin']['email'] ?? '')), $allowed, true)],
            'client' => [...($accounts['client'] ?? []), 'role' => 'client', 'allowlisted' => in_array(strtolower((string) ($accounts['client']['email'] ?? '')), $allowed, true)],
            'forbidden' => [...($accounts['forbidden'] ?? []), 'role' => 'client', 'allowlisted' => in_array(strtolower((string) ($accounts['forbidden']['email'] ?? '')), $allowed, true)],
        ];
    }

    private function configurationErrors(array $accounts): array
    {
        $errors = [];
        $emails = [];
        foreach ($accounts as $key => $account) {
            $email = trim((string) ($account['email'] ?? ''));
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'ACCEPTANCE_'.strtoupper($key).'_EMAIL doit être configuré avec une adresse de test valide.';
            }
            $emails[] = strtolower($email);
        }
        if (count(array_unique($emails)) !== 3) {
            $errors[] = 'Les trois emails acceptance doivent être distincts.';
        }
        if (! $accounts['client']['allowlisted']) {
            $errors[] = 'ACCEPTANCE_CLIENT_EMAIL doit figurer dans TEST_ALLOWED_EMAILS.';
        }
        if ($accounts['forbidden']['allowlisted']) {
            $errors[] = 'ACCEPTANCE_FORBIDDEN_EMAIL ne doit pas figurer dans TEST_ALLOWED_EMAILS.';
        }
        if (strlen((string) config('acceptance.password')) < 12) {
            $errors[] = 'ACCEPTANCE_TEST_PASSWORD doit être fourni hors dépôt et contenir au moins 12 caractères.';
        }

        return $errors;
    }

    private function expectedCounts(bool $careerEnabled): array
    {
        return ['users' => 3, 'trainings' => 2, 'training_sections' => 2, 'training_lessons' => 3, 'training_resources' => 1, 'training_quizzes' => 1, 'training_quiz_questions' => 2, 'services' => 1, 'events' => 2, 'professional_profiles' => 1, 'user_documents' => 1, 'coach_conversations' => 1, 'coach_messages' => 2, 'career_goals' => $careerEnabled ? 1 : 0, 'career_actions' => $careerEnabled ? 1 : 0];
    }

    private function assertNoWorkflowDependents(array $manifest): void
    {
        $ids = fn (string $table): array => array_column($manifest['rows'][$table] ?? [], 'id');
        $checks = [
            ['training_participants', 'training_id', $ids('trainings')],
            ['training_progress', 'training_id', $ids('trainings')],
            ['training_quiz_attempts', 'training_id', $ids('trainings')],
            ['service_requests', 'service_id', $ids('services')],
            ['event_participants', 'event_id', $ids('events')],
            ['sessions', 'user_id', $ids('users')],
        ];
        foreach ($checks as [$table, $column, $values]) {
            if ($values && Schema::hasTable($table) && DB::table($table)->whereIn($column, $values)->exists()) {
                throw new RuntimeException("Cleanup refusé : dépendances de workflow présentes dans {$table}.");
            }
        }
    }
}
