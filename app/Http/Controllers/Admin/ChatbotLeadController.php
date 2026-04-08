<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotLead;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatbotLeadController extends Controller
{
    public function index(Request $request)
    {
        $search = (string) $request->query('search', '');

        $query = ChatbotLead::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->latest();

        return inertia('backend/chatbot/leads', [
            'leads' => $query->paginate(20),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $search = (string) $request->query('search', '');

        $leads = ChatbotLead::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->latest()
            ->get(['id', 'name', 'email', 'source', 'created_at']);

        $filename = 'chatbot_leads_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($leads) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Nom', 'Email', 'Source', 'Date']);

            foreach ($leads as $lead) {
                fputcsv($handle, [
                    $lead->id,
                    $lead->name,
                    $lead->email,
                    $lead->source,
                    optional($lead->created_at)->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
