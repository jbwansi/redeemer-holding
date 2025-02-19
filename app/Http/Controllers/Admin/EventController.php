<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventCategory;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index(Request $request)
    {
        $query = Event::with('category')
            ->when(
                $request->search,
                fn($q, $search) =>
                $q->where('title', 'like', "%{$search}%")
            )
            ->when(
                $request->category,
                fn($q, $category) =>
                $q->where('category_id', $category)
            )
            ->when($request->date, function ($q, $date) {
                switch ($date) {
                    case 'upcoming':
                        return $q->where('start_date', '>', now());
                    case 'past':
                        return $q->where('end_date', '<', now());
                    case 'ongoing':
                        return $q->where('start_date', '<=', now())
                            ->where('end_date', '>=', now());
                }
            });

        return inertia('backend/events/index', [
            'events' => $query->paginate(12),
            'categories' => EventCategory::all(),
            'filters' => $request->only(['search', 'category', 'date'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:event_categories,id',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
        ]);

        if ($validated['is_featured'] == true) {
            Event::where('is_featured', true)->update(['is_featured' => false]);
        }
        DB::beginTransaction();
        try {
            $event = Event::create([
                ...$validated,
                'user_id' => Auth::id(),
                'slug' => rand(1000, 9999) . '-' . Str::slug($request->title),
                'published_at' => $request->is_published ? now() : null,
                "featured_image" => null
            ]);


            if ($request->hasFile('featured_image')) {
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'events',
                    $this->imageService->generateImageVersions()
                );
                $event->update(['featured_image' => $images]);
            }

            DB::commit();
            return redirect()->route('events.index')->with('success', 'Event created');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error creating event' . $e->getMessage());
        }
    }

    public function update(Request $request, Event $event)
    {

        // dd($request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'required|string',
            'category_id' => 'required|exists:event_categories,id',
            'location' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'price' => 'nullable|numeric|min:0',
            'max_participants' => 'nullable|integer|min:1',
            'featured_image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'tags' => 'nullable|array',
        ]);
        // si le is_featured est true, on met les autres events en false
        if ($validated['is_featured'] == true) {
            Event::where('is_featured', true)->update(['is_featured' => false]);
        }

        DB::beginTransaction();
        try {
            if ($request->hasFile('featured_image')) {
                if ($event->featured_image) {
                    $this->imageService->deleteImages($event->featured_image);
                }
                $images = $this->imageService->uploadImage(
                    $request->file('featured_image'),
                    'events',
                    $this->imageService->generateImageVersions()
                );
                $validated['featured_image'] = $images;
            } else {
                unset($validated['featured_image']);
            }

            $event->update([
                ...$validated,
                'published_at' => $request->is_published ? now() : null,
            ]);

            DB::commit();
            return redirect()->route('events.index')->with('success', 'Event updated');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error updating event');
        }
    }

    public function destroy(Event $event)
    {
        DB::beginTransaction();
        try {
            if ($event->featured_image) {
                $this->imageService->deleteImages($event->featured_image);
            }

            $event->participants()->delete();
            $event->delete();

            DB::commit();
            return redirect()->route('events.index')->with('success', 'Event deleted');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error deleting event');
        }
    }

    public function create()
    {
        return inertia('backend/events/create', [
            'categories' => EventCategory::all()
        ]);
    }

    public function edit(Event $event)
    {
        return inertia('backend/events/edit', [
            'event' => $event,
            'categories' => EventCategory::all()
        ]);
    }
    public function show($slug)
    {
        $event = Event::where('slug', $slug)
            ->with('category')
            ->firstOrFail();

        return inertia('backend/events/show', [
            'event' => $event
        ]);
    }
}
