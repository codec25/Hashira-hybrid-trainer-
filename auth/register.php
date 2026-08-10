<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

if (hashira_current_user()) hashira_redirect('/#circles');

$error = '';
$next = (string) ($_GET['next'] ?? $_POST['next'] ?? '#circles');
if (!preg_match('/^#[a-z]+$/', $next)) $next = '#circles';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fullName = trim((string) ($_POST['full_name'] ?? ''));
    $username = mb_strtolower(trim((string) ($_POST['username'] ?? '')));
    $email = mb_strtolower(trim((string) ($_POST['email'] ?? '')));
    $password = (string) ($_POST['password'] ?? '');
    $confirm = (string) ($_POST['password_confirm'] ?? '');
    $role = in_array($_POST['role'] ?? '', ['athlete', 'coach', 'both'], true) ? $_POST['role'] : 'athlete';

    if (!hashira_config_ready()) {
        $error = 'Hashira accounts are not configured yet.';
    } elseif (!hashira_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please try again.';
    } elseif ($fullName === '' || mb_strlen($fullName) > 100) {
        $error = 'Enter your name.';
    } elseif (!preg_match('/^[a-z0-9][a-z0-9._-]{2,39}$/', $username)) {
        $error = 'Username must be 3–40 characters using letters, numbers, dots, underscores or dashes.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
        $error = 'Enter a valid email address.';
    } elseif (strlen($password) < 10) {
        $error = 'Use at least 10 characters for your password.';
    } elseif ($password !== $confirm) {
        $error = 'The passwords do not match.';
    } else {
        try {
            $pdo = hashira_pdo();
            $stmt = $pdo->prepare('SELECT id FROM hashira_users WHERE username = ? OR email = ? LIMIT 1');
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                $error = 'That username or email is already connected to an account.';
            } else {
                $pdo->beginTransaction();
                $stmt = $pdo->prepare(
                    'INSERT INTO hashira_users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)'
                );
                $stmt->execute([$username, $email, password_hash($password, PASSWORD_DEFAULT), $fullName]);
                $userId = (int) $pdo->lastInsertId();
                $verification = in_array($role, ['coach', 'both'], true) ? 'self_described' : 'none';
                $stmt = $pdo->prepare(
                    'INSERT INTO hashira_profiles (user_id, role, coach_verification) VALUES (?, ?, ?)'
                );
                $stmt->execute([$userId, $role, $verification]);
                $pdo->commit();
                session_regenerate_id(true);
                $_SESSION['hashira_user_id'] = $userId;
                $_SESSION['hashira_csrf'] = bin2hex(random_bytes(32));
                hashira_redirect('/?account=1' . $next);
            }
        } catch (Throwable $exception) {
            if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
            $error = 'Hashira could not create the account right now.';
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
  <title>Create account · Hashira</title>
  <link rel="stylesheet" href="../styles.css?v=20260725-1">
</head>
<body class="hashira-auth-page">
  <main class="hashira-auth-shell hashira-auth-shell--register">
    <a class="hashira-auth-brand" href="<?= hashira_h(hashira_app_url('/')) ?>"><span>羽</span> HASHIRA</a>
    <section class="hashira-auth-visual">
      <span class="community-kicker">FIND YOUR PEOPLE</span>
      <h1>Movement becomes culture when we do it together.</h1>
      <p>Create your movement identity, join a circle, or lead a community around real growth.</p>
      <div class="hashira-auth-orbits" aria-hidden="true"><i>↟</i><i>✦</i><i>⌁</i></div>
    </section>
    <section class="hashira-auth-card">
      <div>
        <span class="community-kicker">NEW ACCOUNT</span>
        <h2>Enter the universe</h2>
        <p>You can train, join circles, or describe yourself as a community coach. Verification remains separate.</p>
      </div>
      <?php if ($error): ?><div class="hashira-auth-alert"><?= hashira_h($error) ?></div><?php endif; ?>
      <form method="post" class="hashira-auth-form">
        <input type="hidden" name="csrf" value="<?= hashira_h(hashira_csrf_token()) ?>">
        <input type="hidden" name="next" value="<?= hashira_h($next) ?>">
        <label>Full name<input name="full_name" autocomplete="name" maxlength="100" required value="<?= hashira_h($_POST['full_name'] ?? '') ?>"></label>
        <label>Username<input name="username" autocomplete="username" maxlength="40" required value="<?= hashira_h($_POST['username'] ?? '') ?>"></label>
        <label>Email<input type="email" name="email" autocomplete="email" maxlength="190" required value="<?= hashira_h($_POST['email'] ?? '') ?>"></label>
        <label>I’m joining as
          <select name="role">
            <option value="athlete">Athlete / learner</option>
            <option value="both">Athlete and community coach</option>
            <option value="coach">Community coach</option>
          </select>
        </label>
        <label>Password<input type="password" name="password" autocomplete="new-password" minlength="10" required></label>
        <label>Confirm password<input type="password" name="password_confirm" autocomplete="new-password" minlength="10" required></label>
        <button type="submit">Create my account</button>
      </form>
      <p class="hashira-auth-switch">Already have an account? <a href="<?= hashira_h(hashira_app_url('/auth/login.php?next=' . urlencode($next))) ?>">Sign in</a></p>
    </section>
  </main>
</body>
</html>
