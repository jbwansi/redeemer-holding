<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;

use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
// use App\Notifications\NewServiceRequestNotification;
// use App\Notifications\ServiceRequestConfirmationNotification;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Notification;
use App\Services\DynamicMailerService;
use App\Models\PageContent;
use App\Models\Testimonial;
use App\Mail\RegistrationConfirmationMail;
use App\Mail\RegistrationAdminNotificationMail;

class ServiceController extends Controller
{


    protected $dynamicMailerService;

    public function __construct(DynamicMailerService $dynamicMailerService)
    {
        $this->dynamicMailerService = $dynamicMailerService;
    }


    // --- Service ---

    public function services()
    {
        $services = Service::where('status', 1)->get();

        $pageContent = PageContent::where('page', 'services')
            ->pluck('value', 'key');

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

        return inertia("Frontend/services/index", [
            'services' => $services,
            'contactFaqs' => $contactFaqs,
            'pageContent' => $pageContent,
            'seo' => SeoService::page(
                'Services',
                'Découvrez nos services de coaching et d\'accompagnement personnalisés.',
            ),
        ]);
    }

    public function service_detail($slug)
    {
        $service = Service::where('status', 1)->where('slug', $slug)->firstOrFail();
        $testimonials = Testimonial::where('is_active', true)
            ->where('service_id', $service->id)
            ->latest()
            ->take(6)
            ->get();
        return inertia('Frontend/services/show', [
            'service' => $service,
            'testimonials' => $testimonials,
            'seo' => SeoService::page(
                $service->name,
                $service->description ?? $service->short_description ?? '',
            ),
        ]);
    }

    public function service_request($slug)
    {
        $service = Service::where('status', 1)->where('slug', $slug)->firstOrFail();
        return inertia("Frontend/services/request", [
            'service' => $service
        ]);
    }

    public function service_request_store(Request $request, $id)
{
    try {
        $service = Service::where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $serviceRequest = ServiceRequest::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'service_id' => $service->id,
            'message' => $validated['message'] ?? null,
            'status' => ServiceRequest::STATUS_PENDING,
        ]);

        if ((bool) get_setting('service_confirmation_enabled', true)) {
            $this->dynamicMailerService->queue(
                new RegistrationConfirmationMail(
                    type: 'service',
                    item: $service,
                    participant: $serviceRequest,
                ),
                $serviceRequest->email
            );
        }

        $adminEmail = get_setting('support_email');

        if ($adminEmail) {
            $this->dynamicMailerService->queue(
                new RegistrationAdminNotificationMail(
                    type: 'service',
                    item: $service,
                    participant: $serviceRequest,
                ),
                $adminEmail
            );
        }

        return back()->with([
            'message' => 'Votre demande a été envoyée avec succès',
            'request_id' => $serviceRequest->id,
        ]);
    } catch (\Exception $e) {
        Log::alert($e);

        return back()->with('error', 'Une erreur est survenue lors de votre demande.');
    }
}
}
