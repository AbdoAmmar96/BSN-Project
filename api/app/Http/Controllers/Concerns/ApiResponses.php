<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;

/**
 * Small response helpers shared by API controllers. Lets us write
 * `$this->ok($data)` instead of repeating `response()->json([...])`
 * with the same wrapping shape every time.
 */
trait ApiResponses
{
    protected function ok(mixed $data = null, array $meta = []): JsonResponse
    {
        $body = is_array($data) && array_is_list($data) ? ['data' => $data] : (array) $data;
        if (!empty($meta)) {
            $body['meta'] = $meta;
        }
        return response()->json($body ?: ['ok' => true]);
    }

    protected function created(mixed $data = null): JsonResponse
    {
        $body = is_array($data) ? $data : (array) $data;
        return response()->json($body ?: ['ok' => true], 201);
    }

    protected function deleted(): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    protected function error(string $message, int $status = 400, array $extra = []): JsonResponse
    {
        return response()->json(array_merge(['message' => $message], $extra), $status);
    }
}
