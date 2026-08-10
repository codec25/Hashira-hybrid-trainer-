<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

$userId = hashira_require_api_login();
$input = hashira_json_input();
hashira_require_api_csrf($input);
$circleId = (int) ($input['circle_id'] ?? 0);
$content = trim((string) ($input['content'] ?? ''));
$messageType = ($input['message_type'] ?? '') === 'mission' ? 'mission' : 'text';

if (!$circleId || $content === '' || mb_strlen($content) > 2000) {
    hashira_json(['ok' => false, 'error' => 'invalid_message'], 422);
}
$pdo = hashira_pdo();
$membership = hashira_circle_membership($pdo, $circleId, $userId);
if (!$membership || $membership['status'] !== 'active') {
    hashira_json(['ok' => false, 'error' => 'circle_membership_required'], 403);
}
$stmt = $pdo->prepare(
    'INSERT INTO hashira_circle_messages (circle_id, author_id, message_type, content) VALUES (?, ?, ?, ?)'
);
$stmt->execute([$circleId, $userId, $messageType, $content]);
$pdo->prepare('UPDATE hashira_circles SET updated_at = NOW() WHERE id = ?')->execute([$circleId]);
hashira_json(['ok' => true, 'message_id' => (int) $pdo->lastInsertId()], 201);
