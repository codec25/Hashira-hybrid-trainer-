<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

if (hashira_current_user()) hashira_redirect('/#circles');

$error = '';
$next = (string) ($_GET['next'] ?? $_POST['next'] ?? '#circles');
if (!preg_match('/^#[a-z]+$/', $next)) $next = '#circles';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login = mb_strtolower(trim((string) ($_POST['login'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');
    $attempts = (array) ($_SESSION['hashira_login_attempts'] ?? []);
    $cutoff = time() - 900;
    $attempts = array_values(array_filter($attempts, fn($time) => (int) $time >= $cutoff));

    if (!hashira_config_ready()) {
        $error = 'Hashira accounts are not configured yet.';
    } elseif (!hashira_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please try again.';
    } elseif (count($attempts) >= 8) {
        $error = 'Too many attempts. Wait 15 minutes before trying again.';
    } elseif ($login === '' || $password === '') {
        $error = 'Enter your email or username and password.';
    } else {
        try {
            $pdo = hashira_pdo();
            $stmt = $pdo->prepare(
                "SELECT id, username, password_hash, status
                 FROM hashira_users WHERE email = ? OR username = ? LIMIT 1"
            );
            $stmt->execute([$login, $login]);
            $user = $stmt->fetch();
            if ($user && $user['status'] === 'active' && password_verify($password, $user['password_hash'])) {
                session_regenerate_id(true);
                $_SESSION['hashira_user_id'] = (int) $user['id'];
                $_SESSION['hashira_csrf'] = bin2hex(random_bytes(32));
                $_SESSION['hashira_login_attempts'] = [];
                $pdo->prepare('UPDATE hashira_users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
                hashira_redirect('/?account=1' . $next);
            }
            $attempts[] = time();
            $_SESSION['hashira_login_attempts'] = $attempts;
            $error = 'The email/username or password is incorrect.';
        } catch (Throwable $exception) {
            $error = 'Hashira could not sign you in right now.';
        }
    }
}
?>
<!doctype html>
<html lang="en" data-theme="sunlit">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f1ead9">
  <title>Sign in · Hashira</title>
  <link rel="stylesheet" href="../styles.css?v=identity1">
</head>
<body class="hashira-auth-page">
  <main class="hashira-auth-shell">
    <a class="hashira-auth-brand" href="<?= hashira_h(hashira_app_url('/')) ?>"><span>羽</span> HASHIRA</a>
    <section class="hashira-auth-visual">
      <span class="community-kicker">WELCOME BACK</span>
      <h1>Your circle kept moving.</h1>
      <p>Return to your missions, your people, and the version of you being built through consistency.</p>
      <div class="hashira-auth-orbits" aria-hidden="true"><i>M</i><i>A</i><i>K</i></div>
    </section>
    <section class="hashira-auth-card">
      <div>
        <span class="community-kicker">ACCOUNT</span>
        <h2>Sign in to Hashira</h2>
        <p>Solo training stays available without an account. Circles and real chat need one.</p>
      </div>
      <?php if ($error): ?><div class="hashira-auth-alert"><?= hashira_h($error) ?></div><?php endif; ?>
      <a class="hashira-identity-button" href="/social_planning/auth/hashira-connect.php?return=<?= rawurlencode($next) ?>"><span class="hashira-identity-mark">V</span><span><strong>Continue with VILLA</strong><small>Use your connected JOVIGROOVE identity</small></span><b>→</b></a>
      <div class="hashira-auth-divider"><span>or use a HASHIRA account</span></div>
      <form method="post" class="hashira-auth-form">
        <input type="hidden" name="csrf" value="<?= hashira_h(hashira_csrf_token()) ?>">
        <input type="hidden" name="next" value="<?= hashira_h($next) ?>">
        <label>Email or username<input name="login" autocomplete="username" required value="<?= hashira_h($_POST['login'] ?? '') ?>"></label>
        <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
        <button type="submit">Enter Hashira</button>
      </form>
      <p class="hashira-auth-switch">New here? <a href="<?= hashira_h(hashira_app_url('/auth/register.php?next=' . urlencode($next))) ?>">Create an account</a></p>
      <a class="hashira-auth-guest" href="<?= hashira_h(hashira_app_url('/#home')) ?>">Continue with solo training</a>
    </section>
  </main>
</body>
</html>
