<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Mail\SendMailContact;
use App\Models\Page;
use App\Models\Service;
use App\Models\Post;
use App\Models\Formation;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\NewServiceRequestNotification;
use App\Notifications\ServiceRequestConfirmationNotification;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use App\Services\DynamicMailerService;

class AppController extends Controller
{
    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }
    public function index()
    {
        $services = Service::where('status', 1)->get();
        $home = Page::where('slug', 'accueil')->first();
        $posts = Post::where('published', 1)->latest('published_at')->take(3)->get();
        $formations = Formation::where('is_published', 1)
            ->where('is_featured', 1)
            ->where('start_date', '>', now())
            ->orderBy('start_date')
            ->take(3)
            ->get();
        if ($formations->isEmpty()) {
            $formations = Formation::where('is_published', 1)
                ->where('start_date', '>', now())
                ->orderBy('start_date')
                ->take(3)
                ->get();
        }
        return inertia("frontend/home", [
            'services' => $services,
            'home' => $home,
            'posts' => $posts,
            'formations' => $formations,
            'seo' => SeoService::defaults(),
        ]);
    }

    public function contact()
    {
        $page = Page::where('slug', 'contact')->first();

        return inertia("frontend/contact", [
            'page' => $page,
            'seo' => SeoService::page(
                'Contact',
                $page?->meta_description ?: 'Contactez-nous pour toute question ou demande d\'information.',
            ),
        ]);
    }

    public function faq()
    {
        $page = Page::where('slug', 'contact')->first();

        return inertia('frontend/faq', [
            'page' => $page,
            'seo' => SeoService::page(
                'FAQ',
                data_get($page, 'meta.meta_description') ?: 'Retrouvez les reponses aux questions frequentes sur nos services, formations et evenements.',
            ),
        ]);
    }

    public function about()
    {
        $page = Page::where('slug', 'a-propos')->first();
        return inertia("frontend/about", [
            'page' => $page,
            'seo' => SeoService::page(
                'À propos',
                $page?->meta_description ?: 'Découvrez notre histoire, notre mission et nos valeurs.',
            ),
        ]);
    }

    public function services()
    {
        $services = Service::where('status', 1)->get();
        $contactPage = Page::where('slug', 'contact')->first();
        $contactFaqs = collect(data_get($contactPage, 'meta.faqs', []))
            ->filter(fn($faq) => is_array($faq))
            ->map(function ($faq) {
                return [
                    'question' => trim((string) data_get($faq, 'question', '')),
                    'answer' => trim((string) data_get($faq, 'answer', '')),
                ];
            })
            ->filter(fn($faq) => $faq['question'] !== '' && $faq['answer'] !== '')
            ->values();

        return inertia("frontend/services/index", [
            'services' => $services,
            'contactFaqs' => $contactFaqs,
            'seo' => SeoService::page(
                'Services',
                'Découvrez nos services de coaching et d\'accompagnement personnalisés.',
            ),
        ]);
    }

    public function service_detail($slug)
    {
        $service = Service::where('status', 1)->where('slug', $slug)->firstOrFail();
        return inertia('frontend/services/show', [
            'service' => $service,
            'seo' => SeoService::page(
                $service->name,
                $service->description ?? $service->short_description ?? '',
            ),
        ]);
    }

    public function service_request($slug)
    {
        $service = Service::where('status', 1)->where('slug', $slug)->firstOrFail();
        return inertia("frontend/services/request", [
            'service' => $service
        ]);
    }

    public function service_request_store(Request $request, $id)
    {
        try {
            $service = Service::where('id', $id)->firstOrFail();
            // Créer la demande
            $serviceRequest = ServiceRequest::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'service_id' => $service->id,
                'message' => $request->message,
                'status' => 'pending'
            ]);

            // $admins = User::role('admin')->get();
            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, new NewServiceRequestNotification($serviceRequest));

            // Notifier le client
            $serviceRequest->notify(new ServiceRequestConfirmationNotification($serviceRequest));

            return back()->with([
                'message' => 'Votre demande a été envoyée avec succès',
                'request_id' => $serviceRequest->id,
            ]);
        } catch (\Exception $e) {
            Log::alert($e);
            return back()->with('error', 'Une erreur est survenue lors de votre demande.');
        }


    }

    public function send_contact(Request $request)
{
    if ($request->has(['name', 'email', 'phone'])) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
        ]);

        $subject = 'Demande d\'appel découverte';
        $message = "Nouvelle demande d'appel découverte :\n\n" .
            "Nom: {$validated['name']}\n" .
            "Email: {$validated['email']}\n" .
            "Téléphone: {$validated['phone']}\n\n" .
            "Cette personne souhaite réserver un appel découverte.";
    } else {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'website' => 'nullable|string|max:255',
        ]);

        if (!empty($validated['website'])) {
            return back()->with('success', "Votre message a été envoyé avec succès!");
        }

        $subject = $validated['subject'];
        $message = $validated['message'];
    }

    try {
        $adminEmail = get_setting('contact_email') ?: 'admin@redeemerholding.com';

        Log::channel('newsletter')->info('Contact form send attempt', [
            'admin_to' => $adminEmail,
            'user_email' => $validated['email'] ?? null,
            'subject' => $subject,
        ]);

        $this->dynamicMailerService->send(
            new SendMailContact(
                $validated['name'],
                $validated['email'],
                $subject,
                $message
            ),
            $adminEmail
        );

        Log::channel('newsletter')->info('Contact form send success', [
            'admin_to' => $adminEmail,
        ]);

        return back()->with('success', "Votre message a été envoyé avec succès!");
    } catch (\Throwable $e) {
        Log::channel('newsletter')->error('Contact form send error', [
            'admin_to' => $adminEmail ?? null,
            'user_email' => $validated['email'] ?? null,
            'message' => $e->getMessage(),
        ]);

        return back()->with('error', "Une erreur s'est produite lors de l'envoi du message.");
    }
}

    public function terms()
    {
        return inertia("frontend/policies/terms");
    }

    public function policy()
    {
        return inertia("frontend/policies/policy");
    }

    public function cookies()
    {
        return inertia("frontend/policies/cookies");
    }
}
