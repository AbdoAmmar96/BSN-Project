<?php

namespace Database\Seeders;

use App\Models\PortfolioWork;
use Illuminate\Database\Seeder;

class PortfolioWorkSeeder extends Seeder
{
    public function run(): void
    {
        // [url, title, tag, company_ar (description), category]
        $web = [
            ['https://nasrconsult.com/', 'Nasr Chemicals', 'موقع · كيماويات واستشارات', 'شركة النصر للكيماويات والاستشارات الصناعية.'],
            ['http://al-amein.com/', 'Al Amein', 'موقع · تصدير زراعي', 'شركة الأمين لتصدير المحاصيل الزراعية.'],
            ['https://saqacapital-llc.com/', 'Saqa Capital', 'موقع · حلول مالية', 'شركة ثقة (Saqa) للحلول المالية.'],
            ['https://global-translations.net/', 'Global Translations', 'موقع · ترجمة', 'جلوبال ترنسليشن — خدمات الترجمة الاحترافية.'],
            ['https://alebel.com/', 'Alebel Holding', 'موقع · مجموعة شركات', 'شركة الإبل القابضة — مجموعة شركات.'],
            ['https://gfc-it.com/', 'Golden Future Care', 'موقع · كابلات', 'شركة جولدن لتوريد كابلات الكهرباء.'],
            ['https://arabengineers-eg.com/', 'Arab Engineers', 'موقع · عقاري', 'المهندسون العرب للاستثمار العقاري.'],
            ['https://dglaviation.net/', 'DGL Aviation', 'موقع · طيران', 'شركة DGL لخدمات الطيران الخاصة.'],
            ['https://bluewave-group.net/', 'Blue Wave', 'موقع · بحري', 'شركة بلو ويف لصيانة السفن البحرية.'],
            ['https://fema-ms.com/', 'Fema MS', 'موقع · بحري', 'شركة فيما لصيانة أجهزة السفن.'],
            ['https://elgendychemical.com/', 'Elgendy Chemical', 'موقع · كيماويات', 'شركة الجندي للكيماويات.'],
            ['https://rozetpump.com/', 'Rozet Pump', 'موقع · مضخات', 'شركة روزيت — مصنع إيطالي للمضخات.'],
            ['https://samadelivery.ae/', 'Sama Delivery', 'موقع · شحن إماراتي', 'شركة سما دليفري — شركة شحن إماراتية.'],
            ['https://herbsgarden-eg.com/', 'Herbs Garden', 'موقع · تصدير زراعي', 'هيربس جاردن — تصدير الحاصلات الزراعية.'],
            ['https://westgate.sa/', 'West Gate', 'موقع · مقاولات سعودية', 'شركة البوابة الغربية — مقاولات سعودية.'],
            ['https://milestone-ltd.com/', 'Milestone LTD', 'موقع · رخام وجرانيت', 'شركة ميل ستون — تصدير الرخام والجرانيت.'],
            ['https://mm-marinebunker.com/', 'MM Marine Bunker', 'موقع · وقود بحري', 'شركة MM لتزويد السفن بالوقود البحري.'],
            ['https://eg-energy.com/', 'Egy Energy', 'موقع · طاقة', 'المجموعة المصرية للطاقة — حلول توليد.'],
            ['https://namaa-academy.com/', 'Namaa Academy', 'منصة · تعليمية', 'منصة نماء التعليمية للمحتوى التدريبي.'],
            ['https://scoutacademy-eg.com/', 'Scout Academy', 'موقع · كشافة', 'أكاديمية الكشافة المصرية.'],
            ['https://aljada20.com/', 'Aljada 20', 'موقع · إدارة مرافق', 'الجادة عشرون لإدارة المرافق.'],
            ['https://orchardtrade.com/', 'Orchard Trade', 'موقع · تصدير زراعي', 'شركة أورشارد تريد — تصدير الحاصلات.'],
            ['https://union-arab.org/', 'Union Arab', 'موقع · اتحاد دولي', 'الاتحاد العربي — اتحاد دولي للخبراء.'],
            ['http://ahmedelfattehautopart.com/', 'Ahmed El Fatteh', 'موقع · قطع غيار', 'مؤسسة أحمد الفتح لقطع غيار السيارات.'],
            ['https://innomation.net/', 'Innomation', 'موقع · أتمتة صناعية', 'إنوميشن للحلول الصناعية ومجال الأتمتة.'],
            ['https://royal-city-development.com/', 'Royal City', 'موقع · استثمار عقاري', 'شركة رويال سيتي للاستثمار العقاري.'],
            ['https://nasseflawfirm.com/', 'Nassef Law', 'موقع · محاماة', 'مؤسسة الناصف للمحاماة والاستشارات القانونية.'],
            ['https://deraa-ksa.com/', 'Deraa', 'موقع · إطفاء وسلامة', 'مؤسسة درع للأمن — أنظمة الإطفاء والسلامة.'],
            ['https://els-shipping.com/', 'ELS Shipping', 'موقع · لوجستيات', 'ELS — حلول لوجستية متكاملة.'],
            ['https://suzlerpump.com/', 'Suzler Pump', 'موقع · مضخات', 'شركة سوزلر بامب — مضخات المياه.'],
            ['https://hotel-spark.com/', 'Hotel Spark', 'موقع · خدمات نظافة', 'هوتيل سبارك — خدمات النظافة الفندقية.'],
            ['https://proconsult-eg.com/', 'Pro Consult', 'موقع · استشارات', 'شركة برو كونسلت للاستشارات.'],
        ];

        $ecom = [
            ['https://maskaany.com/', 'Maskaany', 'متجر · أثاث', 'متجر مسكني — متجر أثاث متكامل.'],
            ['http://maashehaa.com/', 'Maashehaa', 'متجر · كمبيوتر', 'متجر مشيها — أجهزة الكمبيوتر والإكسسوارات.'],
            ['http://progressx-eg.com/', 'Progress X', 'متجر · توزيع', 'متجر بروجرس اكس — شركة توزيع.'],
            ['https://grasse-egy.com/', 'Grasse', 'متجر · عطور', 'متجر جراس — متجر عطور فاخرة.'],
            ['http://polatrick.com/', 'Pola Trick', 'متجر · أدوات منزلية', 'متجر بولا تريك للأدوات المنزلية.'],
            ['https://filterconcrete.com/', 'Filter Concrete', 'متجر · فلاتر مياه', 'متجر شركة فلاتر تنقية المياه.'],
            ['https://mkcaffeegypt.com/', 'MK Cafe', 'متجر · قهوة', 'متجر ام كي كافيه — متجر قهوة وحبوب.'],
            ['http://bakkah-eg.com/', 'Bakkah Store', 'متجر · أدوات منزلية', 'متجر بكة — +3,400 منتج، WooCommerce متكامل.'],
            ['http://mansour-market.com/', 'Mansour Market', 'متجر · عام', 'متجر خلفاء منصور — متجر عام شامل.'],
        ];

        $sort = 0;
        foreach ($web as [$url, $title, $tag, $desc]) {
            PortfolioWork::updateOrCreate(
                ['url' => $url],
                [
                    'title' => $title,
                    'company_ar' => $desc,
                    'tag' => $tag,
                    'description' => $desc,
                    'tech' => ['React', 'Laravel'],
                    'category' => 'web',
                    'sort_order' => $sort++,
                    'is_active' => true,
                ]
            );
        }

        $sort = 0;
        foreach ($ecom as [$url, $title, $tag, $desc]) {
            PortfolioWork::updateOrCreate(
                ['url' => $url],
                [
                    'title' => $title,
                    'company_ar' => $desc,
                    'tag' => $tag,
                    'description' => $desc,
                    'tech' => ['WooCommerce', 'WordPress'],
                    'category' => 'ecommerce',
                    'sort_order' => $sort++,
                    'is_active' => true,
                ]
            );
        }

        $this->command?->info('✓ Seeded ' . (count($web) + count($ecom)) . ' portfolio works');
    }
}
