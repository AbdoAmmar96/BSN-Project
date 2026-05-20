<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PackageAddon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AddonController extends Controller
{
    public function index(Request $request)
    {
        $query = PackageAddon::query();

        if ($request->filled('service_type')) {
            $query->where('service_type', $request->service_type);
        }

        $addons = $query->orderBy('service_type')->orderBy('sort_order')->get();

        return response()->json(['data' => $addons]);
    }

    public function show(PackageAddon $addon)
    {
        return response()->json(['addon' => $addon]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $addon = PackageAddon::create($data);

        return response()->json(['addon' => $addon], 201);
    }

    public function update(Request $request, PackageAddon $addon)
    {
        $data = $this->validateData($request, $addon->id);
        $addon->update($data);

        return response()->json(['addon' => $addon]);
    }

    public function destroy(PackageAddon $addon)
    {
        $addon->delete();

        return response()->json(['message' => 'تم حذف الإضافة']);
    }

    private function validateData(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'service_type' => ['required', 'string', 'max:50'],
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'price_type' => ['required', Rule::in(['fixed', 'percentage'])],
            'price_egp' => ['nullable', 'numeric', 'min:0', 'required_if:price_type,fixed'],
            'price_sar' => ['nullable', 'numeric', 'min:0'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:100', 'required_if:price_type,percentage'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);
    }
}
