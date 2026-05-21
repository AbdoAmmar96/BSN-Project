<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProjectStatusTest extends TestCase
{
    use RefreshDatabase;

    private function assignedProject(User $dev): Project
    {
        return Project::factory()->create([
            'lead_developer_id' => $dev->id,
            'status' => 'in_progress',
            'progress' => 20,
        ]);
    }

    public function test_assigned_developer_can_advance_status_and_progress(): void
    {
        Mail::fake();
        Notification::fake();

        $dev = User::factory()->developer()->create();
        $project = $this->assignedProject($dev);
        $this->actingAs($dev, 'sanctum');

        $this->putJson("/api/v1/projects/{$project->id}", ['status' => 'review'])
            ->assertOk()->assertJsonPath('project.status', 'review');

        $this->putJson("/api/v1/projects/{$project->id}", ['progress' => 80])
            ->assertOk()->assertJsonPath('project.progress', 80);

        $this->putJson("/api/v1/projects/{$project->id}", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('project.status', 'completed')
            ->assertJsonPath('project.progress', 100); // completing snaps progress to 100

        $this->assertNotNull($project->fresh()->completed_at);
    }

    public function test_dragging_progress_to_100_completes_the_project(): void
    {
        Mail::fake();
        Notification::fake();

        $dev = User::factory()->developer()->create();
        $project = $this->assignedProject($dev);
        $this->actingAs($dev, 'sanctum');

        $this->putJson("/api/v1/projects/{$project->id}", ['progress' => 100])
            ->assertOk()
            ->assertJsonPath('project.progress', 100)
            ->assertJsonPath('project.status', 'completed');
    }

    public function test_developer_cannot_edit_a_project_they_are_not_assigned_to(): void
    {
        $dev = User::factory()->developer()->create();
        $other = User::factory()->developer()->create();
        $project = $this->assignedProject($other);

        $this->actingAs($dev, 'sanctum');
        $this->putJson("/api/v1/projects/{$project->id}", ['status' => 'review'])
            ->assertForbidden();
    }
}
