<?php
declare(strict_types=1);

use JackLanding\InputValidator;
use JackLanding\MailerTransport;
use JackLanding\RateLimiter;
use JackLanding\RequestGuard;

require dirname(__DIR__, 2) . '/server/bootstrap.php';

try {
    jack_start_secure_session();
    $config = jack_load_config();

    $rawBody = file_get_contents('php://input', false, null, 0, 16_385);
    if (!is_string($rawBody) || strlen($rawBody) > 16_384) {
        jack_json_response(['ok' => false], 413);
    }

    $payload = json_decode($rawBody, true, 16, JSON_THROW_ON_ERROR);
    if (!is_array($payload)) {
        jack_json_response(['ok' => false], 400);
    }
    $payload['_form_started_at'] = $_SESSION['form_started_at'] ?? null;

    $server = $_SERVER;
    $server['APP_ALLOWED_ORIGIN'] = (string) ($config['security']['allowed_origin'] ?? '');
    $guard = RequestGuard::validate($server, $payload, (string) ($_SESSION['csrf_token'] ?? ''));
    if ($guard['ok'] !== true) {
        $status = $guard['error'] === 'method' ? 405 : 403;
        jack_json_response(['ok' => false], $status);
    }

    $rateLimiter = new RateLimiter(
        dirname(__DIR__, 2) . '/server/storage',
        (string) ($config['security']['rate_limit_secret'] ?? ''),
    );
    $rateLimitCount = (int) ($config['security']['rate_limit_count'] ?? 5);
    $rateLimitWindow = (int) ($config['security']['rate_limit_window_seconds'] ?? 600);
    if (!$rateLimiter->consume(jack_client_key(), $rateLimitCount, $rateLimitWindow)) {
        header('Retry-After: ' . $rateLimitWindow);
        jack_json_response(['ok' => false], 429);
    }

    $validation = InputValidator::validate($payload);
    if ($validation['ok'] !== true) {
        jack_json_response(['ok' => false, 'errors' => $validation['errors']], 422);
    }

    $mailer = new MailerTransport(is_array($config['smtp'] ?? null) ? $config['smtp'] : []);
    $mailer->sendLead($validation['data']);
    jack_json_response(['ok' => true]);
} catch (JsonException) {
    jack_json_response(['ok' => false], 400);
} catch (Throwable $exception) {
    error_log('Lead endpoint failure: ' . $exception->getMessage());
    jack_json_response(['ok' => false], 500);
}
