<?php
declare(strict_types=1);

namespace JackLanding;

use Closure;
use InvalidArgumentException;
use PHPMailer\PHPMailer\PHPMailer;

final class MailerTransport
{
    private Closure $sender;

    /** @param array<string, mixed> $config */
    public function __construct(
        private readonly array $config,
        ?callable $sender = null,
    ) {
        $this->assertValidConfig();
        $this->sender = $sender === null
            ? static fn (PHPMailer $mailer): bool => $mailer->send()
            : Closure::fromCallable($sender);
    }

    /** @param array{name: string, phone: string, task: string, consent_at: string, consent_document_version: string} $lead */
    public function sendLead(array $lead): void
    {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = (string) $this->config['host'];
        $mailer->Port = (int) $this->config['port'];
        $mailer->SMTPAuth = true;
        $mailer->Username = (string) $this->config['username'];
        $mailer->Password = (string) $this->config['password'];
        $mailer->SMTPSecure = $this->config['encryption'] === 'ssl'
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->SMTPDebug = 0;
        $mailer->Timeout = 15;
        $mailer->CharSet = PHPMailer::CHARSET_UTF8;
        $mailer->Encoding = PHPMailer::ENCODING_BASE64;

        $mailer->setFrom((string) $this->config['from_email'], (string) $this->config['from_name']);
        $mailer->addAddress((string) $this->config['to_email'], (string) $this->config['to_name']);

        $safeName = htmlspecialchars($lead['name'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safePhone = htmlspecialchars($lead['phone'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $task = trim($lead['task'] ?? '');
        $safeTask = nl2br(htmlspecialchars($task !== '' ? $task : 'Не указана', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), false);
        $safeConsentAt = htmlspecialchars($lead['consent_at'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $safeConsentVersion = htmlspecialchars($lead['consent_document_version'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $mailer->isHTML(true);
        $mailer->Subject = 'Новая заявка с сайта Jack Sewing';
        $mailer->Body = <<<HTML
            <h2>Новая заявка на консультацию</h2>
            <p><strong>Имя:</strong> {$safeName}</p>
            <p><strong>Телефон:</strong> {$safePhone}</p>
            <p><strong>Задача:</strong><br>{$safeTask}</p>
            <p><strong>Согласие получено:</strong> {$safeConsentAt}</p>
            <p><strong>Версия согласия:</strong> {$safeConsentVersion}</p>
            HTML;
        $plainTask = $task !== '' ? $task : 'Не указана';
        $mailer->AltBody = "Новая заявка на консультацию\nИмя: {$lead['name']}\nТелефон: {$lead['phone']}\nЗадача: {$plainTask}\nСогласие получено: {$lead['consent_at']}\nВерсия согласия: {$lead['consent_document_version']}";

        ($this->sender)($mailer);
    }

    private function assertValidConfig(): void
    {
        foreach (['host', 'username', 'password', 'from_email', 'from_name', 'to_email', 'to_name'] as $key) {
            if (!isset($this->config[$key]) || !is_string($this->config[$key]) || trim($this->config[$key]) === '') {
                throw new InvalidArgumentException("Missing SMTP setting: {$key}.");
            }
        }

        foreach (['from_email', 'to_email'] as $key) {
            if (filter_var($this->config[$key], FILTER_VALIDATE_EMAIL) === false) {
                throw new InvalidArgumentException("Invalid SMTP email setting: {$key}.");
            }
        }

        $port = filter_var($this->config['port'] ?? null, FILTER_VALIDATE_INT);
        if ($port === false || $port < 1 || $port > 65535) {
            throw new InvalidArgumentException('Invalid SMTP port.');
        }

        if (!in_array($this->config['encryption'] ?? null, ['tls', 'ssl'], true)) {
            throw new InvalidArgumentException('SMTP encryption must be tls or ssl.');
        }
    }
}
