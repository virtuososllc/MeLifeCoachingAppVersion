import { API_URL } from '../config';

// ─── PWA Detection ───────────────────────────────────────────────
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// ─── PWA Detection ───────────────────────────────────────────────
const isPWA = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true ||
  Capacitor.isNativePlatform();

// ─── Smart Storage ───────────────────────────────────────────────
export const storage = {
  get: (key) => {
    // Native + PWA → localStorage (synced from Preferences on boot)
    if (isPWA()) return localStorage.getItem(key);
    return sessionStorage.getItem(key);
  },

  set: async (key, value) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    if (Capacitor.isNativePlatform()) {
      // ✅ Save to BOTH — localStorage for sync reads, Preferences for persistence
      localStorage.setItem(key, String(value));
      await Preferences.set({ key, value: String(value) });
    } else if (isPWA()) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },

  remove: async (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
    }
  },

  clear: async () => {
    localStorage.clear();
    sessionStorage.clear();
    if (Capacitor.isNativePlatform()) {
      await Preferences.clear();
    }
  },

  // ✅ Call once on app boot — restores localStorage from Preferences
  syncFromNative: async () => {
    if (!Capacitor.isNativePlatform()) return;
    const keys = ['token', 'user', 'fcm_registered'];
    for (const key of keys) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn(`Failed to sync ${key}:`, e);
      }
    }
    console.log('Native storage synced ✅');
  }
};

// ─── API Service ─────────────────────────────────────────────────
const userApiService = {
  getHeaders: (token) => ({
    'Content-Type': 'application/json',
    'token': token
  }),

  async request(endpoint, method = 'GET', body = null, token) {
    try {
      const options = {
        method,
        headers: this.getHeaders(token),
        body: body ? JSON.stringify(body) : null
      };
      const res = await fetch(`${API_URL}${endpoint}`, options);
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired.");
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`Request failed: ${endpoint}`, err);
      throw err;
    }
  },

  // --- AUTHENTICATION ---
  userlogin: (data) => userApiService.request('/auth/login', 'POST', data),
  verifyOtp: (data) => userApiService.request('/auth/verify-otp', 'POST', data),

  // --- PRE-REGISTRATION VERIFICATION ---
  sendVerificationOtp: (data) => userApiService.request('/auth/send-verification-otp', 'POST', data),
  verifyRegistrationOtp: (data) => userApiService.request('/auth/verify-registration-otp', 'POST', data),

  // --- REGISTRATION ---
  userRegister: (data) => userApiService.request('/auth/register', 'POST', data),

  // --- PASSWORD MANAGEMENT ---
  forgotPassword: (email) => userApiService.request('/auth/forgot-password', 'POST', { email }),
  resetPassword: (data, token) => userApiService.request('/auth/reset-password', 'POST', data, token),
  resetPasswordWithEmailLink: (data, token) => userApiService.request('/auth/reset-password-with-link', 'POST', data, token),

  // --- USER DATA ---
  fetchUser: (token) => userApiService.request('/auth/user', 'GET', null, token),
  updateProfile: (data, token) => userApiService.request('/auth/update-profile', 'PUT', data, token),

  // --- DASHBOARD ---
  fetchSessions: (token) => userApiService.request('/course/sessions', 'GET', null, token),
  completeSession: (sessionId, token) => userApiService.request(`/course/sessions/${sessionId}/complete`, 'PUT', { isCompleted: true }, token),
  requestAccess: (sessionId, token) => userApiService.request('/course/request-access', 'POST', { sessionId }, token),
  fetchNotifications: (token) => userApiService.request('/auth/notifications', 'GET', null, token),
  updateLanguagePreference: (language, token) => userApiService.request('/course/language-preference', 'PUT', { language }, token),

  // --- REFLECTIONS ---
  fetchReflections: (token) => userApiService.request('/auth/fetch-reflections', 'GET', null, token),
  createOrUpdateReflection: (data, token) => userApiService.request('/auth/create-reflections', 'POST', data, token),

  // --- PAYMENTS ---
  createPaymentOrder: (userData) => userApiService.request('/auth/create-order', 'POST', userData),
  createSessionOrder: (userData) => userApiService.request('/auth/create-session-order', 'POST', userData),
  notifyAdminBooking: (data) => userApiService.request('/auth/notify-admin-booking', 'POST', data),

  // --- FLASHCARDS ---
  fetchFlashcards: (token) => userApiService.request('/auth/flashcards', 'GET', null, token),
  fetchDailyFlashcard: (token) => userApiService.request('/auth/flashcards/daily', 'GET', null, token),
  fetchFlashcardById: (cardId, token) => userApiService.request(`/auth/flashcards/${cardId}`, 'GET', null, token),
  

  // --- ASSIGNMENTS ---
  fetchMyAssignments: (token) => userApiService.request('/auth/assignments', 'GET', null, token),
  fetchAssignment: (sessionId, token) => userApiService.request(`/auth/assignments/${sessionId}`, 'GET', null, token),
  submitAssignment: (data, token) => userApiService.request('/auth/assignments', 'POST', data, token),
  markAssignmentNotified: (assignmentId, token) => userApiService.request('/auth/assignments/mark-notified', 'PATCH', { assignmentId }, token),
};

export default userApiService;