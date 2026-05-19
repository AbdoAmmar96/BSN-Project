<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Package;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_write_action_creates_an_audit_log(): void
    {
        $admin = $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/packages', [
            'service_type' => 'web',
            'name' => 'Landing',
            'price' => 8500,
        ])->assertCreated();

        $log = AuditLog::query()->latest()->first();
        $this->assertNotNull($log);
        $this->assertSame($admin->id, $log->user_id);
        $this->assertSame('POST', $log->method);
        $this->assertSame(201, $log->status_code);
        $this->assertStringContainsString('packages', $log->path);
    }

    public function test_get_requests_are_not_audited(): void
    {
        $this->actingAsRole('admin');
        $this->getJson('/api/v1/admin/packages')->assertOk();

        $this->assertSame(0, AuditLog::count());
    }

    public function test_password_is_redacted_from_audit_payload(): void
    {
        $this->actingAsRole('admin');

        $this->postJson('/api/v1/admin/users', [
            'name' => 'New Dev',
            'email' => 'newdev@example.com',
            'password' => 'super-secret-pass',
            'role' => 'developer',
        ])->assertCreated();

        $log = AuditLog::query()->latest()->first();
        $this->assertNotNull($log);
        $this->assertArrayNotHasKey('password', $log->payload ?? []);
    }

    public function test_admin_can_list_audit_logs(): void
    {
        $this->actingAsRole('admin');
        AuditLog::factory()->count(3)->create();

        $this->getJson('/api/v1/admin/audit-logs')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'per_page']);
    }

    public function test_non_admin_cannot_view_audit_logs(): void
    {
        $this->actingAsRole('user');
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
    }
}
