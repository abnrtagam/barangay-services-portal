const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const uploadsDir = path.join(__dirname, 'uploads');

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
    [process.env.DB_NAME || 'barangay_complaint_system', tableName]
  );
  return rows[0].count > 0;
}

async function resetAutoIncrement(connection, tableName) {
  const [rows] = await connection.query(`SELECT IFNULL(MAX(id), 0) + 1 AS nextId FROM ??`, [tableName]);
  const nextId = rows[0].nextId || 1;
  const escapedTable = connection.escapeId(tableName);
  await connection.query(`ALTER TABLE ${escapedTable} AUTO_INCREMENT = ${nextId}`);
}

async function clearUploads() {
  try {
    const entries = await fs.promises.readdir(uploadsDir, { withFileTypes: true });
    for (const entry of entries) {
      const targetPath = path.join(uploadsDir, entry.name);
      if (entry.isFile()) {
        await fs.promises.unlink(targetPath);
      } else if (entry.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
      }
    }
    console.log('Uploads directory cleaned:', uploadsDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('⚠ Uploads directory does not exist:', uploadsDir);
      return;
    }
    throw err;
  }
}

async function runCleanup() {
  const connection = await db.getConnection();
  try {
    console.log('Starting database cleanup...');
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Delete all temporary and test data while preserving admin users
    await connection.query('DELETE FROM otp_verifications');
    await connection.query('DELETE FROM notifications');
    await connection.query('DELETE FROM complaints');
    await connection.query('DELETE FROM appointments');
    await connection.query('DELETE FROM announcements');

    if (await tableExists(connection, 'verification_notes')) {
      await connection.query('DELETE FROM verification_notes');
    }

    if (await tableExists(connection, 'reactivation_requests')) {
      await connection.query('DELETE FROM reactivation_requests');
    }

    await connection.query('DELETE FROM users WHERE role = ?', ['resident']);
    await connection.query('DELETE FROM residents');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();

    console.log('Database rows cleaned successfully. Resetting AUTO_INCREMENT values...');

    await resetAutoIncrement(connection, 'otp_verifications');
    await resetAutoIncrement(connection, 'notifications');
    await resetAutoIncrement(connection, 'complaints');
    await resetAutoIncrement(connection, 'appointments');
    await resetAutoIncrement(connection, 'announcements');
    if (await tableExists(connection, 'verification_notes')) {
      await resetAutoIncrement(connection, 'verification_notes');
    }
    if (await tableExists(connection, 'reactivation_requests')) {
      await resetAutoIncrement(connection, 'reactivation_requests');
    }
    await resetAutoIncrement(connection, 'residents');
    await resetAutoIncrement(connection, 'users');
    if (await tableExists(connection, 'admins')) {
      await resetAutoIncrement(connection, 'admins');
    }

    console.log('AUTO_INCREMENT values reset.');
    await clearUploads();
    console.log('Database and uploads reset complete.');
  } catch (err) {
    await connection.rollback();
    console.error('Cleanup failed. Rolled back changes.');
    console.error(err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runCleanup();
