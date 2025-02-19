<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ServiceStatusUpdate;
use App\Models\ServiceRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        // Query de base avec les relations
        $query = ServiceRequest::query()
            ->with('service')
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                })
            )
            ->when(
                $request->status && $request->status !== 'all',
                fn($q) => $q->where('status', $request->status)
            )
            ->when(
                $request->date && $request->date !== 'all',
                fn($q) => match ($request->date) {
                    'today' => $q->whereDate('created_at', Carbon::today()),
                    'week' => $q->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]),
                    'month' => $q->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]),
                    default => $q
                }
            )
            ->when(
                $request->sort,
                fn($q) => $q->orderBy($request->sort, $request->direction ?? 'desc'),
                fn($q) => $q->orderBy('created_at', 'desc')
            );

        $requests = $query->paginate(12)->withQueryString();

        // Formatage spécifique pour l'interface React
        $requests->getCollection()->transform(function ($request) {
            return [
                'id' => $request->id,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'message' => $request->message,
                'status' => $request->status,
                'code' => $request->code,
                'service' => [
                    'id' => $request->service->id,
                    'name' => $request->service->name
                ],
                'created_at' => $request->created_at->diffForHumans()
            ];
        });

        return inertia('backend/services/service-requests/index', [
            'requests' => [
                'data' => $requests->items(),
                'meta' => [
                    'current_page' => $requests->currentPage(),
                    'from' => $requests->firstItem(),
                    'last_page' => $requests->lastPage(),
                    'links' => $requests->linkCollection()->map(function ($link) {
                        return [
                            'url' => $link['url'],
                            'label' => $link['label'],
                            'active' => $link['active']
                        ];
                    })->all(),
                    'to' => $requests->lastItem(),
                    'total' => $requests->total(),
                    'per_page' => $requests->perPage()
                ]
            ],
            'filters' => $request->only([
                'search',
                'status',
                'date',
                'sort',
                'direction'
            ])
        ]);
    }
    public function show($id)
    {
        $serviceRequest = ServiceRequest::where('id', $id)
            ->with('service')
            ->firstOrFail();


        return inertia('backend/services/service-requests/show', [
            'serviceRequest' => $serviceRequest
        ]);
    }
    public function destroy(ServiceRequest $serviceRequest)
    {
        $serviceRequest->delete();
        return redirect()->route('service-requests.index');
    }
    public function updateStatus(Request $request, ServiceRequest $serviceRequest)
    {
        $oldStatus = $serviceRequest->status;
        $serviceRequest->status = $request->status;
        $serviceRequest->save();

        Mail::to($serviceRequest->email)->send(new ServiceStatusUpdate($serviceRequest));

        return redirect()->route('service-requests.show', $serviceRequest->id);
    }
}
