<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

$userId = hashira_require_api_login();
$input = hashira_json_input();
hashira_require_api_csrf($input);
$action = (string) ($input['action'] ?? '');
$pdo = hashira_pdo();

if ($action === 'create') {
    $name = trim((string) ($input['name'] ?? ''));
    $focus = trim((string) ($input['focus'] ?? 'Hybrid movement'));
    $area = trim((string) ($input['area'] ?? ''));
    $rhythm = trim((string) ($input['rhythm'] ?? ''));
    $privacy = in_array($input['privacy'] ?? '', ['private', 'discoverable'], true) ? $input['privacy'] : 'private';
    if ($name === '' || mb_strlen($name) > 80) hashira_json(['ok' => false, 'error' => 'invalid_circle_name'], 422);
    if (mb_strlen($focus) > 100 || mb_strlen($area) > 80 || mb_strlen($rhythm) > 100) {
        hashira_json(['ok' => false, 'error' => 'field_too_long'], 422);
    }
    $colors = ['lime', 'sky', 'coral'];
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare(
            'INSERT INTO hashira_circles
             (creator_id, name, focus, area, rhythm, privacy, description, color)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $description = 'A ' . mb_strtolower($focus) . ' circle. Welcome your people and choose the first mission.';
        $stmt->execute([$userId, $name, $focus, $area, $rhythm, $privacy, $description, $colors[$userId % 3]]);
        $circleId = (int) $pdo->lastInsertId();
        $stmt = $pdo->prepare(
            "INSERT INTO hashira_circle_members (circle_id, user_id, role, status, joined_at)
             VALUES (?, ?, 'creator', 'active', NOW())"
        );
        $stmt->execute([$circleId, $userId]);
        $stmt = $pdo->prepare(
            "INSERT INTO hashira_circle_messages (circle_id, author_id, message_type, content)
             VALUES (?, ?, 'text', ?)"
        );
        $stmt->execute([$circleId, $userId, 'Welcome to ' . $name . '. Introduce yourself and choose the first mission.']);
        $pdo->commit();
        hashira_json(['ok' => true, 'circle_id' => $circleId], 201);
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        hashira_json(['ok' => false, 'error' => 'circle_create_failed'], 500);
    }
}

if ($action === 'join') {
    $circleId = (int) ($input['circle_id'] ?? 0);
    $stmt = $pdo->prepare("SELECT id, creator_id, privacy, status FROM hashira_circles WHERE id = ? LIMIT 1");
    $stmt->execute([$circleId]);
    $circle = $stmt->fetch();
    if (!$circle || $circle['status'] !== 'active') hashira_json(['ok' => false, 'error' => 'circle_not_found'], 404);
    $status = $circle['privacy'] === 'discoverable' ? 'active' : 'requested';
    $joinedAt = $status === 'active' ? date('Y-m-d H:i:s') : null;
    $stmt = $pdo->prepare(
        "INSERT INTO hashira_circle_members (circle_id, user_id, role, status, joined_at)
         VALUES (?, ?, 'member', ?, ?)
         ON DUPLICATE KEY UPDATE
           status = IF(status = 'blocked', status, VALUES(status)),
           joined_at = IF(status = 'blocked', joined_at, VALUES(joined_at))"
    );
    $stmt->execute([$circleId, $userId, $status, $joinedAt]);
    if ($status === 'requested') {
        $notify = $pdo->prepare(
            "INSERT INTO hashira_notifications (user_id, actor_id, circle_id, type, title, body, link_hash)
             VALUES (?, ?, ?, 'join_request', 'New circle request', 'Someone requested access to your circle.', '#circles')"
        );
        $notify->execute([(int) $circle['creator_id'], $userId, $circleId]);
    }
    hashira_json(['ok' => true, 'status' => $status]);
}

if ($action === 'membership_decision') {
    $circleId = (int) ($input['circle_id'] ?? 0);
    $targetUserId = (int) ($input['user_id'] ?? 0);
    $decision = (string) ($input['decision'] ?? '');
    if (!$circleId || !$targetUserId || !in_array($decision, ['accept', 'decline'], true)) {
        hashira_json(['ok' => false, 'error' => 'invalid_membership_decision'], 422);
    }
    if (!hashira_can_manage_circle($pdo, $circleId, $userId)) {
        hashira_json(['ok' => false, 'error' => 'circle_manager_required'], 403);
    }
    $newStatus = $decision === 'accept' ? 'active' : 'declined';
    $stmt = $pdo->prepare(
        "UPDATE hashira_circle_members
         SET status = ?, joined_at = IF(? = 'active', NOW(), joined_at)
         WHERE circle_id = ? AND user_id = ? AND status = 'requested'"
    );
    $stmt->execute([$newStatus, $newStatus, $circleId, $targetUserId]);
    if (!$stmt->rowCount()) hashira_json(['ok' => false, 'error' => 'request_not_found'], 404);
    $notify = $pdo->prepare(
        "INSERT INTO hashira_notifications (user_id, actor_id, circle_id, type, title, body, link_hash)
         VALUES (?, ?, ?, 'membership_decision', ?, ?, '#circles')"
    );
    $notify->execute([
        $targetUserId,
        $userId,
        $circleId,
        $decision === 'accept' ? 'Circle request accepted' : 'Circle request update',
        $decision === 'accept' ? 'You can now enter the circle and its chat.' : 'The circle could not accept your request right now.',
    ]);
    hashira_json(['ok' => true, 'status' => $newStatus]);
}

hashira_json(['ok' => false, 'error' => 'unknown_action'], 400);
