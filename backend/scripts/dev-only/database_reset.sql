-- Barangay Complaint System: Clean test data while preserving schema and admin accounts
-- Run this against the barangay_complaint_system database.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM otp_verifications;
DELETE FROM notifications;
DELETE FROM complaints;
DELETE FROM appointments;
DELETE FROM announcements;
DELETE FROM verification_notes;
DELETE FROM users WHERE role = 'resident';
DELETE FROM residents;

SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment counters
ALTER TABLE otp_verifications AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE complaints AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE announcements AUTO_INCREMENT = 1;
ALTER TABLE verification_notes AUTO_INCREMENT = 1;
ALTER TABLE residents AUTO_INCREMENT = 1;

-- Preserve admin users, but reset the next available user ID
SET @next_user_id = (SELECT IFNULL(MAX(id), 0) + 1 FROM users);
SET @sql = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @next_user_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @next_admin_id = (SELECT IFNULL(MAX(id), 0) + 1 FROM admins);
SET @sql = CONCAT('ALTER TABLE admins AUTO_INCREMENT = ', @next_admin_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: Uploaded files in backend/uploads must be removed separately.
