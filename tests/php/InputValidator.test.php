<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use JackLanding\InputValidator;

$valid = InputValidator::validate([
    'name' => "  Анна   Мария-Петрова  ",
    'phone' => '8 (999) 123-45-67',
    'task' => "  Прорезные   карманы\nна пальто  ",
    'consent' => true,
    'company_website' => '',
    'unknown' => '<script>alert(1)</script>',
]);

assert($valid['ok'] === true);
assert($valid['data'] === [
    'name' => 'Анна Мария-Петрова',
    'phone' => '+79991234567',
    'task' => "Прорезные карманы\nна пальто",
    'consent' => true,
]);

$invalid = InputValidator::validate([
    'name' => 'A1',
    'phone' => '123',
    'consent' => 'true',
]);

assert($invalid['ok'] === false);
assert(isset($invalid['errors']['name'], $invalid['errors']['phone'], $invalid['errors']['consent']));

$optionalTask = InputValidator::validate([
    'name' => 'Анна',
    'phone' => '8 (999) 123-45-67',
    'task' => '',
    'consent' => true,
]);
assert($optionalTask['ok'] === true);
assert($optionalTask['data']['task'] === '');

$longTask = InputValidator::validate([
    'name' => 'Анна',
    'phone' => '8 (999) 123-45-67',
    'task' => str_repeat('Я', 1001),
    'consent' => true,
]);
assert($longTask['ok'] === false);
assert(isset($longTask['errors']['task']));

$longUnicodeName = InputValidator::validate([
    'name' => str_repeat('Я', 81),
    'phone' => '8 (999) 123-45-67',
    'consent' => true,
]);

assert($longUnicodeName['ok'] === false);
assert(isset($longUnicodeName['errors']['name']));
