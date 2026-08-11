<?php
namespace App\Http\Controllers\Coach;
use App\Http\Controllers\Controller; use App\Http\Requests\Coach\StoreConversationRequest; use Illuminate\Http\Request;
class CoachConversationController extends Controller
{
    public function store(StoreConversationRequest $request) { $conversation=$request->user()->coachConversations()->create([...$request->validated(),'module'=>'general','status'=>'active']); return redirect()->route('coach.conversations.show',$conversation); }
    public function show(Request $request,int $conversation) { $model=$request->user()->coachConversations()->with('messages')->findOrFail($conversation); $this->authorize('view',$model); return inertia('Frontend/Coach/Conversations/Show',['conversation'=>$model,'documents'=>$request->user()->coachDocuments()->get(['id','type','original_name'])]); }
    public function archive(Request $request,int $conversation) { $model=$request->user()->coachConversations()->findOrFail($conversation); $this->authorize('update',$model); $model->update(['status'=>'archived','archived_at'=>now()]); return back(); }
    public function destroy(Request $request,int $conversation) { $model=$request->user()->coachConversations()->findOrFail($conversation); $this->authorize('delete',$model); $model->delete(); return redirect()->route('dashboard.client.profile'); }
}
