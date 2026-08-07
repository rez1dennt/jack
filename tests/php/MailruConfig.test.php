<?php
declare(strict_types=1);

$config = require dirname(__DIR__, 2) . '/server/config.example.php';
$smtp = $config['smtp'] ?? [];

assert($smtp['host'] === 'smtp.mail.ru');
assert($smtp['port'] === 465);
assert($smtp['username'] === 'tekstilopttorg@mail.ru');
assert($smtp['password'] === '[[MAILRU_APP_PASSWORD]]');
assert($smtp['encryption'] === 'ssl');
assert($smtp['from_email'] === 'tekstilopttorg@mail.ru');
assert($smtp['to_email'] === 'tekstilopttorg@mail.ru');

$readme = file_get_contents(dirname(__DIR__, 2) . '/README.md');
assert(is_string($readme));
assert(str_contains($readme, 'smtp.mail.ru'));
assert(str_contains($readme, '465'));
assert(str_contains($readme, 'SSL/TLS'));
assert(str_contains($readme, '[[MAILRU_APP_PASSWORD]]'));
assert(!str_contains($readme, 'smtp.gmail.com'));
assert(!str_contains($readme, '[[GOOGLE_APP_PASSWORD]]'));
assert(!str_contains($readme, 'Настройка Google SMTP'));
