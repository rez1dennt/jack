<?php
declare(strict_types=1);

namespace JackLanding;

final class RequestGuard
{
    private const MAX_BODY_BYTES = 16_384;
    private const MIN_FORM_SECONDS = 1.2;

    /** @return array{ok: bool, error?: string} */
    public static function validate(array $server, array $payload, string $csrf): array
    {
        if (strtoupper((string) ($server['REQUEST_METHOD'] ?? '')) !== 'POST') {
            return self::failure('method');
        }

        $contentType = (string) ($server['CONTENT_TYPE'] ?? '');
        if (!preg_match('#^application/json(?:\s*;|$)#i', $contentType)) {
            return self::failure('content_type');
        }

        $contentLength = filter_var($server['CONTENT_LENGTH'] ?? 0, FILTER_VALIDATE_INT);
        if ($contentLength !== false && $contentLength > self::MAX_BODY_BYTES) {
            return self::failure('body_too_large');
        }

        $submittedCsrf = $payload['csrf_token'] ?? null;
        if ($csrf === '' || !is_string($submittedCsrf) || !hash_equals($csrf, $submittedCsrf)) {
            return self::failure('csrf');
        }

        $allowedOrigin = (string) ($server['APP_ALLOWED_ORIGIN'] ?? '');
        $requestSource = (string) ($server['HTTP_ORIGIN'] ?? $server['HTTP_REFERER'] ?? '');
        if (!self::sameOrigin($requestSource, $allowedOrigin)) {
            return self::failure('origin');
        }

        if (trim((string) ($payload['company_website'] ?? '')) !== '') {
            return self::failure('honeypot');
        }

        $startedAt = filter_var($payload['_form_started_at'] ?? null, FILTER_VALIDATE_FLOAT);
        $elapsed = $startedAt === false ? 0.0 : microtime(true) - (float) $startedAt;
        if ($elapsed < self::MIN_FORM_SECONDS) {
            return self::failure('too_fast');
        }

        return ['ok' => true];
    }

    /** @return array{ok: false, error: string} */
    private static function failure(string $error): array
    {
        return ['ok' => false, 'error' => $error];
    }

    private static function sameOrigin(string $candidate, string $allowed): bool
    {
        $candidateParts = parse_url($candidate);
        $allowedParts = parse_url($allowed);
        if (!is_array($candidateParts) || !is_array($allowedParts)) {
            return false;
        }

        foreach (['scheme', 'host'] as $part) {
            if (!isset($candidateParts[$part], $allowedParts[$part]) || strtolower((string) $candidateParts[$part]) !== strtolower((string) $allowedParts[$part])) {
                return false;
            }
        }

        $candidatePort = $candidateParts['port'] ?? self::defaultPort((string) $candidateParts['scheme']);
        $allowedPort = $allowedParts['port'] ?? self::defaultPort((string) $allowedParts['scheme']);
        return $candidatePort === $allowedPort;
    }

    private static function defaultPort(string $scheme): ?int
    {
        return strtolower($scheme) === 'https' ? 443 : (strtolower($scheme) === 'http' ? 80 : null);
    }
}
