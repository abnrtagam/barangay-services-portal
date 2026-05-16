-- ============================================================
-- BARANGAY BULUA SYSTEM — Post-Setup Migration
-- ============================================================
-- Run this AFTER importing the base schema (database/barangay_complaint_system.sql).
-- This script adds all columns, tables, and indexes introduced
-- during Phases 5–7 of development.
--
-- Usage:  mysql -u root barangay_complaint_system < docs/migration.sql
-- Or:    Paste into phpMyAdmin > SQL tab
-- ============================================================

USE `barangay_complaint_system`;

-- ── 1. User table extensions (registration flow) ────────────
ALTER TABLE `users` ADD COLUMN `dob`                     DATE          DEFAULT NULL AFTER `last_name`;
ALTER TABLE `users` ADD COLUMN `gov_id_type`             VARCHAR(50)   DEFAULT NULL AFTER `dob`;
ALTER TABLE `users` ADD COLUMN `gov_id_number`           VARCHAR(50)   DEFAULT NULL AFTER `gov_id_type`;
ALTER TABLE `users` ADD COLUMN `status`                  ENUM('pending','approved','rejected','suspended') DEFAULT 'pending' AFTER `role`;
ALTER TABLE `users` ADD COLUMN `email_verified`          BOOLEAN       DEFAULT FALSE AFTER `status`;
ALTER TABLE `users` ADD COLUMN `verification_documents`  TEXT          DEFAULT NULL AFTER `email_verified`;
ALTER TABLE `users` ADD COLUMN `zone`                    VARCHAR(50)   DEFAULT NULL AFTER `address`;

-- Backfill any NULL created_at values
UPDATE `users` SET `created_at` = NOW() WHERE `created_at` IS NULL OR `created_at` = '0000-00-00 00:00:00';

-- ── 2. Complaint / Appointment timestamp backfill ───────────
-- (Only needed if created_at was added after data already existed)
ALTER TABLE `complaints`   ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `status`;
ALTER TABLE `appointments` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `status`;
UPDATE `complaints`   SET `created_at` = NOW() WHERE `created_at` IS NULL OR `created_at` = '0000-00-00 00:00:00';
UPDATE `appointments` SET `created_at` = NOW() WHERE `created_at` IS NULL OR `created_at` = '0000-00-00 00:00:00';

-- ── 3. Authentication support tables ────────────────────────
CREATE TABLE IF NOT EXISTS `registration_attempts` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `ip_address`    VARCHAR(45) NOT NULL,
  `email`         VARCHAR(255),
  `attempt_count` INT DEFAULT 1,
  `last_attempt`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `blocked_until` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `email`      VARCHAR(255) NOT NULL,
  `otp_code`   VARCHAR(10)  NOT NULL,
  `verified`   BOOLEAN      DEFAULT FALSE,
  `expires_at` TIMESTAMP    NOT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `email`      VARCHAR(255) NOT NULL,
  `token`      VARCHAR(255) NOT NULL,
  `otp_code`   VARCHAR(10)  NOT NULL,
  `used`       BOOLEAN      DEFAULT FALSE,
  `expires_at` TIMESTAMP    NOT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `email`         VARCHAR(255) NOT NULL,
  `ip_address`    VARCHAR(45)  NOT NULL,
  `attempt_count` INT          DEFAULT 1,
  `last_attempt`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `blocked_until` TIMESTAMP    NULL DEFAULT NULL,
  INDEX(`email`, `ip_address`)
) ENGINE=InnoDB;

-- ── 4. Status history tracking tables ───────────────────────
CREATE TABLE IF NOT EXISTS `complaint_status_history` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` BIGINT UNSIGNED NOT NULL,
  `old_status`   VARCHAR(50),
  `new_status`   VARCHAR(50) NOT NULL,
  `changed_by`   BIGINT UNSIGNED,
  `notes`        TEXT,
  `changed_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(`complaint_id`),
  CONSTRAINT `fk_csh_complaint` FOREIGN KEY (`complaint_id`)
    REFERENCES `complaints`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `appointment_status_history` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` BIGINT UNSIGNED NOT NULL,
  `old_status`     VARCHAR(50),
  `new_status`     VARCHAR(50) NOT NULL,
  `changed_by`     BIGINT UNSIGNED,
  `notes`          TEXT,
  `changed_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(`appointment_id`),
  CONSTRAINT `fk_ash_appointment` FOREIGN KEY (`appointment_id`)
    REFERENCES `appointments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 5. Verification system ──────────────────────────────────
CREATE TABLE IF NOT EXISTS `verification_notes` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `admin_id`   BIGINT UNSIGNED,
  `note`       TEXT NOT NULL,
  `action`     VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(`user_id`),
  CONSTRAINT `fk_vn_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 6. FCM device tokens ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `fcm_tokens` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `token`      TEXT NOT NULL,
  `device`     VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(`user_id`),
  CONSTRAINT `fk_fcm_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 7. Performance indexes ──────────────────────────────────
-- These are safe to run multiple times (will error silently if they exist)
CREATE INDEX `idx_users_zone`              ON `users`(`zone`);
CREATE INDEX `idx_complaints_resident`     ON `complaints`(`resident_id`);
CREATE INDEX `idx_complaints_status`       ON `complaints`(`status`);
CREATE INDEX `idx_appointments_resident`   ON `appointments`(`resident_id`);
CREATE INDEX `idx_appointments_date`       ON `appointments`(`appointment_date`);

-- ── 8. Admin activity audit log ─────────────────────────────
CREATE TABLE IF NOT EXISTS `admin_activity_log` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id`    BIGINT UNSIGNED NOT NULL,
  `action_type` VARCHAR(50)  NOT NULL,
  `target_type` VARCHAR(50)  NOT NULL,
  `target_id`   BIGINT UNSIGNED DEFAULT NULL,
  `description` TEXT NOT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(`admin_id`),
  INDEX(`action_type`),
  INDEX(`created_at`)
) ENGINE=InnoDB;

-- ── 9. Approve the seeded admin account ─────────────────────
UPDATE `users` SET `status` = 'approved', `email_verified` = TRUE
WHERE `email` = 'admin@barangay.gov.ph' AND `role` = 'admin';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
