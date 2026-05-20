<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bundle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BundleController extends Controller
{
    public function index()
    {
        $bundles = Bundle::with('packages:id,name')->orderBy('sort_order')->get();

        return response()->json(['data' => $bundles]);
    }

    public function show(Bundle $bundle)
    {
        return response()->json(['bundle' => $bundle->load('packages:id,name')]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $packageIds = $data['package_ids'] ?? [];
        unset($data['package_ids']);

        $data['slug'] = $this->uniqueSlug($data['name_en'] ?? $data['name_ar']);
        $bundle = Bundle::create($data);
        $bundle->packages()->sync($packageIds);

        return response()->json(['bundle' => $bundle->load('packages:id,name')], 201);
    }

    public function update(Request $request, Bundle $bundle)
    {
        $data = $this->validateData($request);
        $packageIds = $data['package_ids'] ?? null;
        unset($data['package_ids']);

        $bundle->update($data);
        if ($packageIds !== null) {
            $bundle->packages()->sync($packageIds);
        }

        return response()->json(['bundle' => $bundle->load('packages:id,name')]);
    }

    public function destroy(Bundle $bundle)
    {
        $bundle->packages()->detach();
        $bundle->delete();

        return response()->json(['message' => 'تم حذف الباقة المجمّعة']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description_ar' => ['nullable', 'string'],
            'discount_type' => ['required', Rule::in(['fixed', 'percentage'])],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
            'package_ids' => ['nullable', 'array'],
            'package_ids.*' => ['integer', 'exists:packages,id'],
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);

        return $base.'-'.Str::lower(Str::random(6));
    }
}
