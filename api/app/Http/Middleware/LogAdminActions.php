<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAdminActions
{
    /**
     * Write-side admin requests get an audit row. GETs are skipped — reads aren't
     * mutations and would drown the table.
     */
    private const TRACKED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    private const REDACT_KEYS = ['password', 'password_confirmation', 'current_password', '_token', 'token'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! in_array($request->method(), self::TRACKED_METHODS, true)) {
            return $response;
        }

        try {
            $payload = $request->except(self::REDACT_KEYS);
            // truncate giant payloads (uploads etc.)
            $payloadJson = json_encode($payload);
            if (is_string($payloadJson) && strlen($payloadJson) > 8000) {
                $payload = ['_truncated' => true, '_size' => strlen($payloadJson)];
            }

            $subjectType = null;
            $subjectId = null;
            foreach ($request->route()?->parameters() ?? [] as $param) {
                if (is_object($param) && method_exists($param, 'getKey')) {
                    $subjectType = class_basename($param);
                    $subjectId = $param->getKey();
                    break;
                }
            }

            AuditLog::create([
                'user_id' => $request->user()?->id,
                'action' => $request->route()?->getActionName() ?? 'closure',
                'method' => $request->method(),
                'path' => $request->path(),
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'payload' => $payload,
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'status_code' => $response->getStatusCode(),
            ]);
        } catch (\Throwable $e) {
            // never let audit logging break the actual request
            report($e);
        }

        return $response;
    }
}
