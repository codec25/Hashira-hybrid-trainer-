<?php
declare(strict_types=1);

const HASHIRA_ROOT = __DIR__ . '/..';
const HASHIRA_CONFIG_FILE = __DIR__ . '/config.php';

$hashiraConfig = [];
$hashiraPdo = null;
$hashiraBootError = '';

if (is_file(HASHIRA_CONFIG_FILE)) {
    $loaded = require HASHIRA_CONFIG_FILE;
    if (is_array($loaded)) {
        $hashiraConfig = $loaded;
    }
}

function hashira_config_ready(): bool {
    global $hashiraConfig;
    $db = $hashiraConfig['db'] ?? [];
    return is_array($db)
        && !empty($db['host'])
        && !empty($db['name'])
        && !empty($db['user'])
        && !str_contains((string) $db['name'], 'CHANGE_ME')
        && !str_contains((string) $db['user'], 'CHANGE_ME');
}

function hashira_app_url(string $path = ''): string {
    global $hashiraConfig;
    $base = rtrim((string) ($hashiraConfig['app_base'] ?? '/hashira'), '/');
    if ($path === '') return $base . '/';
    if (preg_match('#^https?://#i', $path)) return $path;
    if ($base !== '' && str_starts_with($path, $base . '/')) return $path;
    return $base . '/' . ltrim($path, '/');
}

function hashira_h(?string $value): string {
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function hashira_start_session(): void {
    global $hashiraConfig;
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (bool) ($hashiraConfig['secure_cookies'] ?? true);
    session_name('HASHIRASESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => rtrim((string) ($hashiraConfig['app_base'] ?? '/hashira'), '/') . '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

hashira_start_session();

require_once __DIR__ . '/shared_identity.php';

if (hashira_config_ready()) {
    try {
        $db = $hashiraConfig['db'];
        $hashiraPdo = new PDO(
            'mysql:host=' . $db['host'] . ';dbname=' . $db['name'] . ';charset=utf8mb4',
            $db['user'],
            (string) ($db['pass'] ?? ''),
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (Throwable $error) {
        $hashiraBootError = 'Hashira could not connect to its database.';
    }
}

function hashira_pdo(): PDO {
    global $hashiraPdo;
    if (!$hashiraPdo instanceof PDO) {
        throw new RuntimeException('Hashira database is not ready.');
    }
    return $hashiraPdo;
}

function hashira_user_id(): ?int {
    return isset($_SESSION['hashira_user_id']) ? (int) $_SESSION['hashira_user_id'] : null;
}

function hashira_logged_in(): bool {
    return hashira_user_id() !== null;
}

function hashira_current_user(): ?array {
    static $loaded = false;
    static $user = null;
    if ($loaded) return $user;
    $loaded = true;
    $id = hashira_user_id();
    if (!$id) return null;
    try {
        $stmt = hashira_pdo()->prepare(
            "SELECT id, username, email, full_name, avatar_url, status, created_at
             FROM hashira_users WHERE id = ? AND status = 'active' LIMIT 1"
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch() ?: null;
    } catch (Throwable $error) {
        $user = null;
    }
    if (!$user) unset($_SESSION['hashira_user_id']);
    return $user;
}

function hashira_csrf_token(): string {
    if (empty($_SESSION['hashira_csrf'])) {
        $_SESSION['hashira_csrf'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['hashira_csrf'];
}

function hashira_verify_csrf(?string $token): bool {
    $stored = (string) ($_SESSION['hashira_csrf'] ?? '');
    return $stored !== '' && is_string($token) && hash_equals($stored, $token);
}

function hashira_json(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function hashira_json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

function hashira_require_api_login(): int {
    $user = hashira_current_user();
    if (!$user) hashira_json(['ok' => false, 'error' => 'authentication_required'], 401);
    return (int) $user['id'];
}

function hashira_require_api_csrf(array $input): void {
    $header = $_SERVER['HTTP_X_HASHIRA_CSRF'] ?? null;
    $token = is_string($header) && $header !== '' ? $header : ($input['csrf'] ?? null);
    if (!hashira_verify_csrf(is_string($token) ? $token : null)) {
        hashira_json(['ok' => false, 'error' => 'invalid_request_token'], 419);
    }
}

function hashira_redirect(string $path): never {
    header('Location: ' . hashira_app_url($path));
    exit;
}

function hashira_circle_membership(PDO $pdo, int $circleId, int $userId): ?array {
    $stmt = $pdo->prepare(
        'SELECT id, role, status FROM hashira_circle_members WHERE circle_id = ? AND user_id = ? LIMIT 1'
    );
    $stmt->execute([$circleId, $userId]);
    return $stmt->fetch() ?: null;
}

function hashira_can_manage_circle(PDO $pdo, int $circleId, int $userId): bool {
    $membership = hashira_circle_membership($pdo, $circleId, $userId);
    return $membership
        && $membership['status'] === 'active'
        && in_array($membership['role'], ['creator', 'coach'], true);
}
