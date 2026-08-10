<?php
declare(strict_types=1);

function hashira_identity_config(): array {
    static $config = null;
    if (is_array($config)) return $config;

    $sharedFile = dirname(HASHIRA_ROOT) . '/includes/jovigroove_identity.php';
    if (!is_file($sharedFile)) return $config = [];

    if (!defined('JOVIGROOVE_IDENTITY_BOOTSTRAP')) {
        define('JOVIGROOVE_IDENTITY_BOOTSTRAP', true);
    }
    $loaded = require $sharedFile;
    return $config = is_array($loaded) ? $loaded : [];
}

function hashira_identity_secret(): string {
    $config = hashira_identity_config();
    return trim((string) ($config['secret'] ?? ''));
}

function hashira_identity_base64url_decode(string $value): string|false {
    $padding = strlen($value) % 4;
    if ($padding) $value .= str_repeat('=', 4 - $padding);
    return base64_decode(strtr($value, '-_', '+/'), true);
}
