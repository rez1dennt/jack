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
