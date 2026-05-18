-- ============================================================
-- BARANGAY COMPLAINT & APPOINTMENT SYSTEM
-- MySQL Schema — Import directly in XAMPP phpMyAdmin
-- ============================================================

SET SQL_MODE   = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone  = "+08:00";
SET NAMES utf8mb4;

-- ── Create & use database ───────────────────────────────────
CREATE DATABASE IF NOT EXISTS `barangay_complaint_system`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `barangay_complaint_system`;

-- ── 1. users ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name`     VARCHAR(100)    NOT NULL,
  `last_name`      VARCHAR(100)    NOT NULL,
  `email`          VARCHAR(191)    NOT NULL,
  `phone`          VARCHAR(20)     DEFAULT NULL,
  `address`        TEXT            DEFAULT NULL,
  `password`       VARCHAR(255)    NOT NULL,
  `role`           ENUM('resident','admin') NOT NULL DEFAULT 'resident',
  `remember_token` VARCHAR(100)    DEFAULT NULL,
  `created_at`     TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. residents ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `residents` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP       NULL DEFAULT NULL,
  `updated_at` TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `residents_user_id_index` (`user_id`),
  CONSTRAINT `residents_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. admins ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admins` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP       NULL DEFAULT NULL,
  `updated_at` TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admins_user_id_index` (`user_id`),
  CONSTRAINT `admins_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. complaint_categories ──────────────────────────────────
CREATE TABLE IF NOT EXISTS `complaint_categories` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)    NOT NULL,
  `description` TEXT            DEFAULT NULL,
  `created_at`  TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`  TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `complaint_categories_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. complaints ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `complaints` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resident_id`     BIGINT UNSIGNED NOT NULL,
  `category_id`     BIGINT UNSIGNED NOT NULL,
  `subject`         VARCHAR(200)    NOT NULL,
  `details`         TEXT            NOT NULL,
  `attachment_path` VARCHAR(500)    DEFAULT NULL,
  `status`          ENUM('Pending','Approved','Scheduled','Resolved','Rejected')
                    NOT NULL DEFAULT 'Pending',
  `admin_remarks`   TEXT            DEFAULT NULL,
  `created_at`      TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`      TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `complaints_resident_id_index` (`resident_id`),
  KEY `complaints_status_index`      (`status`),
  KEY `complaints_created_at_index`  (`created_at`),
  CONSTRAINT `complaints_resident_id_foreign`
    FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `complaints_category_id_foreign`
    FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. appointments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `appointments` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resident_id`      BIGINT UNSIGNED NOT NULL,
  `appointment_date` DATE            NOT NULL,
  `time_slot`        VARCHAR(20)     NOT NULL,
  `purpose`          VARCHAR(300)    NOT NULL,
  `notes`            TEXT            DEFAULT NULL,
  `status`           ENUM('Pending','Approved','Completed','Cancelled','Rejected')
                     NOT NULL DEFAULT 'Pending',
  `admin_remarks`    TEXT            DEFAULT NULL,
  `created_at`       TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`       TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_resident_id_index`      (`resident_id`),
  KEY `appointments_appointment_date_index` (`appointment_date`),
  KEY `appointments_status_index`           (`status`),
  CONSTRAINT `appointments_resident_id_foreign`
    FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. announcements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `announcements` (
  `id`         BIGINT UNSIGNED                    NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(200)                       NOT NULL,
  `content`    TEXT                               NOT NULL,
  `priority`   ENUM('Normal','Medium','High')     NOT NULL DEFAULT 'Normal',
  `created_by` BIGINT UNSIGNED                    NOT NULL,
  `created_at` TIMESTAMP                          NULL DEFAULT NULL,
  `updated_at` TIMESTAMP                          NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_created_at_index` (`created_at`),
  KEY `announcements_priority_index`   (`priority`),
  CONSTRAINT `announcements_created_by_foreign`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 8. notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `type`           VARCHAR(50)     NOT NULL,
  `title`          VARCHAR(200)    NOT NULL,
  `message`        TEXT            NOT NULL,
  `reference_id`   BIGINT UNSIGNED DEFAULT NULL,
  `reference_type` VARCHAR(50)     DEFAULT NULL,
  `is_read`        TINYINT(1)      NOT NULL DEFAULT 0,
  `created_at`     TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_index` (`user_id`),
  KEY `notifications_is_read_index` (`is_read`),
  CONSTRAINT `notifications_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Laravel Sanctum personal_access_tokens ───────────────────
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255)    NOT NULL,
  `tokenable_id`   BIGINT UNSIGNED NOT NULL,
  `name`           VARCHAR(255)    NOT NULL,
  `token`          VARCHAR(64)     NOT NULL,
  `abilities`      TEXT            DEFAULT NULL,
  `last_used_at`   TIMESTAMP       NULL DEFAULT NULL,
  `expires_at`     TIMESTAMP       NULL DEFAULT NULL,
  `created_at`     TIMESTAMP       NULL DEFAULT NULL,
  `updated_at`     TIMESTAMP       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Complaint Categories
INSERT INTO `complaint_categories` (`name`, `description`, `created_at`, `updated_at`) VALUES
('Noise Complaint',         'Excessive noise from neighbors, events, or establishments.',          NOW(), NOW()),
('Garbage / Sanitation',    'Improper garbage disposal, clogged drainage, sanitation issues.',     NOW(), NOW()),
('Illegal Construction',    'Unauthorized building or construction activities.',                   NOW(), NOW()),
('Public Safety',           'Threats to public safety, accidents, or hazardous conditions.',       NOW(), NOW()),
('Street / Road Issues',    'Potholes, broken streetlights, or road surface damage.',             NOW(), NOW()),
('Flooding',                'Flooding in residential or public areas.',                           NOW(), NOW()),
('Animal Nuisance',         'Stray animals, animal cruelty, or other animal-related issues.',     NOW(), NOW()),
('Business / Vendor Issue', 'Unlicensed businesses, vendor disputes, market issues.',             NOW(), NOW()),
('Domestic Dispute',        'Family or neighbor disputes requiring barangay mediation.',          NOW(), NOW()),
('Others',                  'Other complaints not covered by the listed categories.',             NOW(), NOW());

-- Admin user  (password: admin1234)
INSERT INTO `users` (`first_name`, `last_name`, `email`, `phone`, `address`, `password`, `role`, `created_at`, `updated_at`) VALUES
('Barangay', 'Admin', 'admin@bulua.gov.ph', '09000000000', 'Barangay Hall',
 '$2y$12$8RNKbVlJYnBUZ1hzZpMpOeCkqJcODpzEcSPOhG5UcJJvF/yDcZx8y',
 'admin', NOW(), NOW());

-- Link admin record
INSERT INTO `admins` (`user_id`, `created_at`, `updated_at`)
SELECT `id`, NOW(), NOW() FROM `users` WHERE `email` = 'admin@bulua.gov.ph';

-- Sample announcements
INSERT INTO `announcements` (`title`, `content`, `priority`, `created_by`, `created_at`, `updated_at`)
SELECT
  'Welcome to the Barangay Online Portal',
  'We are pleased to launch our new online complaint and appointment booking system. Residents can now file complaints and schedule visits to the barangay hall from the comfort of their homes.',
  'High',
  id, NOW(), NOW()
FROM `users` WHERE `email` = 'admin@bulua.gov.ph';

INSERT INTO `announcements` (`title`, `content`, `priority`, `created_by`, `created_at`, `updated_at`)
SELECT
  'Office Hours Reminder',
  'The barangay hall is open Monday to Friday, 8:00 AM to 5:00 PM. Walk-in appointments are available, but we encourage residents to book online for faster service. The office is closed on weekends and public holidays.',
  'Normal',
  id, NOW(), NOW()
FROM `users` WHERE `email` = 'admin@bulua.gov.ph';

-- ============================================================
-- DONE — Admin credentials:
--   Email:    admin@bulua.gov.ph
--   Password: admin1234
-- ============================================================
