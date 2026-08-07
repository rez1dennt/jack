<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use JackLanding\MailerTransport;
use PHPMailer\PHPMailer\PHPMailer;

$captured = null;
$config = [
    'host' => 'smtp.mail.ru',
    'port' => 465,
    'username' => 'tekstilopttorg@mail.ru',
    'password' => 'synthetic-mailru-app-password',
    'encryption' => 'ssl',
    'from_email' => 'tekstilopttorg@mail.ru',
    'from_name' => 'Текстиль Опт Торг',
    'to_email' => 'tekstilopttorg@mail.ru',
    'to_name' => 'Отдел продаж',
];

$transport = new MailerTransport(
    $config,
    static function (PHPMailer $mailer) use (&$captured): void {
        $captured = $mailer;
    }
);

$transport->sendLead([
    'name' => 'Анна <b>Иванова</b>',
    'phone' => '+7 (999) 123-45-67',
    'task' => 'Карманы <script>alert(1)</script>',
    'consent_at' => '2026-07-31T18:00:00+04:00',
    'consent_document_version' => '2026-07-31',
]);

assert($captured instanceof PHPMailer);
assert($captured->Host === 'smtp.mail.ru');
assert($captured->Port === 465);
assert($captured->SMTPAuth === true);
assert($captured->SMTPSecure === PHPMailer::ENCRYPTION_SMTPS);
assert($captured->Username === 'tekstilopttorg@mail.ru');
assert($captured->Password === 'synthetic-mailru-app-password');
assert($captured->From === 'tekstilopttorg@mail.ru');
assert($captured->FromName === 'Текстиль Опт Торг');
assert($captured->getToAddresses()[0][0] === 'tekstilopttorg@mail.ru');
assert($captured->getToAddresses()[0][1] === 'Отдел продаж');
assert(str_contains($captured->Body, 'Анна &lt;b&gt;Иванова&lt;/b&gt;'));
assert(!str_contains($captured->Body, '<b>Иванова</b>'));
assert(str_contains($captured->Body, 'Карманы &lt;script&gt;alert(1)&lt;/script&gt;'));
assert(!str_contains($captured->Body, '<script>alert(1)</script>'));
assert(str_contains($captured->AltBody, 'Анна <b>Иванова</b>'));
assert(str_contains($captured->AltBody, 'Карманы <script>alert(1)</script>'));
assert(str_contains($captured->Body, '2026-07-31T18:00:00+04:00'));
assert(str_contains($captured->Body, '2026-07-31'));
assert(str_contains($captured->Subject, 'Новая заявка'));

$invalidConfigRejected = false;
try {
    new MailerTransport([...$config, 'to_email' => 'not-an-email']);
} catch (InvalidArgumentException) {
    $invalidConfigRejected = true;
}
assert($invalidConfigRejected === true);
