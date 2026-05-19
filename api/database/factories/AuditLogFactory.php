<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->admin(),
            'action' => $this->faker->randomElement([
                'App\\Http\\Controllers\\Api\\UserController@store',
                'App\\Http\\Controllers\\Api\\UserController@update',
                'App\\Http\\Controllers\\Api\\PackageController@store',
                'App\\Http\\Controllers\\Api\\PackageController@destroy',
                'App\\Http\\Controllers\\Api\\InvoiceController@update',
            ]),
            'method' => $this->faker->randomElement(['POST', 'PUT', 'DELETE']),
            'path' => 'api/v1/admin/' . $this->faker->randomElement(['users', 'packages', 'invoices']),
            'payload' => ['note' => $this->faker->sentence()],
            'ip' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'status_code' => $this->faker->randomElement([200, 201, 204, 422]),
        ];
    }
}
