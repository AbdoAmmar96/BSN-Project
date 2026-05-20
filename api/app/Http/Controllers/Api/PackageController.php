<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PackageAddon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PackageController extends Controller
{
    private const PUBLIC_CACHE_PREFIX = 'packages.public';
    private const PUBLIC_CACHE_TTL = 600; // 10 minutes

    // GET /api/packages — public list (only active)
    public function index(Request $request)
    {
        $type = $request->query('service_type');
        $cacheKey = self::PUBLIC_CACHE_PREFIX . ':' . ($type ?: 'all');

        $packages = Cache::remember($cacheKey, self::PUBLIC_CACHE_TTL, function () use ($type) {
            $query = Package::query()->where('is_active', true);
            if ($type) {
                $query->where('service_type', $type);
            }
            return $query->orderBy('service_type')->orderBy('sort_order')->get();
        });

        return response()->json(['data' => $packages]);
    }

    // GET /api/v1/packages/{package} — public single package (only active)
    public function show(Package $package)
    {
        abort_unless($package->is_active, 404);

        return response()->json(['package' => $package]);
    }

    // GET /api/v1/packages/addons?service_type=web — active addons for a service (+ "any")
    public function addons(Request $request)
    {
        $type = $request->query('service_type');

        $query = PackageAddon::query()->where('is_active', true);
        if ($type) {
            $query->whereIn('service_type', [$type, 'any']);
        }

        return response()->json(['data' => $query->orderBy('sort_order')->get()]);
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

        $this->forgetPublicCache();

        return response()->json(['package' => $package], 201);
    }

    public function update(Request $request, Package $package)
    {
        $data = $this->validateData($request, true);
        $package->update($data);

        $this->forgetPublicCache();

        return response()->json(['package' => $package->fresh()]);
    }

    public function destroy(Package $package)
    {
        $package->delete();

        $this->forgetPublicCache();

        return response()->json(['ok' => true]);
    }

    /**
     * Drop the public packages cache after any admin mutation so the
     * marketing site sees the change on the next request.
     */
    private function forgetPublicCache(): void
    {
        foreach (['all', 'web', 'ecommerce', 'branding', 'marketing'] as $type) {
            Cache::forget(self::PUBLIC_CACHE_PREFIX . ':' . $type);
        }
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
