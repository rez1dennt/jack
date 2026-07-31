<?php
declare(strict_types=1);

return [
    'security' => [
        // Без завершающего слеша. После покупки домена замените значение на реальный HTTPS-адрес.
        'allowed_origin' => 'https://example.ru',
        // Сгенерируйте отдельный длинный секрет: bin2hex(random_bytes(32)).
        'rate_limit_secret' => 'REPLACE_WITH_A_RANDOM_64_CHARACTER_SECRET',
        'rate_limit_count' => 5,
        'rate_limit_window_seconds' => 600,
    ],
    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'username' => 'sender@gmail.com',
        // Не пароль аккаунта: пароль приложения Google хранится только в server/config.php.
        'password' => 'REPLACE_WITH_GOOGLE_APP_PASSWORD',
        'encryption' => 'tls',
        'from_email' => 'sender@gmail.com',
        'from_name' => 'Jack Sewing',
        'to_email' => 'manager@example.ru',
        'to_name' => 'Менеджер',
    ],
];
