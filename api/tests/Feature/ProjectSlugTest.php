<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_slug_is_generated_from_title(): void
    {
        $p = Project::factory()->create(['title' => 'موقع تعريفي للشركة']);

        $this->assertNotEmpty($p->slug);
        $this->assertStringContainsString('-', $p->slug);
    }

    public function test_two_projects_with_same_title_get_unique_slugs(): void
    {
        $title = 'موقع تعريفي';
        $a = Project::factory()->create(['title' => $title]);
        $b = Project::factory()->create(['title' => $title]);

        $this->assertNotSame($a->slug, $b->slug);
    }

    public function test_explicit_slug_is_preserved(): void
    {
        $p = Project::factory()->create(['title' => 'X', 'slug' => 'my-custom-slug']);

        $this->assertSame('my-custom-slug', $p->slug);
    }
}
