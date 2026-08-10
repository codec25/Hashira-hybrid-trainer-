<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

function hashira_identity_fail(string $message, int $status = 400): never {
    http_response_code($status);
    ?>
    <!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Account connection · Hashira</title><link rel="stylesheet" href="../styles.css?v=identity1"></head>
    <body class="hashira-auth-page"><main class="hashira-auth-shell"><section class="hashira-auth-card">
    <span class="community-kicker">ACCOUNT CONNECTION</span><h2>We couldn’t connect VILLA to HASHIRA</h2>
    <p><?= hashira_h($message) ?></p><a class="hashira-auth-guest" href="login.php">Return to sign in</a>
    </section></main></body></html><?php
    exit;
}

$token = (string) ($_GET['token'] ?? '');
$signature = (string) ($_GET['sig'] ?? '');
$next = (string) ($_GET['next'] ?? '#home');
if (!preg_match('/^#[a-z]+$/', $next)) $next = '#home';

$secret = hashira_identity_secret();
if ($secret === '') hashira_identity_fail('The shared identity key is missing on the server.', 503);
if ($token === '' || $signature === '') hashira_identity_fail('The connection request is incomplete.');

$expected = rtrim(strtr(base64_encode(hash_hmac('sha256', $token, $secret, true)), '+/', '-_'), '=');
if (!hash_equals($expected, $signature)) hashira_identity_fail('The connection request could not be verified.', 403);

$json = hashira_identity_base64url_decode($token);
$payload = is_string($json) ? json_decode($json, true) : null;
if (!is_array($payload)) hashira_identity_fail('The connection request is invalid.');

$now = time();
if (($payload['iss'] ?? '') !== 'villa' || (int) ($payload['exp'] ?? 0) < $now || (int) ($payload['iat'] ?? 0) > $now + 30) {
    hashira_identity_fail('The connection request expired. Please try again.');
}

$providerUserId = (int) ($payload['sub'] ?? 0);
$email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
$username = mb_strtolower(trim((string) ($payload['username'] ?? '')));
$fullName = trim((string) ($payload['full_name'] ?? ''));
$avatarUrl = trim((string) ($payload['avatar_url'] ?? ''));
$nonce = trim((string) ($payload['nonce'] ?? ''));

if ($providerUserId < 1 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $nonce === '' || strlen($nonce) > 100) {
    hashira_identity_fail('The VILLA account did not provide a valid identity.');
}

try {
    $pdo = hashira_pdo();
    $pdo->beginTransaction();
    $pdo->exec('DELETE FROM hashira_identity_nonces WHERE expires_at < NOW()');

    $nonceStmt = $pdo->prepare('INSERT INTO hashira_identity_nonces (nonce, expires_at) VALUES (?, FROM_UNIXTIME(?))');
    $nonceStmt->execute([$nonce, (int) $payload['exp']]);

    $linkStmt = $pdo->prepare(
        "SELECT u.id FROM hashira_identity_links l
         JOIN hashira_users u ON u.id = l.user_id
         WHERE l.provider = 'villa' AND l.provider_user_id = ? AND u.status = 'active' LIMIT 1"
    );
    $linkStmt->execute([$providerUserId]);
    $userId = (int) ($linkStmt->fetchColumn() ?: 0);

    if ($userId < 1) {
        $userStmt = $pdo->prepare("SELECT id FROM hashira_users WHERE email = ? AND status = 'active' LIMIT 1");
        $userStmt->execute([$email]);
        $userId = (int) ($userStmt->fetchColumn() ?: 0);

        if ($userId < 1) {
            $base = preg_replace('/[^a-z0-9._-]+/', '', $username) ?: 'athlete';
            $base = substr($base, 0, 32);
            if (strlen($base) < 3) $base = 'athlete';
            $candidate = $base;
            $counter = 1;
            $check = $pdo->prepare('SELECT id FROM hashira_users WHERE username = ? LIMIT 1');
            while (true) {
                $check->execute([$candidate]);
                if (!$check->fetch()) break;
                $candidate = substr($base, 0, 32) . '-' . $counter++;
            }

            $create = $pdo->prepare(
                'INSERT INTO hashira_users (username, email, password_hash, full_name, avatar_url, email_verified_at, last_login_at)
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())'
            );
            $create->execute([
                $candidate,
                $email,
                password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT),
                $fullName !== '' ? substr($fullName, 0, 100) : $candidate,
                $avatarUrl !== '' ? substr($avatarUrl, 0, 255) : null,
            ]);
            $userId = (int) $pdo->lastInsertId();
            $pdo->prepare("INSERT INTO hashira_profiles (user_id, role, coach_verification) VALUES (?, 'athlete', 'none')")
                ->execute([$userId]);
        }

        $link = $pdo->prepare(
            "INSERT INTO hashira_identity_links (provider, provider_user_id, user_id, email_at_link)
             VALUES ('villa', ?, ?, ?)"
        );
        $link->execute([$providerUserId, $userId, $email]);
    }

    $pdo->prepare(
        'UPDATE hashira_users SET last_login_at = NOW(), full_name = CASE WHEN full_name = "" THEN ? ELSE full_name END,
         avatar_url = CASE WHEN (avatar_url IS NULL OR avatar_url = "") AND ? <> "" THEN ? ELSE avatar_url END WHERE id = ?'
    )->execute([$fullName, $avatarUrl, $avatarUrl, $userId]);

    $pdo->commit();
    session_regenerate_id(true);
    $_SESSION['hashira_user_id'] = $userId;
    $_SESSION['hashira_csrf'] = bin2hex(random_bytes(32));
    hashira_redirect('/?account=1' . $next);
} catch (PDOException $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    if ((string) $error->getCode() === '23000') hashira_identity_fail('This connection link was already used. Start again from VILLA.');
    hashira_identity_fail('HASHIRA could not finish connecting the account right now.', 500);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    hashira_identity_fail('HASHIRA could not finish connecting the account right now.', 500);
}
