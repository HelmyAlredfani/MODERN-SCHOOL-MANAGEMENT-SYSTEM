<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once dirname(__DIR__, 2) . '/src/Database.php';

try {
    Database::connect()->query('SELECT 1');
    echo json_encode([
        'ok' => true,
        'service' => 'MSMS API',
        'database' => 'connected',
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $error) {
    error_log('[MSMS] Health check failed: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'service' => 'MSMS API',
        'database' => 'unavailable',
    ], JSON_UNESCAPED_UNICODE);
}
