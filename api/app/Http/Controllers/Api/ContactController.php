<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /** POST /api/contact — public submission */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|min:2|max:120',
            'email'   => 'required|email|max:160',
            'phone'   => 'nullable|string|max:32',
            'subject' => 'nullable|string|max:200',
            'message' => 'required|string|min:10|max:5000',
            'source'  => 'nullable|string|max:60',
            // Honeypot — bots fill it; humans never see it
            'website' => 'nullable|size:0',
        ], [
            'website.size' => 'Spam detected.',
        ]);

        unset($data['website']);

        $contact = ContactMessage::create([
            ...$data,
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $adminEmails = User::where('role', 'admin')
            ->where('is_active', true)
            ->pluck('email');

        if ($adminEmails->isNotEmpty()) {
            Mail::to($adminEmails->all())->send(new ContactMessageMail($contact));
        }

        return response()->json([
            'message' => 'تم استلام رسالتك، هنرد عليك خلال 24 ساعة',
        ], 201);
    }

    /** GET /api/admin/contact-messages */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => $query->paginate(20),
        ]);
    }

    /** PUT /api/admin/contact-messages/{contactMessage} */
    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,replied,archived',
        ]);

        $contactMessage->update($data);

        return response()->json(['message' => 'تم التحديث', 'contact' => $contactMessage]);
    }

    /** DELETE /api/admin/contact-messages/{contactMessage} */
    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(['ok' => true]);
    }
}
