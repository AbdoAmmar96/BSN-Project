<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OnboardingController extends Controller
{
    /**
     * GET /api/onboarding — current user's onboarding state (null if untouched).
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'onboarding' => $request->user()->onboarding,
        ]);
    }

    /**
     * POST /api/onboarding — upsert the 3 answers and mark complete.
     * Idempotent: re-submitting just overwrites the single row.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'looking_for' => ['nullable', Rule::in(['web', 'ecommerce', 'branding', 'marketing', 'browsing'])],
            'company_name' => ['nullable', 'string', 'max:255'],
            'team_size' => ['nullable', Rule::in(['just_me', '2-5', '6-20', '20+'])],
        ]);

        $onboarding = $request->user()->onboarding()->updateOrCreate(
            ['user_id' => $request->user()->id],
            array_merge($data, ['completed' => true]),
        );

        return response()->json(['onboarding' => $onboarding]);
    }

    /**
     * POST /api/onboarding/skip — mark complete without answers so the prompt
     * stops appearing.
     */
    public function skip(Request $request): JsonResponse
    {
        $onboarding = $request->user()->onboarding()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['completed' => true],
        );

        return response()->json(['onboarding' => $onboarding]);
    }
}
