<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/bootstrap.php';

$status = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $provided = (string) ($_POST['setup_key'] ?? '');
    $expected = (string) ($hashiraConfig['setup_key'] ?? '');
    if (!hashira_config_ready()) {
        $error = 'Create includes/config.php first.';
    } elseif ($expected === '' || str_contains($expected, 'CHANGE_ME') || !hash_equals($expected, $provided)) {
        $error = 'The setup key is incorrect.';
    } elseif (!hashira_verify_csrf($_POST['csrf'] ?? null)) {
        $error = 'The setup session expired. Reload and try again.';
    } else {
        try {
            $sql = file_get_contents(__DIR__ . '/database.sql');
            if ($sql === false) throw new RuntimeException('Schema missing.');
            $statements = preg_split('/;\s*(?:\r?\n|$)/', $sql) ?: [];
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if ($statement !== '') hashira_pdo()->exec($statement);
            }
            $status = 'Hashira account tables are ready.';
        } catch (Throwable $exception) {
            $error = 'The database could not be initialized. Confirm the database exists and the user has CREATE/ALTER permissions.';
        }
    }
}
?>
<!doctype html>
<html lang="en" data-theme="sunlit">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hashira setup</title>
  <link rel="stylesheet" href="<?= hashira_h(hashira_app_url('/styles.css')) ?>">
</head>
<body class="hashira-auth-page">
  <main class="hashira-setup-card">
    <a class="hashira-auth-brand" href="<?= hashira_h(hashira_app_url('/')) ?>"><span>羽</span> HASHIRA</a>
    <span class="community-kicker">ACCOUNT FOUNDATION</span>
    <h1>Connect Hashira’s own database.</h1>
    <ol>
      <li>Create a separate MySQL database and user in Hostinger.</li>
      <li>Copy <code>includes/config.example.php</code> to <code>includes/config.php</code>.</li>
      <li>Enter the new Hashira credentials and a long random setup key.</li>
      <li>Return here and run the schema once.</li>
    </ol>
    <?php if ($status): ?><div class="hashira-auth-success"><?= hashira_h($status) ?></div><?php endif; ?>
    <?php if ($error): ?><div class="hashira-auth-alert"><?= hashira_h($error) ?></div><?php endif; ?>
    <form method="post" class="hashira-auth-form">
      <input type="hidden" name="csrf" value="<?= hashira_h(hashira_csrf_token()) ?>">
      <label>Setup key<input type="password" name="setup_key" required></label>
      <button type="submit">Initialize account tables</button>
    </form>
    <p class="hint">After setup succeeds, remove or rename <code>setup.php</code> on the public server.</p>
  </main>
</body>
</html>
