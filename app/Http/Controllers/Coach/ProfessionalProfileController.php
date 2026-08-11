<?php
namespace App\Http\Controllers\Coach;
use App\Http\Controllers\Controller; use App\Http\Requests\Coach\UpdateProfessionalProfileRequest; use Illuminate\Http\Request;
class ProfessionalProfileController extends Controller { public function edit(Request $request) { return inertia('Frontend/Coach/Profile/Edit',['profile'=>$request->user()->professionalProfile]); } public function update(UpdateProfessionalProfileRequest $request) { $request->user()->professionalProfile()->updateOrCreate([], $request->validated()); return back()->with('success','Profil professionnel enregistré.'); } }
