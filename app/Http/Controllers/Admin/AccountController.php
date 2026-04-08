<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use Illuminate\Validation\Rules\Password;

use Stevebauman\Location\Facades\Location;

class AccountController extends Controller
{
    public function account(Request $request)
    {
        return inertia('backend/account/index', [
            'sessions' => $this->getSessions($request),
        ]);
    }

    private function getSessions(Request $request)
    {
        $user = Auth::user();
        // Obtenir la vraie IP
        $realIP = $request->header('X-Forwarded-For') ?? $request->ip();

        // Mettre à jour l'IP de la session courante
        DB::table('sessions')
            ->where('id', session()->getId())
            ->update(['ip_address' => $realIP]);

        return  DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                $location = Location::get($session->ip_address);
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'is_current_device' => $session->id === session()->getId(),
                    'location' => $location ? [
                        'city' => $location->cityName,
                        'country' => $location->countryName,
                    ] : null,
                ];
            });
    }


    public function security(Request $request)
    {
        return inertia('backend/account/password', [
            'sessions' => $this->getSessions($request),
        ]);
    }

    public function activities(Request $request)
    {
        $user = Auth::user();

        // $activities = DB::table('audit_logs')
        //     ->where('user_id', $user->id)
        //     ->orderBy('created_at', 'desc')
        //     ->paginate(10)
        //     ->through(function ($activity) {
        //         return [
        //             'id' => $activity->id,
        //             'event_type' => $activity->event_type,
        //             'resource_type' => $activity->resource_type,
        //             'resource_id' => $activity->resource_id,
        //             'old_values' => json_decode($activity->old_values),
        //             'new_values' => json_decode($activity->new_values),
        //             'ip_address' => $activity->ip_address,
        //             'user_agent' => $activity->user_agent,
        //             'created_at' => Carbon::parse($activity->created_at)->diffForHumans(),
        //             'date' => Carbon::parse($activity->created_at)->format('d M Y, H:i'),
        //         ];
        //     });

        return inertia('backend/account/activities', [
            'activities' => []
        ]);
    }

    public function notifications()
    {
        return inertia('backend/account/notifications');
    }

    public function notificationsFeed(Request $request)
    {
        $user = Auth::user();

        $items = $user->unreadNotifications()
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($notification) {
                $data = (array) ($notification->data ?? []);

                $url = $data['url'] ?? null;
                if (!$url && isset($data['service_request_id'])) {
                    $url = route('service-requests.show', $data['service_request_id']);
                }

                return [
                    'id' => $notification->id,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? 'Vous avez une nouvelle notification.',
                    'type' => $data['type'] ?? 'info',
                    'url' => $url,
                    'created_at' => optional($notification->created_at)?->diffForHumans(),
                ];
            })
            ->values();

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'items' => $items,
        ]);
    }

    public function markNotificationAsRead(Request $request, string $notification)
    {
        $user = Auth::user();
        $item = $user->notifications()->where('id', $notification)->firstOrFail();

        if (!$item->read_at) {
            $item->markAsRead();
        }

        $redirectTo = $request->input('redirect_to');
        if (is_string($redirectTo) && $redirectTo !== '') {
            return redirect($redirectTo);
        }

        return back();
    }

    public function markAllNotificationsAsRead()
    {
        $user = Auth::user();
        $user?->unreadNotifications?->markAsRead();

        return back();
    }

    public function integrations()
    {
        return inertia('backend/account/integrations');
    }

    public function updateProfile(Request $request)
    {

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . Auth::id()],
            'phone' => ['string', 'nullable'],
            'bio' => ['string', 'nullable'],
        ]);
        $user = Auth::user();
        $user->update($validated);

        return back()->with('success', 'Profil mis à jour avec succès');
    }

    public function terminateSession(Request $request, $sessionId)
    {
        if ($sessionId === session()->getId()) {
            return back()->with('error', 'Vous ne pouvez pas terminer votre session actuelle');
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', Auth::id())
            ->delete();

        return back()->with('success', 'Session terminée avec succès');
    }

    public function terminateOtherSessions(Request $request)
    {
        DB::table('sessions')
            ->where('user_id', Auth::id())
            ->where('id', '!=', session()->getId())
            ->delete();

        return back()->with('success', 'Toutes les autres sessions ont été terminées');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.current_password' => 'Le mot de passe actuel est incorrect.',
        ]);


        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Enregistrer l'activité de changement de mot de passe
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->update(['last_activity' => Carbon::now()->timestamp]);

        return back()->with('success', 'Votre mot de passe a été modifié avec succès');
    }


    public function inactive()
    {
        return inertia('backend/account/inactive', [
            'email' => get_setting('support_email'),
        ]);
    }

    /**
     * Affiche la page d'erreur pour compte banni.
     */
    public function banned()
    {
        return inertia('backend/account/banned', [
            'email' => get_setting('support_email'),
        ]);
    }
}
