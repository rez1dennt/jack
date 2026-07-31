<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use JackLanding\RateLimiter;

$directory = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'jack-rate-' . bin2hex(random_bytes(6));
$now = 1_000_000;
$limiter = new RateLimiter($directory, 'test-secret', static function () use (&$now): int {
    return $now;
});

for ($attempt = 1; $attempt <= 5; $attempt++) {
    assert($limiter->consume('127.0.0.1', 5, 600) === true);
}
assert($limiter->consume('127.0.0.1', 5, 600) === false);
assert($limiter->consume('127.0.0.2', 5, 600) === true);

$now += 601;
assert($limiter->consume('127.0.0.1', 5, 600) === true);
