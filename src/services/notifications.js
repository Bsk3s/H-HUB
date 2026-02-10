// src/services/notifications.js
// Push notification service for Heavenly Hub
// Handles token registration, permission requests, and notification callbacks

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../auth/supabase-client';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Store listener subscriptions so we can clean them up
let notificationReceivedListener = null;
let notificationResponseListener = null;

/**
 * Request notification permissions from the user.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermissions() {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return false;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    }

    console.log('✅ Notification permission granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get the Expo push token for this device.
 * Returns the token string or null if unavailable.
 */
export async function getExpoPushToken() {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ Cannot get push token on simulator/emulator');
      return null;
    }

    // Get project ID from Expo constants
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
      ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.error('❌ No EAS project ID found. Push tokens require an EAS project.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('✅ Got Expo push token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
}

/**
 * Save or update the push token in the database, linked to the current user.
 * Uses upsert on the token value to avoid duplicates.
 */
export async function registerPushToken(userId) {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const token = await getExpoPushToken();
    if (!token) return null;

    // Build device info for analytics
    const deviceInfo = {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platform: Platform.OS,
    };

    // Upsert: if this token already exists, update user_id and device_info
    // This handles the case where a token was registered anonymously and now the user logs in
    const { data, error } = await supabase
      .from('push_tokens')
      .upsert(
        {
          token,
          user_id: userId,
          device_info: deviceInfo,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: 'token',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving push token:', error.message);
      return null;
    }

    console.log('✅ Push token registered for user:', userId);
    return data;
  } catch (error) {
    console.error('❌ Error registering push token:', error);
    return null;
  }
}

/**
 * Unlink the push token from the current user on logout.
 * We keep the token in the DB but set user_id to null,
 * so it can be re-linked on next login.
 */
export async function unlinkPushToken() {
  try {
    const token = await getExpoPushToken();
    if (!token) return;

    const { error } = await supabase
      .from('push_tokens')
      .update({ user_id: null })
      .eq('token', token);

    if (error) {
      console.error('❌ Error unlinking push token:', error.message);
    } else {
      console.log('✅ Push token unlinked from user');
    }
  } catch (error) {
    console.error('❌ Error unlinking push token:', error);
  }
}

/**
 * Record that a notification was opened by the user.
 * Updates last_notification_opened_at in the push_tokens table.
 */
async function recordNotificationOpened(notificationData) {
  try {
    const token = await getExpoPushToken();
    if (!token) return;

    const { error } = await supabase
      .from('push_tokens')
      .update({
        last_notification_opened_at: new Date().toISOString(),
      })
      .eq('token', token);

    if (error) {
      console.error('❌ Error recording notification open:', error.message);
    } else {
      console.log('✅ Notification open recorded');
    }
  } catch (error) {
    console.error('❌ Error recording notification open:', error);
  }
}

/**
 * Set up listeners for incoming notifications and user interactions.
 * Call this once when the app starts.
 */
export function setupNotificationListeners(onNotificationReceived, onNotificationOpened) {
  // Clean up any existing listeners first
  removeNotificationListeners();

  // Fired when a notification is received while the app is in the foreground
  notificationReceivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received in foreground:', notification.request.content.title);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // Fired when a user taps on a notification
  notificationResponseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const notificationData = response.notification.request.content.data;
      console.log('👆 Notification tapped:', response.notification.request.content.title);

      // Record the open in the database
      recordNotificationOpened(notificationData);

      if (onNotificationOpened) {
        onNotificationOpened(response);
      }
    }
  );

  console.log('✅ Notification listeners set up');
}

/**
 * Remove notification listeners. Call on cleanup.
 */
export function removeNotificationListeners() {
  if (notificationReceivedListener) {
    Notifications.removeNotificationSubscription(notificationReceivedListener);
    notificationReceivedListener = null;
  }
  if (notificationResponseListener) {
    Notifications.removeNotificationSubscription(notificationResponseListener);
    notificationResponseListener = null;
  }
}

/**
 * Get the current notification permission status.
 */
export async function getNotificationPermissionStatus() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('❌ Error checking notification permission:', error);
    return 'undetermined';
  }
}

/**
 * Schedule a local notification (useful for streak reminders, etc.)
 */
export async function scheduleLocalNotification({ title, body, data = {}, triggerSeconds = 1 }) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        seconds: triggerSeconds,
      },
    });
    console.log('✅ Local notification scheduled:', id);
    return id;
  } catch (error) {
    console.error('❌ Error scheduling local notification:', error);
    return null;
  }
}
