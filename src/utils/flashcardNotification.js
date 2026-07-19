import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { storage } from '../apiServices/userDashboardApiService';
import { API_URL } from '../config.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ─────────────────────────────────────────────
// SHARED: save token to your backend
// ─────────────────────────────────────────────
async function saveTokenToBackend(fcmToken, platform = 'web') {
  const token = storage.get('token');
  if (!token) return;

  await fetch(`${API_URL}/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'token': token,
    },
    body: JSON.stringify({ fcmToken, platform }),
  });

  storage.set('fcm_registered', 'true');
  console.log(`FCM token saved to server ✅ [${platform}]`);
}

// ─────────────────────────────────────────────
// Navigation bridge
// ─────────────────────────────────────────────
let _navigateFn = null;
export function setNavigate(fn) {
  _navigateFn = fn;
}

// ─────────────────────────────────────────────
// ✅ SINGLE notification-tap listener — registered once at app boot.
// ─────────────────────────────────────────────
let _tapListenerRegistered = false;

export function registerNotificationTapListener() {
  if (!Capacitor.isNativePlatform()) return;
  if (_tapListenerRegistered) return;
  _tapListenerRegistered = true;

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const url = action.notification.data?.url || '/splash';
    console.log('🔔 Notification tapped → target url:', url);

    if (_navigateFn) {
      console.log('🔔 App running — navigating via router to', url);
      storage.remove('notification_url');
      _navigateFn(url, { replace: true });
    } else {
      console.log('🔔 App not running yet — storing url for cold-start pickup');
      storage.set('notification_url', url);
    }
  });
}

// ─────────────────────────────────────────────
// ✅ Cold-start check
// ─────────────────────────────────────────────
export async function checkLaunchNotification(timeoutMs = 400) {
  if (!Capacitor.isNativePlatform()) return null;

  return new Promise((resolve) => {
    const existing = storage.get('notification_url');
    if (existing) {
      resolve(existing);
      return;
    }

    setTimeout(() => {
      resolve(storage.get('notification_url') || null);
    }, timeoutMs);
  });
}

// ─────────────────────────────────────────────
// ✅ Register native push LISTENERS on every app start —
// independent of whether the FCM token was already sent to backend.
// ─────────────────────────────────────────────
let _listenersInitialized = false;

export async function initNativePushListeners() {
  if (!Capacitor.isNativePlatform()) return;
  if (_listenersInitialized) {
    console.log('🔔 Push listeners already initialized, skipping');
    return;
  }
  _listenersInitialized = true;

  console.log('🔔 initNativePushListeners() called');

  let permStatus = await PushNotifications.checkPermissions();
  console.log('🔔 Permission status:', JSON.stringify(permStatus));

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') {
    console.warn('🔔 Native push permission denied');
    return;
  }

  if (Capacitor.getPlatform() === 'android') {
    try {
      await PushNotifications.deleteChannel({ id: 'flashcard_channel' });
    } catch (err) {
      console.log('🔔 No existing channel to delete (expected on first run)');
    }

    await PushNotifications.createChannel({
      id: 'flashcard_channel',
      name: 'Daily Flashcards',
      description: 'Daily flashcard reminders',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
      lights: true,
    });

    console.log('🔔 Notification channel recreated ✅');
  }

  // ─────────────────────────────────────────────
  // ✅ FIX: Register ALL listeners BEFORE calling register()
  // so no notification event is missed during initialization
  // ─────────────────────────────────────────────

  PushNotifications.addListener('registration', async (token) => {
    console.log('🔔 Native FCM token:', token.value);
    if (storage.get('fcm_registered') !== 'true') {
      await saveTokenToBackend(token.value, Capacitor.getPlatform());
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('🔔 Native FCM registration error:', err);
  });

  // ✅ Foreground message — re-schedule as a LOCAL system notification
  // so the OS shows a real heads-up popup even while the app is open.
  PushNotifications.addListener('pushNotificationReceived', async (notification) => {
    console.log('🔔 Foreground push received:', JSON.stringify(notification));

    const title = notification.title
      || notification.data?.title
      || notification.data?.['gcm.notification.title']
      || 'Notification';

    const body = notification.body
      || notification.data?.body
      || notification.data?.['gcm.notification.body']
      || '';

    const tapUrl = notification.data?.url || null;

    await showSystemNotification(title, body, tapUrl);
  });

  console.log('🔔 All push listeners registered ✅ — now calling register()');

  // ✅ FIX: Call register() AFTER listeners are attached
  await PushNotifications.register();

  console.log('🔔 PushNotifications.register() called ✅');
}

// ─────────────────────────────────────────────
// WEB: PWA / browser
// ─────────────────────────────────────────────
async function initWebPush(firebaseSWReg = null) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') return;
  }
  if (Notification.permission !== 'granted') return;

  const messaging = getMessaging(app);
  const swRegistration = firebaseSWReg || await navigator.serviceWorker.ready;

  const fcmToken = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  });

  if (!fcmToken) {
    console.warn('No FCM token received.');
    return;
  }

  await saveTokenToBackend(fcmToken, 'web');
}

// ─────────────────────────────────────────────
// ✅ Show a real OS system notification via LocalNotifications
// This fires a heads-up popup even when the app is in foreground.
// ─────────────────────────────────────────────

// Store url keyed by notification id so tap listener can navigate
const _localNotifUrlMap = {};
let _localNotifListenerRegistered = false;

async function showSystemNotification(title, body, tapUrl) {
  try {
    // Request local notification permission if not already granted
    const permResult = await LocalNotifications.requestPermissions();
    if (permResult.display !== 'granted') {
      console.warn('🔔 LocalNotifications permission not granted');
      return;
    }

    const notifId = Math.floor(Math.random() * 2147483647); // safe 32-bit int

    // Store the url so tap listener can navigate to it
    if (tapUrl) {
      _localNotifUrlMap[notifId] = tapUrl;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: title,
          body: body,
          channelId: 'flashcard_channel', // must match the channel created in initNativePushListeners
          smallIcon: 'ic_stat_icon_config_sample', // use your app's notification icon name
          iconColor: '#000000',
          sound: 'default',
          actionTypeId: '',
          extra: { url: tapUrl || '/splash' },
        },
      ],
    });

    console.log('🔔 System notification scheduled ✅', { notifId, title, body });

    // Register the local notification tap listener once
    if (!_localNotifListenerRegistered) {
      _localNotifListenerRegistered = true;

      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const url = action.notification.extra?.url
          || _localNotifUrlMap[action.notification.id]
          || '/splash';

        console.log('🔔 Local notification tapped → navigating to:', url);

        // Clean up stored url
        delete _localNotifUrlMap[action.notification.id];

        if (_navigateFn) {
          _navigateFn(url, { replace: true });
        } else {
          storage.set('notification_url', url);
        }
      });
    }
  } catch (err) {
    console.error('🔔 Failed to show system notification:', err);
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT: registers FCM token with backend (web + native)
// ─────────────────────────────────────────────
export async function initPushNotifications(firebaseSWReg = null) {
  if (storage.get('fcm_registered') === 'true') return;
  if (!storage.get('token')) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Listeners are already set up via initNativePushListeners().
      // register() re-fires 'registration' with the token if needed.
      await PushNotifications.register();
    } else {
      await initWebPush(firebaseSWReg);
    }
  } catch (err) {
    console.error('FCM init failed:', err);
  }
}

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export async function removePushNotifications() {
  try {
    const token = storage.get('token');
    await fetch(`${API_URL}/push/unsubscribe`, {
      method: 'DELETE',
      headers: { 'token': token },
    });

    storage.remove('fcm_registered');
    console.log('Unsubscribed from push notifications ✅');
  } catch (err) {
    console.error('Unsubscribe failed:', err);
  }
}