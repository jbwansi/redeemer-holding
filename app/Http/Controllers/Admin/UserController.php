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
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ];
            });

        return inertia('backend/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status', 'verified']),
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
            'role' => ['required', Rule::in(['admin', 'editor', 'user'])],
            'is_active' => ['required', Rule::in([1, 0])],
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
                'is_active' => $user->status,
            ],
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'editor', 'user'])],
            'is_active' => ['required'],
            'password' => $request->filled('password') ? ['confirmed', Password::defaults()] : '',
        ]);

        $user->update(array_filter([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->filled('password') ? Hash::make($request->password) : null,
            'role' => $request->role,
            'is_active' => $request->is_active,
        ]));

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
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                ];
            });

        return inertia('baceknd/users/blocked', [
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

    public function export(Request $request)
    {
        $query = User::query();

        // Apply filters from request body
        // if ($request->search) {
        //     $query->where(function ($q) use ($request) {
        //         $q->where('name', 'like', "%{$request->search}%")
        //           ->orWhere('email', 'like', "%{$request->search}%");
        //     });
        // }

        // if ($request->role && $request->role !== 'all') {
        //     $query->where('role', $request->role);
        // }

        // if ($request->status && $request->status !== 'all') {
        //     $query->where('status', $request->status);
        // }

        // if ($request->verified && $request->verified !== 'all') {
        //     if ($request->verified === 'verified') {
        //         $query->whereNotNull('email_verified_at');
        //     } else {
        //         $query->whereNull('email_verified_at');
        //     }
        // }

        // // Sort
        // if ($request->sort) {
        //     $query->orderBy($request->sort, $request->direction ?? 'asc');
        // }

        // $users = $query->get();

        // return new StreamedResponse(function () use ($users) {
        //     $csv = Writer::createFromFileObject(new \SplTempFileObject());
        //     $csv->setOutputBOM(\League\Csv\Writer::BOM_UTF8);

        //     // Add headers
        //     $csv->insertOne([
        //         'ID',
        //         'Nom',
        //         'Email',
        //         'Rôle',
        //         'Statut',
        //         'Vérifié',
        //         'Date de création',
        //     ]);

        //     // Add data
        //     foreach ($users as $user) {
        //         $csv->insertOne([
        //             $user->id,
        //             $user->name,
        //             $user->email,
        //             $this->translateUserType($user->role),
        //             $this->translateStatus($user->status),
        //             $user->email_verified_at ? 'Oui' : 'Non',
        //             $user->created_at->format('d/m/Y H:i'),
        //         ]);
        //     }

        //     $csv->output('users.csv');
        // }, 200, [
        //     'Content-Type' => 'text/csv; charset=UTF-8',
        //     'Content-Disposition' => 'attachment; filename="users.csv"',
        // ]);
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
