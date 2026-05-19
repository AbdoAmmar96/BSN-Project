<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            // WEB
            ['service_type' => 'web', 'name' => 'Landing Page', 'price' => 8500, 'currency' => 'EGP',
                'note' => 'صفحة هبوط واحدة محسّنة للتحويل',
                'features' => ['تصميم مخصص', 'Single page طويلة', 'نموذج تواصل + WhatsApp', 'SEO أساسي'],
                'sort_order' => 1],
            ['service_type' => 'web', 'name' => 'Multi-page Pro', 'price' => 22000, 'currency' => 'EGP',
                'note' => 'موقع شركة متكامل · Laravel + Vite',
                'features' => ['5-8 صفحات', 'لوحة تحكم احترافية', 'SEO تقني متقدم', 'دعم شهر مجاني'],
                'featured' => true, 'ribbon' => 'الأكتر طلباً', 'sort_order' => 2],
            ['service_type' => 'web', 'name' => 'Enterprise', 'price' => 45000, 'currency' => 'EGP', 'price_prefix' => 'من',
                'note' => 'مشروع مخصص بالكامل',
                'features' => ['+10 صفحات / موديولات', 'نظام مستخدمين', 'تكاملات APIs', 'دعم 3 شهور مجاني'],
                'sort_order' => 3],

            // ECOMMERCE
            ['service_type' => 'ecommerce', 'name' => 'Starter', 'price' => 18000, 'currency' => 'EGP',
                'note' => 'متجر بسيط · حتى 100 منتج',
                'features' => ['تصميم متجر احترافي', 'بوابة دفع واحدة', 'شركة شحن واحدة', 'كوبونات أساسية'],
                'sort_order' => 1],
            ['service_type' => 'ecommerce', 'name' => 'Growth', 'price' => 38000, 'currency' => 'EGP',
                'note' => 'متجر متكامل · غير محدود المنتجات',
                'features' => ['منتجات غير محدودة', '2-3 بوابات دفع', 'برنامج ولاء + نقاط', 'تقارير تفصيلية'],
                'featured' => true, 'ribbon' => 'الأكتر طلباً', 'sort_order' => 2],
            ['service_type' => 'ecommerce', 'name' => 'Enterprise', 'price' => 70000, 'currency' => 'EGP', 'price_prefix' => 'من',
                'note' => 'منصة B2B / Marketplace',
                'features' => ['متعدد البائعين', 'ERP integration', 'API كاملة للموبايل', 'أسعار B2B'],
                'sort_order' => 3],

            // BRANDING
            ['service_type' => 'branding', 'name' => 'Logo Only', 'price' => 3500, 'currency' => 'EGP',
                'note' => 'لوجو احترافي',
                'features' => ['3 مفاهيم أولية', 'مراجعتين', 'كل الصيغ (PNG/SVG/PDF)', 'دليل استخدام بسيط'],
                'sort_order' => 1],
            ['service_type' => 'branding', 'name' => 'Full Identity', 'price' => 9500, 'currency' => 'EGP',
                'note' => 'هوية متكاملة + Brand Book',
                'features' => ['دليل هوية كامل PDF', 'نظام ألوان وخطوط', 'قرطاسية احترافية', '5 قوالب سوشيال'],
                'featured' => true, 'ribbon' => 'الأكتر طلباً', 'sort_order' => 2],
            ['service_type' => 'branding', 'name' => 'Brand System', 'price' => 18000, 'currency' => 'EGP', 'price_prefix' => 'من',
                'note' => 'نظام هوية شامل',
                'features' => ['دليل +40 صفحة', 'نظام رموز كامل', '+15 قالب سوشيال', 'تطبيقات حقيقية'],
                'sort_order' => 3],

            // MARKETING
            ['service_type' => 'marketing', 'name' => 'Single Platform', 'price' => 4500, 'currency' => 'EGP', 'period' => '/شهر',
                'note' => 'منصة واحدة',
                'features' => ['حتى 4 حملات نشطة', 'Pixel + Conversions', 'تقرير أسبوعي', 'اجتماع شهري'],
                'sort_order' => 1],
            ['service_type' => 'marketing', 'name' => 'Multi Platform', 'price' => 8500, 'currency' => 'EGP', 'period' => '/شهر',
                'note' => '2-3 منصات + محتوى',
                'features' => ['2-3 منصات إعلانية', '8 تصاميم/شهر', 'كتابة نصوص الإعلانات', 'A/B testing'],
                'featured' => true, 'ribbon' => 'الأكتر طلباً', 'sort_order' => 2],
            ['service_type' => 'marketing', 'name' => 'Performance', 'price' => 15000, 'currency' => 'EGP', 'price_prefix' => 'من', 'period' => '/شهر',
                'note' => 'إدارة شاملة',
                'features' => ['كل المنصات', 'SEO + Content', '+20 تصميم/شهر', 'Account Manager مخصص'],
                'sort_order' => 3],
        ];

        foreach ($packages as $p) {
            Package::create($p);
        }
    }
}
