<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Mail\SendMailContact;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Notifications\NewServiceRequestNotification;
use App\Notifications\ServiceRequestConfirmationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class AppController extends Controller
{
    public function index() {
        return inertia("frontend/home");
    }

    public function contact()
    {
        return inertia("frontend/contact");
    }

    public function about()
    {
        return inertia("frontend/about");
    }

    public function services(){
        $services = Service::where('status', 1)->get();

        return inertia("frontend/services/index", [
            "services" => $services
        ]);
    }

    public function service_detail($slug)
    {
        $service = Service::where('status', 1)->where('slug', $slug)->firstOrFail();
        return inertia("frontend/services/show", [
            'service' => $service
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

            return back([
                'message' => 'Votre demande a été envoyée avec succès',
                'request' => $serviceRequest
            ], 201);
        } catch (\Exception $e) {
            Log::alert($e);
            return back()->with('error', 'Une erreur est survenue lors de votre demande.');
        }


    }

    public function send_contact(Request $request)
    {
        if($request->email) {
            Mail::to(get_setting("contact_email"))->send(new SendMailContact($request->name, $request->email, $request->subject, $request->message));
            return back()->with('success', "Votre message a été envoyé avec succès!");
        }
        return back()->with('error', "Une erreur s'est produite lors de l'envoi du message.");

    }
}
