<?php
declare(strict_types=1);

require dirname(__DIR__, 2) . '/vendor/autoload.php';

use JackLanding\MailerTransport;
use PHPMailer\PHPMailer\PHPMailer;

$captured = null;
$config = [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'sender@example.com',
    'password' => 'sixteen-character-app-password',
    'encryption' => 'tls',
    'from_email' => 'sender@example.com',
    'from_name' => 'Jack Sewing',
    'to_email' => 'manager@example.com',
    'to_name' => 'Менеджер',
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
    'consent_at' => '2026-07-31T18:00:00+04:00',
    'consent_document_version' => '2026-07-31',
]);

assert($captured instanceof PHPMailer);
assert($captured->Host === 'smtp.gmail.com');
assert($captured->Port === 587);
assert($captured->SMTPAuth === true);
assert($captured->SMTPSecure === PHPMailer::ENCRYPTION_STARTTLS);
assert($captured->Username === 'sender@example.com');
assert($captured->Password === 'sixteen-character-app-password');
assert($captured->From === 'sender@example.com');
assert($captured->FromName === 'Jack Sewing');
assert($captured->getToAddresses()[0][0] === 'manager@example.com');
assert($captured->getToAddresses()[0][1] === 'Менеджер');
assert(str_contains($captured->Body, 'Анна &lt;b&gt;Иванова&lt;/b&gt;'));
assert(!str_contains($captured->Body, '<b>Иванова</b>'));
assert(str_contains($captured->AltBody, 'Анна <b>Иванова</b>'));
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
