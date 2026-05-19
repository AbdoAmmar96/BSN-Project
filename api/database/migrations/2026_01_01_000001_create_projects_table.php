<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lead_developer_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->enum('service_type', ['web', 'ecommerce', 'branding', 'marketing', 'seo', 'email', 'other']);
            $table->string('package_tier')->nullable(); // 'landing', 'multipage_pro', 'enterprise', etc.

            $table->enum('status', [
                'draft', 'pending', 'quoted', 'approved',
                'in_progress', 'review', 'revision',
                'completed', 'cancelled', 'on_hold'
            ])->default('draft')->index();

            $table->decimal('budget', 12, 2)->default(0);
            $table->string('currency', 3)->default('EGP');
            $table->decimal('paid_amount', 12, 2)->default(0);

            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->date('completed_at')->nullable();

            $table->unsignedTinyInteger('progress')->default(0); // 0-100
            $table->json('meta')->nullable(); // requirements, files, etc.

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'service_type']);
            $table->index('client_id');
        });

        // Project team members (developers assigned beyond lead)
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['lead', 'contributor', 'reviewer'])->default('contributor');
            $table->timestamps();

            $table->unique(['project_id', 'user_id']);
        });

        // Project tasks (for developers to track work)
        Schema::create('project_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['todo', 'in_progress', 'review', 'done'])->default('todo');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['project_id', 'status']);
        });

        // Deliverables (files uploaded by devs for clients)
        Schema::create('project_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->default(0);
            $table->boolean('is_final')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_deliverables');
        Schema::dropIfExists('project_tasks');
        Schema::dropIfExists('project_members');
        Schema::dropIfExists('projects');
    }
};
