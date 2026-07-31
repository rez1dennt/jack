<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/server/bootstrap.php';

try {
    jack_start_secure_session();

    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    if (!isset($_SESSION['form_started_at']) || !is_float($_SESSION['form_started_at'])) {
        $_SESSION['form_started_at'] = microtime(true);
    }

    jack_json_response(['token' => $_SESSION['csrf_token']]);
} catch (Throwable $exception) {
    error_log('CSRF endpoint failure: ' . $exception->getMessage());
    jack_json_response(['ok' => false], 500);
}
