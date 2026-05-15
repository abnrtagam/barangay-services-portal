const admin = require('firebase-admin');
const db = require('../config/db');
const path = require('path');

// Initialize Firebase Admin
// Note: User must download serviceAccountKey.json from Firebase Console
try {
  const serviceAccount = require('../config/firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('⚠️ Firebase Admin initialization skipped (missing config/firebase-service-account.json)');
}

class NotificationService {
  /**
   * Send a push notification to a specific user
   * @param {number} userId 
   * @param {string} title 
   * @param {string} body 
   * @param {Object} data (optional)
   */
  static async sendNotification(userId, title, body, data = {}) {
    try {
      // 0. Ensure table and column exist (Robustness)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50),
          title VARCHAR(255),
          message TEXT,
          is_read BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      try {
        await db.execute('ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255) DEFAULT NULL');
      } catch (e) {
        // Ignore if column already exists (Error 1060: Duplicate column name)
      }

      // 1. Save to historical notifications table FIRST so the web/mobile app can always see it
      await db.execute(
        'INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
        [userId, data.type || 'system', title, body]
      );

      // 2. Get the user's FCM token from the database for Push Notification
      const [users] = await db.execute('SELECT fcm_token FROM users WHERE id = ?', [userId]);
      const user = users[0];

      if (!user || !user.fcm_token) {
        console.log(`User ${userId} has no FCM token. Notification saved to history only.`);
        return;
      }

      // 3. Construct the message
      const message = {
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        token: user.fcm_token
      };

      // 4. Send via Firebase
      if (admin.apps.length > 0) {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
      } else {
        console.log('Firebase not initialized, skipping push notification.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Save or update the FCM token for a user
   */
  static async updateToken(userId, token) {
    try {
      await db.execute('UPDATE users SET fcm_token = ? WHERE id = ?', [token, userId]);
      return true;
    } catch (error) {
      console.error('Error updating FCM token:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
