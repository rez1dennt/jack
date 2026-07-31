<?php
declare(strict_types=1);

namespace JackLanding;

final class InputValidator
{
    /** @return array{ok: bool, data?: array{name: string, phone: string, consent: true}, errors?: array<string, string>} */
    public static function validate(array $input): array
    {
        $errors = [];
        $name = self::normalizeName($input['name'] ?? '');
        $phone = self::normalizePhone($input['phone'] ?? '');
        $consent = ($input['consent'] ?? null) === true;

        $nameLength = self::unicodeLength($name);
        if ($nameLength < 2 || $nameLength > 80 || !preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M} '\\x{2019}-]*$/u", $name)) {
            $errors['name'] = 'Укажите корректное имя длиной от 2 до 80 символов.';
        }
        if ($phone === null) {
            $errors['phone'] = 'Укажите российский телефон в формате +7XXXXXXXXXX.';
        }
        if (!$consent) {
            $errors['consent'] = 'Необходимо согласие на обработку персональных данных.';
        }

        if ($errors !== []) {
            return ['ok' => false, 'errors' => $errors];
        }

        return [
            'ok' => true,
            'data' => [
                'name' => $name,
                'phone' => $phone,
                'consent' => true,
            ],
        ];
    }

    private static function normalizeName(mixed $value): string
    {
        if (!is_string($value)) {
            return '';
        }

        $trimmed = preg_replace('/^\s+|\s+$/u', '', $value) ?? '';
        return preg_replace('/\s+/u', ' ', $trimmed) ?? '';
    }

    private static function unicodeLength(string $value): int
    {
        if (function_exists('mb_strlen')) {
            return mb_strlen($value, 'UTF-8');
        }

        if (function_exists('iconv_strlen')) {
            $length = iconv_strlen($value, 'UTF-8');
            if ($length !== false) {
                return $length;
            }
        }

        return preg_match_all('/./us', $value, $characters) ?: 0;
    }

    private static function normalizePhone(mixed $value): ?string
    {
        if (!is_string($value) && !is_int($value)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $value) ?? '';
        if (strlen($digits) !== 11 || ($digits[0] !== '7' && $digits[0] !== '8')) {
            return null;
        }

        return '+7' . substr($digits, 1);
    }
}
