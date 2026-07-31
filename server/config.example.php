<?php
declare(strict_types=1);

return [
    'security' => [
        // Без завершающего слеша. После покупки домена замените значение на реальный HTTPS-адрес.
        'allowed_origin' => 'https://[[DOMAIN]]',
        // Сгенерируйте отдельный длинный секрет: bin2hex(random_bytes(32)).
        'rate_limit_secret' => '[[RANDOM_32_BYTE_SECRET]]',
        'rate_limit_count' => 5,
        'rate_limit_window_seconds' => 600,
    ],
    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'username' => '[[SMTP_USERNAME]]',
        // Не пароль аккаунта: пароль приложения Google хранится только в server/config.php.
        'password' => '[[GOOGLE_APP_PASSWORD]]',
        'encryption' => 'tls',
        'from_email' => '[[SMTP_USERNAME]]',
        'from_name' => 'Jack Sewing',
        'to_email' => '[[LEAD_RECIPIENT]]',
        'to_name' => 'Менеджер',
    ],
];
