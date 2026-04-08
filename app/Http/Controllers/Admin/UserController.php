<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AccountReactivatedNotification;
use App\Notifications\WelcomeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $query = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role') && $request->input('role') !== 'all', function ($query) use ($request) {
                $query->where('role', $request->input('role'));
            })
            ->when($request->input('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                $query->where('is_active', $request->input('is_active'));
            })
            ->when($request->input('verified'), function ($query) use ($request) {
                if ($request->input('verified') === 'verified') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($request->input('verified') === 'unverified') {
                    $query->whereNull('email_verified_at');
                }
            })
            ->when($request->input('sort') && $request->input('direction'), function ($query) use ($request) {
                $query->orderBy($request->input('sort'), $request->input('direction'));
            }, function ($query) {
                $query->latest();
            });

        $users = $query->paginate(10)
            ->appends($request->query());

        return inertia('backend/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active', 'verified']),
        ]);
    }

    public function create()
    {
        return inertia('backend/users/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['admin', 'coach', 'client'])],
            'is_active' => ['required'],
        ]);

        $plainPassword = $request->password;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($plainPassword),
            'role' => $request->role,
            'is_active' => $request->status,
        ]);

        // Envoyer la notification de bienvenue avec les identifiants
        $user->notify(new WelcomeNotification($plainPassword));

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur créé avec succès. Un email avec les identifiants a été envoyé.');
    }

    public function edit(User $user)
    {
        return inertia('backend/users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => "required|in:admin,coach,client",
            'is_active' => ['required'],
            'password' => $request->filled('password') ? ['confirmed', Password::defaults()] : '',
        ]);

        // dd($request->all());

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->is_active =  intval($request->is_active);
        if($request->password) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        // Log la suppression avant de supprimer
        // activity()
        //     ->performedOn($user)
        //     ->causedBy(request()->user())
        //     ->log('deleted');

        $user->delete();

        return redirect()
            ->route('users.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }

    /**
     * Affiche les détails d'un utilisateur spécifique.
     *
     * @param User $user
     * @return \Inertia\Response
     */
    public function show(User $user)
    {
        // Charge l'utilisateur avec ses relations si nécessaire
        // $user->load(['posts', 'comments']);

        return inertia('backend/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,

                // Vous pouvez ajouter des informations supplémentaires ici
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,

                // Si vous avez des relations chargées
                // 'posts_count' => $user->posts_count,
                // 'posts' => $user->posts->map(fn ($post) => [
                //     'id' => $post->id,
                //     'title' => $post->title,
                //     'created_at' => $post->created_at,
                // ]),
            ],
        ]);
    }


    /**
     * Renvoie l'email de vérification.
     */
    public function resendVerification(User $user)
    {
        if ($user->hasVerifiedEmail()) {
            return back()->with('error', 'Cet utilisateur a déjà vérifié son email.');
        }

        $user->sendEmailVerificationNotification();

        // activity()
        //     ->performedOn($user)
        //     ->causedBy(request()->user())
        //     ->log('verification_email_sent');

        return back()->with('success', 'Email de vérification envoyé avec succès.');
    }

    public function blockedUsers(Request $request)
    {
        $query = User::query()
            ->where('is_active', 0)
            ->when($request->input('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                $query->where('is_active', $request->input('is_active'));
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });

        $blockedUsers = $query->latest()
            ->paginate(10)
            ->appends($request->query());

        return inertia('backend/users/blocked', [
            'blockedUsers' => $blockedUsers,
            'filters' => $request->only(['is_active', 'search']),
        ]);
    }

    public function reactivateUser(User $user)
    {
        // Vérifier si l'utilisateur est actuellement inactif ou banni
        if (!in_array($user->is_active, [0])) {
            return back()->with('error', 'Cet utilisateur est déjà actif.');
        }

        // Sauvegarder l'ancien statut pour l'historique
        $oldStatus = $user->is_active;

        // Réactiver l'utilisateur
        $user->is_active = 1;
        $user->save();

        // Enregistrer l'action dans l'historique
        // activity()
        //     ->performedOn($user)
        //     ->causedBy(Auth::user())
        //     ->withProperties([
        //         'old_status' => $oldStatus,
        //         'new_status' => 'active',
        //         'action' => 'reactivation'
        //     ])
        //     ->log('user_reactivated');

        // Envoyer une notification à l'utilisateur
        $user->notify(new AccountReactivatedNotification());

        return back()->with('success', 'L\'utilisateur a été réactivé avec succès.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!$handle) {
            return back()->with('error', 'Impossible de lire le fichier importé.');
        }

        $firstLine = fgets($handle);
        rewind($handle);

        $delimiter = ';';
        if (is_string($firstLine)) {
            $commaCount = substr_count($firstLine, ',');
            $semicolonCount = substr_count($firstLine, ';');
            $delimiter = $commaCount > $semicolonCount ? ',' : ';';
        }

        $headers = fgetcsv($handle, 0, $delimiter);
        if (!$headers || !is_array($headers)) {
            fclose($handle);
            return back()->with('error', 'Le fichier CSV est vide ou invalide.');
        }

        $headers = array_map(function ($header) {
            return strtolower(trim((string) $header));
        }, $headers);

        if (!in_array('email', $headers, true)) {
            fclose($handle);
            return back()->with('error', 'Le CSV doit contenir au minimum la colonne: email.');
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            if (!is_array($row)) {
                $skipped++;
                continue;
            }

            if (count($row) === 1 && trim((string) $row[0]) === '') {
                continue;
            }

            $data = [];
            foreach ($headers as $index => $header) {
                $data[$header] = isset($row[$index]) ? trim((string) $row[$index]) : null;
            }

            $email = strtolower((string) ($data['email'] ?? ''));
            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                continue;
            }

            $name = (string) ($data['name'] ?? '');
            if ($name === '') {
                $name = explode('@', $email)[0];
            }

            $role = strtolower((string) ($data['role'] ?? 'client'));
            if (!in_array($role, ['admin', 'coach', 'client'], true)) {
                $role = 'client';
            }

            $statusRaw = strtolower((string) ($data['is_active'] ?? '1'));
            $isActive = in_array($statusRaw, ['1', 'true', 'yes', 'actif', 'active'], true) ? 1 : 0;

            $plainPassword = (string) ($data['password'] ?? '');
            if ($plainPassword === '') {
                $plainPassword = (string) env('TEST_USERS_PASSWORD', 'Test1234!');
            }

            $user = User::where('email', $email)->first();

            if ($user) {
                $user->name = $name;
                $user->role = $role;
                $user->is_active = $isActive;
                if (!empty($data['password'])) {
                    $user->password = Hash::make($plainPassword);
                }
                $user->save();
                $updated++;
            } else {
                $newUser = new User();
                $newUser->name = $name;
                $newUser->email = $email;
                $newUser->role = $role;
                $newUser->is_active = $isActive;
                $newUser->password = Hash::make($plainPassword);
                $newUser->save();
                $created++;
            }
        }

        fclose($handle);

        return back()->with('success', "Import terminé: {$created} créé(s), {$updated} mis à jour, {$skipped} ignoré(s).");
    }

    public function export(Request $request)
    {
        $query = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->input('role') && $request->input('role') !== 'all', function ($query) use ($request) {
                $query->where('role', $request->input('role'));
            })
            ->when($request->input('is_active') && $request->input('is_active') !== 'all', function ($query) use ($request) {
                $query->where('is_active', $request->input('is_active'));
            })
            ->when($request->input('verified'), function ($query) use ($request) {
                if ($request->input('verified') === 'verified') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($request->input('verified') === 'unverified') {
                    $query->whereNull('email_verified_at');
                }
            });

        $allowedSorts = ['created_at', 'name', 'email', 'role'];
        $sort = $request->input('sort');
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest();
        }

        $users = $query->get();

        return response()->streamDownload(function () use ($users) {
            $output = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($output, "\xEF\xBB\xBF");

            fputcsv($output, [
                'ID',
                'Nom',
                'Email',
                'Role',
                'Statut',
                'Verifie',
                'Date de creation',
            ], ';');

            foreach ($users as $user) {
                fputcsv($output, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $this->translateUserType($user->role),
                    ((int) $user->is_active) === 1 ? 'Actif' : 'Inactif',
                    $user->email_verified_at ? 'Oui' : 'Non',
                    optional($user->created_at)->format('d/m/Y H:i'),
                ], ';');
            }

            fclose($output);
        }, 'users.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function translateUserType(string $type): string
    {
        return [
            'admin' => 'Administrateur',
            'editor' => 'Éditeur',
            'user' => 'Utilisateur',
        ][$type] ?? $type;
    }

    private function translateStatus(string $status): string
    {
        return [
            'active' => 'Actif',
            'inactive' => 'Inactif',
            'banned' => 'Banni',
        ][$status] ?? $status;
    }
}
