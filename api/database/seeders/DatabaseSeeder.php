<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // ADMIN — full access
        // ============================================
        User::firstOrCreate(
            ['email' => 'amr@bp-eg.com'],
            [
                'name' => 'م. عمرو شلبي',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'phone' => '+201500156690',
                'company' => 'شريك الأعمال لتقنية المعلومات',
                'position' => 'المؤسس · مدير العمليات',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'walid@bp-eg.com'],
            [
                'name' => 'م. وليد شلبي',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'phone' => '+201068758847',
                'company' => 'شريك الأعمال لتقنية المعلومات',
                'position' => 'المؤسس · المدير التقني',
                'is_active' => true,
            ]
        );

        // ============================================
        // DEVELOPERS
        // ============================================
        User::firstOrCreate(
            ['email' => 'dev@bp-eg.com'],
            [
                'name' => 'Demo Developer',
                'password' => 'password',
                'role' => User::ROLE_DEVELOPER,
                'skills' => ['Laravel', 'React', 'Tailwind', 'MySQL'],
                'position' => 'Full-stack Developer',
                'is_active' => true,
            ]
        );

        // ============================================
        // CLIENT USER
        // ============================================
        User::firstOrCreate(
            ['email' => 'client@example.com'],
            [
                'name' => 'عميل تجريبي',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'phone' => '01000000000',
                'company' => 'شركة تجريبية',
                'is_active' => true,
            ]
        );

        $this->command->info('✓ Seeded 4 users:');
        $this->command->info('  Admin:     amr@bp-eg.com / password');
        $this->command->info('  Admin:     walid@bp-eg.com / password');
        $this->command->info('  Developer: dev@bp-eg.com / password');
        $this->command->info('  User:      client@example.com / password');
    }
}
