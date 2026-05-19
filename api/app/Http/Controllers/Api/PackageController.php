<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    // GET /api/packages — public list (only active)
    public function index(Request $request)
    {
        $query = Package::query()->where('is_active', true);

        if ($type = $request->query('service_type')) {
            $query->where('service_type', $type);
        }

        return response()->json([
            'data' => $query->orderBy('service_type')->orderBy('sort_order')->get(),
        ]);
    }

    // Admin endpoints
    public function adminIndex()
    {
        return response()->json([
            'data' => Package::orderBy('service_type')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $package = Package::create($data);

        return response()->json(['package' => $package], 201);
    }

    public function update(Request $request, Package $package)
    {
        $data = $this->validateData($request, true);
        $package->update($data);

        return response()->json(['package' => $package->fresh()]);
    }

    public function destroy(Package $package)
    {
        $package->delete();

        return response()->json(['ok' => true]);
    }

    private function validateData(Request $request, bool $partial = false): array
    {
        $rules = [
            'service_type' => ($partial ? 'sometimes|' : 'required|') . 'in:web,ecommerce,branding,marketing',
            'name' => ($partial ? 'sometimes|' : 'required|') . 'string|max:120',
            'price' => ($partial ? 'sometimes|' : 'required|') . 'numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'price_prefix' => 'sometimes|nullable|string|max:20',
            'period' => 'sometimes|nullable|string|max:20',
            'note' => 'sometimes|nullable|string|max:255',
            'features' => 'sometimes|nullable|array',
            'features.*' => 'string|max:200',
            'featured' => 'sometimes|boolean',
            'ribbon' => 'sometimes|nullable|string|max:60',
            'sort_order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ];

        return $request->validate($rules);
    }
}
