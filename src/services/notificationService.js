import { messaging, getToken, onMessage } from '../firebase-config';

class NotificationService {
  
  // VAPID key from Firebase Console
  VAPID_KEY = 'BPx..._your_vapid_key_here';

  /**
   * Request notification permission and get FCM token
   */
  async requestPermissionAndGetToken() {
    try {
      console.log('📱 Requesting notification permission...');

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: this.VAPID_KEY
        });

        if (token) {
          console.log('📱 FCM Token:', token);
          return token;
        } else {
          console.log('❌ No registration token available');
          return null;
        }
      } else if (permission === 'denied') {
        console.log('❌ Notification permission denied');
        alert('Please enable notifications in your browser settings');
        return null;
      } else {
        console.log('⚠️ Notification permission dismissed');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to backend
   */
  async saveFcmTokenToBackend(userId, fcmToken) {
    try {
      const response = await fetch('http://localhost:8080/api/notifications/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          fcmToken: fcmToken
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ FCM token saved to backend');
        return true;
      } else {
        console.error('❌ Failed to save token:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving token to backend:', error);
      return false;
    }
  }

  /**
   * Setup foreground message listener
   */
  setupForegroundMessageListener() {
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      
      const notificationTitle = payload.notification?.title || 'Notification';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/logo192.png',
        data: payload.data
      };

      // Show notification even when app is in foreground
      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions);
      }
    });
  }

  /**
   * Remove FCM token on logout
   */
  async removeFcmToken(userId) {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/token/${userId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ FCM token removed');
        return true;
      } else {
        console.error('❌ Failed to remove token');
        return false;
      }
    } catch (error) {
      console.error('❌ Error removing token:', error);
      return false;
    }
  }

  /**
   * Check if browser supports notifications
   */
  isNotificationSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus() {
    if (!this.isNotificationSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

export default new NotificationService();