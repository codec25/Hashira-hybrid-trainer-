SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS hashira_users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(40) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  status ENUM('active','frozen','deleted') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hashira_users_username (username),
  UNIQUE KEY uq_hashira_users_email (email),
  INDEX idx_hashira_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hashira_profiles (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  role ENUM('athlete','coach','both') NOT NULL DEFAULT 'athlete',
  discipline VARCHAR(50) NOT NULL DEFAULT 'calisthenics',
  goal VARCHAR(240) NOT NULL DEFAULT '',
  area VARCHAR(80) NOT NULL DEFAULT '',
  bio VARCHAR(500) NOT NULL DEFAULT '',
  preferred_times VARCHAR(160) NOT NULL DEFAULT '',
  open_to_partners TINYINT(1) NOT NULL DEFAULT 0,
  coach_verification ENUM('none','self_described','pending','verified','declined') NOT NULL DEFAULT 'none',
  credentials_note VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hashira_profiles_user FOREIGN KEY (user_id) REFERENCES hashira_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hashira_circles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  creator_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  focus VARCHAR(100) NOT NULL DEFAULT 'Hybrid movement',
  area VARCHAR(80) NOT NULL DEFAULT '',
  rhythm VARCHAR(100) NOT NULL DEFAULT '',
  privacy ENUM('private','discoverable') NOT NULL DEFAULT 'private',
  description VARCHAR(500) NOT NULL DEFAULT '',
  next_mission VARCHAR(180) NOT NULL DEFAULT 'Choose the first mission',
  color ENUM('lime','sky','coral') NOT NULL DEFAULT 'lime',
  status ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_hashira_circles_creator (creator_id),
  INDEX idx_hashira_circles_discovery (status, privacy, area),
  CONSTRAINT fk_hashira_circles_creator FOREIGN KEY (creator_id) REFERENCES hashira_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hashira_circle_members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  circle_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('creator','coach','member') NOT NULL DEFAULT 'member',
  status ENUM('requested','active','declined','blocked','left') NOT NULL DEFAULT 'requested',
  joined_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hashira_circle_member (circle_id, user_id),
  INDEX idx_hashira_members_user_status (user_id, status),
  INDEX idx_hashira_members_circle_status (circle_id, status),
  CONSTRAINT fk_hashira_members_circle FOREIGN KEY (circle_id) REFERENCES hashira_circles(id) ON DELETE CASCADE,
  CONSTRAINT fk_hashira_members_user FOREIGN KEY (user_id) REFERENCES hashira_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hashira_circle_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  circle_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  message_type ENUM('text','mission') NOT NULL DEFAULT 'text',
  content VARCHAR(2000) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  deleted_at DATETIME NULL,
  INDEX idx_hashira_messages_circle_id (circle_id, id),
  INDEX idx_hashira_messages_author (author_id),
  CONSTRAINT fk_hashira_messages_circle FOREIGN KEY (circle_id) REFERENCES hashira_circles(id) ON DELETE CASCADE,
  CONSTRAINT fk_hashira_messages_author FOREIGN KEY (author_id) REFERENCES hashira_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hashira_notifications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  actor_id BIGINT UNSIGNED NULL,
  circle_id BIGINT UNSIGNED NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(255) NOT NULL DEFAULT '',
  link_hash VARCHAR(80) NOT NULL DEFAULT '#home',
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hashira_notifications_user (user_id, read_at, id),
  CONSTRAINT fk_hashira_notifications_user FOREIGN KEY (user_id) REFERENCES hashira_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_hashira_notifications_actor FOREIGN KEY (actor_id) REFERENCES hashira_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_hashira_notifications_circle FOREIGN KEY (circle_id) REFERENCES hashira_circles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
