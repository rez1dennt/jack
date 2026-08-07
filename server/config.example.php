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
        'host' => 'smtp.mail.ru',
        'port' => 465,
        'username' => 'tekstilopttorg@mail.ru',
        // Пароль для внешнего приложения Mail.ru хранится только в server/config.php.
        'password' => '[[MAILRU_APP_PASSWORD]]',
        'encryption' => 'ssl',
        'from_email' => 'tekstilopttorg@mail.ru',
        'from_name' => 'Текстиль Опт Торг',
        'to_email' => 'tekstilopttorg@mail.ru',
        'to_name' => 'Отдел продаж',
    ],
];
