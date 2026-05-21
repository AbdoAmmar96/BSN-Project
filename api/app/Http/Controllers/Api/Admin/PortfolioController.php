<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioWork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $query = PortfolioWork::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $works = $query->orderBy('category')->orderBy('sort_order')->orderByDesc('id')->get();

        return response()->json(['data' => $works]);
    }

    public function show(PortfolioWork $work)
    {
        return response()->json(['work' => $work]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['tech'] = $this->parseTech($request);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('portfolio', 'public');
        }

        $work = PortfolioWork::create($data);

        return response()->json(['work' => $work], 201);
    }

    public function update(Request $request, PortfolioWork $work)
    {
        $data = $this->validateData($request);
        $data['tech'] = $this->parseTech($request);

        if ($request->hasFile('image')) {
            // Drop the previous upload so the public disk doesn't accumulate orphans.
            if ($work->image_path && ! str_starts_with($work->image_path, 'http')) {
                Storage::disk('public')->delete($work->image_path);
            }
            $data['image_path'] = $request->file('image')->store('portfolio', 'public');
        } elseif ($request->boolean('remove_image') && $work->image_path) {
            if (! str_starts_with($work->image_path, 'http')) {
                Storage::disk('public')->delete($work->image_path);
            }
            $data['image_path'] = null;
        }

        $work->update($data);

        return response()->json(['work' => $work->fresh()]);
    }

    public function destroy(PortfolioWork $work)
    {
        if ($work->image_path && ! str_starts_with($work->image_path, 'http')) {
            Storage::disk('public')->delete($work->image_path);
        }
        $work->delete();

        return response()->json(['message' => 'تم حذف العمل']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'company_ar' => ['nullable', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:255'],
            'tag' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['required', Rule::in(['web', 'ecommerce'])],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);
    }

    /**
     * `tech` arrives either as a JSON string (multipart) or a real array (JSON body).
     * Normalize to a clean string array.
     */
    private function parseTech(Request $request): array
    {
        $raw = $request->input('tech', []);
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            $raw = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode(',', $raw)));
        }

        return array_values(array_filter(array_map('trim', (array) $raw), fn ($t) => $t !== ''));
    }
}
