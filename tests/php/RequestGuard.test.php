<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use JackLanding\RequestGuard;

$csrf = 'csrf-token-for-test';
$server = [
    'REQUEST_METHOD' => 'POST',
    'CONTENT_TYPE' => 'application/json; charset=UTF-8',
    'CONTENT_LENGTH' => '256',
    'HTTP_ORIGIN' => 'https://example.ru',
    'APP_ALLOWED_ORIGIN' => 'https://example.ru',
];
$payload = [
    'csrf_token' => $csrf,
    'company_website' => '',
    '_form_started_at' => microtime(true) - 2.0,
];

assert(RequestGuard::validate($server, $payload, $csrf)['ok'] === true);

$cases = [
    'method' => [[...$server, 'REQUEST_METHOD' => 'GET'], $payload],
    'content_type' => [[...$server, 'CONTENT_TYPE' => 'text/plain'], $payload],
    'body_too_large' => [[...$server, 'CONTENT_LENGTH' => '16385'], $payload],
    'csrf' => [$server, [...$payload, 'csrf_token' => 'wrong']],
    'origin' => [[...$server, 'HTTP_ORIGIN' => 'https://evil.example'], $payload],
    'honeypot' => [$server, [...$payload, 'company_website' => 'bot.example']],
    'too_fast' => [$server, [...$payload, '_form_started_at' => microtime(true)]],
];

foreach ($cases as $expected => [$caseServer, $casePayload]) {
    $result = RequestGuard::validate($caseServer, $casePayload, $csrf);
    assert($result['ok'] === false, "{$expected} should fail");
    assert($result['error'] === $expected, "Expected {$expected}, got {$result['error']}");
}

$refererOnly = $server;
unset($refererOnly['HTTP_ORIGIN']);
$refererOnly['HTTP_REFERER'] = 'https://example.ru/page';
assert(RequestGuard::validate($refererOnly, $payload, $csrf)['ok'] === true);
