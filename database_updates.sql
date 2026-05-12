-- Add missing columns to users table
ALTER TABLE users
ADD COLUMN verification_documents TEXT DEFAULT NULL AFTER address,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER verification_documents,
ADD COLUMN status ENUM('pending','approved','rejected','suspended') DEFAULT 'pending' AFTER email_verified;

-- Create verification_notes table
CREATE TABLE IF NOT EXISTS `verification_notes` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `admin_id`   BIGINT UNSIGNED NOT NULL,
  `action`     ENUM('approved','rejected','suspended','reactivated') NOT NULL,
  `notes`      TEXT            DEFAULT NULL,
  `created_at` TIMESTAMP       NULL DEFAULT NULL,
  `updated_at` TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `verification_notes_user_id_index` (`user_id`),
  KEY `verification_notes_admin_id_index` (`admin_id`),
  CONSTRAINT `verification_notes_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `verification_notes_admin_id_foreign`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reactivation_requests table
CREATE TABLE IF NOT EXISTS `reactivation_requests` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `reason`      TEXT            NOT NULL,
  `status`      ENUM('pending','approved','rejected') DEFAULT 'pending',
  `requested_at` TIMESTAMP      NULL DEFAULT NULL,
  `processed_at` TIMESTAMP      NULL DEFAULT NULL,
  `admin_id`    BIGINT UNSIGNED DEFAULT NULL,
  `notes`       TEXT            DEFAULT NULL,
  `created_at`  TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reactivation_requests_user_id_index` (`user_id`),
  KEY `reactivation_requests_status_index` (`status`),
  CONSTRAINT `reactivation_requests_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reactivation_requests_admin_id_foreign`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;