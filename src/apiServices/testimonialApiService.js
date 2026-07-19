import { API_URL } from '../config';


// Small fetch wrapper — mirrors the pattern used by userDashboardApiService
// (throws an Error with the backend's `message` field on non-2xx responses).
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

const testimonialApiService = {
  // GET /api/testimonials — published testimonials only, for the Stories page
  getTestimonials: () => request('/testimonials/'),

  // POST /api/testimonials/submit — public, no auth required.
  // Always lands as unpublished on the backend until an admin approves it.
  submitTestimonial: (data) =>
    request('/testimonials/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default testimonialApiService;