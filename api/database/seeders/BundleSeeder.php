<?php

namespace Database\Seeders;

use App\Models\Bundle;
use App\Models\Package;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BundleSeeder extends Seeder
{
    public function run(): void
    {
        // Each bundle: [name_ar, name_en, discount%, [package names to include]]
        $bundles = [
            ['حزمة الإطلاق', 'Launch Bundle', 15, ['Multi-page Pro', 'Full Identity']],
            ['حزمة الهوية والإطلاق', 'Brand Launch', 12, ['Landing Page', 'Full Identity']],
            ['حزمة بداية المتجر', 'E-com Starter Bundle', 18, ['Growth', 'Single Platform']],
            ['حزمة الإطلاق الكامل', 'Full Launch', 20, ['Enterprise', 'Brand System', 'Multi Platform']],
        ];

        foreach ($bundles as $i => [$ar, $en, $discount, $packageNames]) {
            $bundle = Bundle::updateOrCreate(
                ['slug' => Str::slug($en)],
                [
                    'name_ar' => $ar,
                    'name_en' => $en,
                    'description_ar' => "وفّر {$discount}% مع {$ar}",
                    'discount_type' => 'percentage',
                    'discount_value' => $discount,
                    'is_active' => true,
                    'sort_order' => $i,
                ]
            );

            // Match package names; first match per name to avoid duplicate-name collisions.
            $ids = Package::whereIn('name', $packageNames)
                ->get()
                ->unique('name')
                ->pluck('id')
                ->all();

            $bundle->packages()->sync($ids);
        }

        $this->command?->info('✓ Seeded ' . count($bundles) . ' bundles');
    }
}
