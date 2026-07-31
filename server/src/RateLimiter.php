<?php
declare(strict_types=1);

namespace JackLanding;

use Closure;
use RuntimeException;

final class RateLimiter
{
    private Closure $clock;

    public function __construct(
        private readonly string $storagePath,
        private readonly string $secret,
        ?callable $clock = null,
    ) {
        $this->clock = $clock === null ? static fn (): int => time() : Closure::fromCallable($clock);
    }

    public function consume(string $key, int $limit, int $windowSeconds): bool
    {
        if ($limit < 1 || $windowSeconds < 1 || $this->secret === '') {
            throw new RuntimeException('Invalid rate limiter configuration.');
        }
        if (!is_dir($this->storagePath) && !mkdir($this->storagePath, 0700, true) && !is_dir($this->storagePath)) {
            throw new RuntimeException('Rate limiter storage is not writable.');
        }

        $hash = hash_hmac('sha256', $key, $this->secret);
        $path = $this->storagePath . DIRECTORY_SEPARATOR . $hash . '.json';
        $handle = fopen($path, 'c+');
        if ($handle === false) {
            throw new RuntimeException('Rate limiter file cannot be opened.');
        }

        try {
            if (!flock($handle, LOCK_EX)) {
                throw new RuntimeException('Rate limiter lock cannot be acquired.');
            }

            $contents = stream_get_contents($handle);
            $decoded = is_string($contents) && $contents !== '' ? json_decode($contents, true) : [];
            $timestamps = is_array($decoded) ? array_filter($decoded, 'is_int') : [];
            $now = ($this->clock)();
            $cutoff = $now - $windowSeconds;
            $timestamps = array_values(array_filter($timestamps, static fn (int $timestamp): bool => $timestamp > $cutoff));

            $allowed = count($timestamps) < $limit;
            if ($allowed) {
                $timestamps[] = $now;
            }

            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, json_encode($timestamps, JSON_THROW_ON_ERROR));
            fflush($handle);

            return $allowed;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
}
