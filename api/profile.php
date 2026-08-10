<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

$userId = hashira_require_api_login();
$input = hashira_json_input();
hashira_require_api_csrf($input);
$role = in_array($input['role'] ?? '', ['athlete', 'coach', 'both'], true) ? $input['role'] : 'athlete';
$area = trim((string) ($input['area'] ?? ''));
$bio = trim((string) ($input['bio'] ?? ''));
$times = trim((string) ($input['times'] ?? ''));
$partners = !empty($input['partners']) ? 1 : 0;

if (mb_strlen($area) > 80 || mb_strlen($bio) > 500 || mb_strlen($times) > 160) {
    hashira_json(['ok' => false, 'error' => 'field_too_long'], 422);
}
$pdo = hashira_pdo();
$stmt = $pdo->prepare('SELECT coach_verification FROM hashira_profiles WHERE user_id = ?');
$stmt->execute([$userId]);
$current = $stmt->fetchColumn() ?: 'none';
$verification = in_array($role, ['coach', 'both'], true) && $current === 'none' ? 'self_described' : $current;
$stmt = $pdo->prepare(
    'UPDATE hashira_profiles
     SET role = ?, area = ?, bio = ?, preferred_times = ?, open_to_partners = ?, coach_verification = ?
     WHERE user_id = ?'
);
$stmt->execute([$role, $area, $bio, $times, $partners, $verification, $userId]);
hashira_json(['ok' => true]);
