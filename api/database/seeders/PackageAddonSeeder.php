<?php

namespace Database\Seeders;

use App\Models\PackageAddon;
use Illuminate\Database\Seeder;

class PackageAddonSeeder extends Seeder
{
    public function run(): void
    {
        $addons = [
            // --- Web ---
            ['web', 'نسخة إنجليزية', 'English version', 'percentage', 0, null, 30, 1],
            ['web', 'صفحة إضافية', 'Extra page', 'fixed', 1500, null, null, 2],
            ['web', 'مدونة كاملة', 'Full blog', 'fixed', 3500, null, null, 3],
            ['web', 'لوحة تحكم (CMS)', 'Admin CMS', 'fixed', 6000, null, null, 4],
            ['web', 'تحسين SEO متقدم', 'Advanced SEO', 'fixed', 4000, null, null, 5],

            // --- E-commerce ---
            ['ecommerce', 'بوابة دفع إضافية', 'Extra payment gateway', 'fixed', 2500, null, null, 1],
            ['ecommerce', 'تكامل شحن (Bosta/Aramex)', 'Shipping integration', 'fixed', 3000, null, null, 2],
            ['ecommerce', 'برنامج ولاء', 'Loyalty program', 'fixed', 5000, null, null, 3],
            ['ecommerce', 'متعدد البائعين', 'Multi-vendor', 'fixed', 12000, null, null, 4],
            ['ecommerce', 'تطبيق موبايل', 'Mobile app', 'percentage', 0, null, 60, 5],

            // --- Branding ---
            ['branding', 'دليل الهوية (Brand Book)', 'Brand book', 'fixed', 4500, null, null, 1],
            ['branding', 'قوالب سوشيال ميديا', 'Social templates', 'fixed', 2500, null, null, 2],
            ['branding', 'تصميم مطبوعات', 'Print designs', 'fixed', 3000, null, null, 3],
            ['branding', 'موشن لوجو', 'Logo animation', 'fixed', 2000, null, null, 4],

            // --- Marketing ---
            ['marketing', 'إدارة منصة إضافية', 'Extra platform', 'fixed', 3500, null, null, 1],
            ['marketing', 'إنتاج محتوى فيديو', 'Video content', 'fixed', 5000, null, null, 2],
            ['marketing', 'حملة إعلانات مدفوعة', 'Paid ads campaign', 'fixed', 4000, null, null, 3],
            ['marketing', 'تقارير تحليلية شهرية', 'Monthly analytics', 'fixed', 1500, null, null, 4],

            // --- Any service ---
            ['any', 'استضافة سنوية', 'Annual hosting', 'fixed', 3500, null, null, 1],
            ['any', 'دعم فني مميّز (6 شهور)', 'Priority support 6mo', 'fixed', 4000, null, null, 2],
            ['any', 'تسليم سريع (Rush)', 'Rush delivery', 'percentage', 0, null, 25, 3],
        ];

        foreach ($addons as [$service, $ar, $en, $type, $egp, $sar, $pct, $sort]) {
            PackageAddon::updateOrCreate(
                ['service_type' => $service, 'name_ar' => $ar],
                [
                    'name_en' => $en,
                    'price_type' => $type,
                    'price_egp' => $egp,
                    'price_sar' => $sar,
                    'percentage' => $pct,
                    'sort_order' => $sort,
                    'is_active' => true,
                ]
            );
        }

        $this->command?->info('✓ Seeded ' . count($addons) . ' package add-ons');
    }
}
