<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_can_submit_contact_message(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Ahmed Test',
            'email' => 'ahmed@example.com',
            'phone' => '01000000000',
            'subject' => 'سؤال',
            'message' => 'محتاج معلومات عن السعر',
        ])->assertCreated();

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'ahmed@example.com',
            'subject' => 'سؤال',
            'status' => 'new',
        ]);
    }

    public function test_contact_rejects_missing_required_fields(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Ahmed',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['email', 'message']);
    }

    public function test_admin_can_list_contact_messages(): void
    {
        $this->actingAsRole('admin');

        \App\Models\ContactMessage::create([
            'name' => 'X',
            'email' => 'x@example.com',
            'message' => 'hello',
        ]);

        $this->getJson('/api/v1/admin/contact-messages')
            ->assertOk();
    }

    public function test_non_admin_cannot_list_contact_messages(): void
    {
        $this->actingAsRole('user');

        $this->getJson('/api/v1/admin/contact-messages')
            ->assertStatus(403);
    }
}
