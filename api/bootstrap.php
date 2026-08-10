<?php
declare(strict_types=1);
require_once __DIR__ . '/../includes/bootstrap.php';

if (!hashira_config_ready() || !$hashiraPdo instanceof PDO) {
    hashira_json([
        'ok' => true,
        'authenticated' => false,
        'backend_ready' => false,
        'login_url' => hashira_app_url('/auth/login.php?next=%23circles'),
        'register_url' => hashira_app_url('/auth/register.php?next=%23circles'),
    ]);
}

$user = hashira_current_user();
if (!$user) {
    hashira_json([
        'ok' => true,
        'authenticated' => false,
        'backend_ready' => true,
        'login_url' => hashira_app_url('/auth/login.php?next=%23circles'),
        'register_url' => hashira_app_url('/auth/register.php?next=%23circles'),
    ]);
}

$pdo = hashira_pdo();
$userId = (int) $user['id'];

$profileStmt = $pdo->prepare(
    'SELECT role, discipline, goal, area, bio, preferred_times, open_to_partners, coach_verification
     FROM hashira_profiles WHERE user_id = ?'
);
$profileStmt->execute([$userId]);
$profile = $profileStmt->fetch() ?: [];

$circleStmt = $pdo->prepare(
    "SELECT c.*,
            u.full_name AS coach_name,
            p.role AS coach_profile_role,
            p.coach_verification,
            mine.role AS my_role,
            mine.status AS my_status,
            (SELECT COUNT(*) FROM hashira_circle_members cm
             WHERE cm.circle_id = c.id AND cm.status = 'active') AS member_count
     FROM hashira_circles c
     JOIN hashira_users u ON u.id = c.creator_id
     LEFT JOIN hashira_profiles p ON p.user_id = c.creator_id
     LEFT JOIN hashira_circle_members mine ON mine.circle_id = c.id AND mine.user_id = ?
     WHERE c.status = 'active'
       AND (c.privacy = 'discoverable' OR mine.status IN ('active','requested'))
     ORDER BY (mine.status = 'active') DESC, c.updated_at DESC, c.id DESC"
);
$circleStmt->execute([$userId]);
$circles = [];
foreach ($circleStmt->fetchAll() as $row) {
    $joined = $row['my_status'] === 'active';
    $requests = [];
    if ($joined && in_array($row['my_role'], ['creator', 'coach'], true)) {
        $requestStmt = $pdo->prepare(
            "SELECT cm.user_id, u.full_name, u.username, p.role
             FROM hashira_circle_members cm
             JOIN hashira_users u ON u.id = cm.user_id
             LEFT JOIN hashira_profiles p ON p.user_id = cm.user_id
             WHERE cm.circle_id = ? AND cm.status = 'requested'
             ORDER BY cm.created_at ASC"
        );
        $requestStmt->execute([(int) $row['id']]);
        foreach ($requestStmt->fetchAll() as $request) {
            $requests[] = [
                'userId' => (string) $request['user_id'],
                'name' => $request['full_name'],
                'username' => $request['username'],
                'role' => $request['role'] ?? 'athlete',
            ];
        }
    }
    $circles[] = [
        'id' => (string) $row['id'],
        'name' => $row['name'],
        'focus' => $row['focus'],
        'area' => $row['area'] !== '' ? $row['area'] : 'Area private',
        'rhythm' => $row['rhythm'] !== '' ? $row['rhythm'] : 'Schedule together',
        'privacy' => $row['privacy'],
        'coach' => $row['coach_name'],
        'coachRole' => in_array($row['coach_profile_role'], ['coach', 'both'], true) ? 'Community coach' : 'Circle leader',
        'coachVerification' => $row['coach_verification'] ?? 'none',
        'color' => $row['color'],
        'members' => (int) $row['member_count'],
        'joined' => $joined,
        'requested' => $row['my_status'] === 'requested',
        'myRole' => $row['my_role'],
        'requests' => $requests,
        'description' => $row['description'],
        'nextMission' => $row['next_mission'],
        'meetingNote' => $joined
            ? 'Exact meeting details belong in the private circle chat.'
            : 'Request or join to unlock private meeting details.',
        'tags' => [$row['focus'], $row['privacy'] === 'private' ? 'Invitation only' : 'Request to join', $row['area'] ?: 'Local'],
    ];
}

$coachStmt = $pdo->query(
    "SELECT u.id, u.full_name, u.avatar_url, p.role, p.area, p.bio, p.discipline, p.coach_verification,
            (SELECT c.id FROM hashira_circles c WHERE c.creator_id = u.id AND c.status = 'active' ORDER BY c.id LIMIT 1) AS circle_id
     FROM hashira_users u
     JOIN hashira_profiles p ON p.user_id = u.id
     WHERE u.status = 'active' AND p.role IN ('coach','both')
     ORDER BY (p.coach_verification = 'verified') DESC, u.full_name ASC
     LIMIT 60"
);
$coaches = [];
$colors = ['lime', 'sky', 'coral'];
foreach ($coachStmt->fetchAll() as $index => $row) {
    $coaches[] = [
        'id' => (string) $row['id'],
        'name' => $row['full_name'],
        'monogram' => mb_strtoupper(mb_substr($row['full_name'], 0, 1)),
        'title' => $row['coach_verification'] === 'verified' ? 'Verified trainer' : 'Community coach',
        'area' => $row['area'] ?: 'Area private',
        'specialties' => [ucfirst((string) $row['discipline']), 'Movement', 'Community'],
        'bio' => $row['bio'] ?: 'This coach has not added an introduction yet.',
        'color' => $colors[$index % count($colors)],
        'verified' => $row['coach_verification'] === 'verified',
        'circleId' => $row['circle_id'] ? (string) $row['circle_id'] : '',
    ];
}

$threadStmt = $pdo->prepare(
    "SELECT c.id, c.name, c.color
     FROM hashira_circles c
     JOIN hashira_circle_members cm ON cm.circle_id = c.id
     WHERE cm.user_id = ? AND cm.status = 'active' AND c.status = 'active'
     ORDER BY c.updated_at DESC, c.id DESC"
);
$threadStmt->execute([$userId]);
$threads = [];
foreach ($threadStmt->fetchAll() as $circle) {
    $messageStmt = $pdo->prepare(
        "SELECT m.id, m.author_id, m.content, m.created_at, u.full_name
         FROM (
           SELECT id, author_id, content, created_at
           FROM hashira_circle_messages
           WHERE circle_id = ? AND deleted_at IS NULL
           ORDER BY id DESC LIMIT 100
         ) m
         JOIN hashira_users u ON u.id = m.author_id
         ORDER BY m.id ASC"
    );
    $messageStmt->execute([(int) $circle['id']]);
    $messages = [];
    foreach ($messageStmt->fetchAll() as $message) {
        $messages[] = [
            'id' => (string) $message['id'],
            'from' => $message['full_name'],
            'own' => (int) $message['author_id'] === $userId,
            'body' => $message['content'],
            'time' => date('M j · g:i A', strtotime($message['created_at'])),
        ];
    }
    $threads[] = [
        'id' => (string) $circle['id'],
        'circleId' => (string) $circle['id'],
        'name' => $circle['name'],
        'color' => $circle['color'],
        'unread' => 0,
        'messages' => $messages,
    ];
}

hashira_json([
    'ok' => true,
    'authenticated' => true,
    'backend_ready' => true,
    'csrf' => hashira_csrf_token(),
    'user' => [
        'id' => $userId,
        'name' => $user['full_name'],
        'username' => $user['username'],
        'avatar_url' => $user['avatar_url'],
    ],
    'profile' => [
        'name' => $user['full_name'],
        'role' => $profile['role'] ?? 'athlete',
        'discipline' => $profile['discipline'] ?? 'calisthenics',
        'goal' => $profile['goal'] ?? '',
        'area' => $profile['area'] ?? '',
        'bio' => $profile['bio'] ?? '',
        'times' => $profile['preferred_times'] ?? '',
        'partners' => (bool) ($profile['open_to_partners'] ?? false),
        'coachVerification' => $profile['coach_verification'] ?? 'none',
    ],
    'store' => [
        'v' => 2,
        'circles' => $circles,
        'coaches' => $coaches,
        'threads' => $threads,
        'activeThreadId' => $threads[0]['id'] ?? '',
    ],
    'logout_url' => hashira_app_url('/auth/logout.php'),
]);
