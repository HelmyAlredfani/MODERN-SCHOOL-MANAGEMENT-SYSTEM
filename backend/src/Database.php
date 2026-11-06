<?php
declare(strict_types=1);

/**
 * MSMS database connection.
 *
 * Configure the following environment variables on the PHP host:
 * MSMS_DB_HOST, MSMS_DB_PORT, MSMS_DB_NAME, MSMS_DB_USER, MSMS_DB_PASSWORD.
 * Never commit credentials to this repository.
 */
final class Database
{
    public static function connect(): PDO
    {
        $host = self::env('MSMS_DB_HOST');
        $port = self::env('MSMS_DB_PORT', '3306');
        $name = self::env('MSMS_DB_NAME');
        $user = self::env('MSMS_DB_USER');
        $password = self::env('MSMS_DB_PASSWORD');

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            $host,
            $port,
            $name
        );

        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
    }

    private static function env(string $key, ?string $default = null): string
    {
        $value = getenv($key);
        if ($value === false || $value === '') {
            if ($default !== null) {
                return $default;
            }
            throw new RuntimeException('Missing required database configuration.');
        }

        return $value;
    }
}
