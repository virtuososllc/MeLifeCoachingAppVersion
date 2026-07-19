import { API_URL } from '../config';
import { storage } from './userDashboardApiService';

const getToken = () =>
  storage.get('token') ||
  sessionStorage.getItem('token');

const adminDashboardApiService = {
  getHeaders: (token) => ({
    'Content-Type': 'application/json',
    'token': token,
  }),

  async request(endpoint, method = 'GET', body = null, token) {
    const resolvedToken = token || getToken();
    if (!resolvedToken) {
      console.warn(`[API] No token available for ${method} ${endpoint}`);
    }
    try {
      const options = {
        method,
        headers: this.getHeaders(resolvedToken),
        body: body ? JSON.stringify(body) : null,
      };
      const res = await fetch(`${API_URL}${endpoint}`, options);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.msg || error.message || `API Error: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`[API] Request failed: ${method} ${endpoint}`, err);
      throw err;
    }
  },

  // ── Auth & Users ──────────────────────────────────────────────
  fetchUser:     (token)                           => adminDashboardApiService.request('/auth/user', 'GET', null, token),
  fetchAllUsers: (token)                           => adminDashboardApiService.request('/admin/users', 'GET', null, token),
  createAdmin:   (data, token)                     => adminDashboardApiService.request('/admin/create-admin', 'POST', data, token),
  deleteUser:    (id, token)                       => adminDashboardApiService.request(`/admin/delete-users/${id}`, 'DELETE', null, token),
  grantAccess:   (userId, sessionId, grant, token) => adminDashboardApiService.request(`/admin/users/${userId}/sessions/${sessionId}/grant`, 'PUT', { grant }, token),

  // ── Sessions ──────────────────────────────────────────────────
  fetchSessions:  (token)           => adminDashboardApiService.request('/course/sessions', 'GET', null, token),
  createSession:  (data, token)     => adminDashboardApiService.request('/admin/post-new-sessions', 'POST', data, token),
  updateSession:  (id, data, token) => adminDashboardApiService.request(`/admin/update-sessions/${id}`, 'PUT', data, token),
  deleteSession:  (id, token)       => adminDashboardApiService.request(`/admin/delete-sessions/${id}`, 'DELETE', null, token),

  // ── Profile & Password ────────────────────────────────────────
  updateProfile: (data, token) => adminDashboardApiService.request('/auth/update-profile', 'PUT', data, token),
  resetPassword: (data, token) => adminDashboardApiService.request('/auth/reset-password', 'PUT', data, token),

  // ── Notifications ─────────────────────────────────────────────
  fetchNotifications: (token) => adminDashboardApiService.request('/auth/notifications', 'GET', null, token),

  // ── Reflections ───────────────────────────────────────────────
  fetchReflections:  (token)       => adminDashboardApiService.request('/admin/fetch-reflections', 'GET', null, token),
  replyToReflection: (data, token) => adminDashboardApiService.request('/admin/reflections/reply', 'POST', data, token),

  // ── Flashcards ────────────────────────────────────────────────
  fetchAllFlashcards: (token)           => adminDashboardApiService.request('/admin/flashcards', 'GET', null, token),
  createFlashcard:    (data, token)     => adminDashboardApiService.request('/admin/flashcards', 'POST', data, token),
  updateFlashcard:    (id, data, token) => adminDashboardApiService.request(`/admin/flashcards/${id}`, 'PUT', data, token),
  deleteFlashcard:    (id, token)       => adminDashboardApiService.request(`/admin/flashcards/${id}`, 'DELETE', null, token),
  getUserCustomCards: (userId, token)   => adminDashboardApiService.request(`/admin/flashcards/user/${userId}`, 'GET', null, token),

  // ── Assignments ───────────────────────────────────────────────
  // Fetch all (filter by ?sessionId=&userId=&status=)
  fetchAllAssignments: (filters, token) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return adminDashboardApiService.request(`/admin/assignments/admin/all${params}`, 'GET', null, token);
  },
  // Post assignment to user(s): { sessionId, userIds: [...] | 'all', question }
  postAssignment: (data, token) => adminDashboardApiService.request('/admin/assignments/admin/post', 'POST', data, token),
  // Reply to a user's submission
  replyToAssignment: (id, adminReply, token) => adminDashboardApiService.request(`/admin/assignments/admin/${id}/reply`, 'PATCH', { adminReply }, token),
  // Toggle lock/unlock
  toggleAssignmentLock: (id, token) => adminDashboardApiService.request(`/admin/assignments/admin/${id}/lock`, 'PATCH', null, token),
  // Delete
  deleteAssignment: (id, token) => adminDashboardApiService.request(`/admin/assignments/admin/${id}`, 'DELETE', null, token),

    // ── Testimonials ──────────────────────────────────────────────
  // Fetch every testimonial (published + pending) for admin review
  fetchAllTestimonials: (token) => adminDashboardApiService.request('/testimonials/admin/all', 'GET', null, token),
  // Update fields (name, role, quote, stars, avatarUrl, order, isPublished)
  updateTestimonial: (id, data, token) => adminDashboardApiService.request(`/testimonials/admin/${id}`, 'PATCH', data, token),
  // Flip isPublished true/false
  toggleTestimonialPublish: (id, token) => adminDashboardApiService.request(`/testimonials/admin/${id}/toggle-publish`, 'PATCH', null, token),
  // Delete
  deleteTestimonial: (id, token) => adminDashboardApiService.request(`/testimonials/admin/${id}`, 'DELETE', null, token),


};

export default adminDashboardApiService;