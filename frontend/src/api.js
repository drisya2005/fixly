/**
 * API Service - Connects frontend to backend
 * All API calls are centralized here for easy maintenance
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      throw new Error(data.error || `Server error: ${response.status}`);
    }

    console.log(`API Success [${endpoint}]:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`API Request Failed [${endpoint}]:`, error);
    return { success: false, error: error.message };
  }
}

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
  // Unified registration endpoint
  register: async (registrationData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  // User registration
  registerUser: async (userData) => {
    return apiRequest('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  loginUser: async (phone, password) => {
    return apiRequest('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  },

  // Worker registration
  registerWorker: async (workerData) => {
    return apiRequest('/auth/worker/register', {
      method: 'POST',
      body: JSON.stringify(workerData),
    });
  },

  // Worker login
  loginWorker: async (phone, password) => {
    return apiRequest('/auth/worker/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  },

  // Admin login
  loginAdmin: async (username, password) => {
    return apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Reset passwords
  resetUserPassword: async (phone, newPassword) => {
    return apiRequest('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, new_password: newPassword }),
    });
  },

  resetWorkerPassword: async (phone, newPassword) => {
    return apiRequest('/auth/worker/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, new_password: newPassword }),
    });
  },

  resetAdminPassword: async (username, newPassword) => {
    return apiRequest('/auth/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username, new_password: newPassword }),
    });
  },

  // OTP-based password reset for User/Worker
  sendOtp: async (phone, role) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  },

  verifyOtp: async (phone, role, otp) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role, otp }),
    });
  },
};

// ============================================
// REVIEW API
// ============================================

export const reviewAPI = {
  // Submit review with optional photo/video files (multipart)
  submitReview: async (userId, workerId, bookingId, stars, comment, files) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('worker_id', workerId);
    formData.append('booking_id', bookingId);
    formData.append('stars', stars);
    formData.append('comment', comment || '');
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => formData.append('files[]', file));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/review`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Failed to submit review' };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Check if user already reviewed a booking
  checkReviewed: async (bookingId, userId) => {
    return apiRequest(`/review/check?booking_id=${bookingId}&user_id=${userId}`, { method: 'GET' });
  },

  // Get all reviews for a worker
  getWorkerReviews: async (workerId) => {
    return apiRequest(`/worker/${workerId}/reviews`, { method: 'GET' });
  },

  // Get file URL for a review media file
  getFileUrl: (filename) => `${API_BASE_URL}/uploads/reviews/${filename}`,
};

// ============================================
// EMERGENCY API
// ============================================

export const emergencyAPI = {
  sendEmergency: async (userId, userName, latitude, longitude, serviceType = '') => {
    return apiRequest('/emergency', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        latitude: latitude,
        longitude: longitude,
        service_type: serviceType,
      }),
    });
  },
};

// ============================================
// WORKER APIs
// ============================================

export const workerAPI = {
  // Search workers
  searchWorkers: async (serviceType, pincode = null, area = null) => {
    const params = new URLSearchParams({ service_type: serviceType });
    if (pincode) params.append('pincode', pincode);
    if (area) params.append('area', area);

    return apiRequest(`/workers/search?${params.toString()}`, {
      method: 'GET',
    });
  },

  // Get all workers (for complaint form)
  getAllWorkers: async () => {
    return apiRequest('/workers/all', { method: 'GET' });
  },

  // Update worker status
  updateStatus: async (workerId, status) => {
    return apiRequest('/workers/status', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId, status }),
    });
  },
};

// ============================================
// BOOKING APIs
// ============================================

export const bookingAPI = {
  // Get available slots for a worker on a date
  getWorkerSlots: async (workerId, date) => {
    return apiRequest(`/workers/${workerId}/slots?date=${date}`, {
      method: 'GET',
    });
  },

  // Book an appointment
  bookAppointment: async (bookingData) => {
    return apiRequest('/book-appointment', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Get user's appointments
  getUserAppointments: async (userId) => {
    return apiRequest(`/user/appointments?user_id=${userId}`, {
      method: 'GET',
    });
  },

  // Set worker availability
  setWorkerAvailability: async (availabilityData) => {
    return apiRequest('/worker/availability', {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  },

  // Get worker's availability slots
  getWorkerAvailability: async (workerId) => {
    return apiRequest(`/worker/${workerId}/availability`, {
      method: 'GET',
    });
  },

  // Delete worker availability slot
  deleteWorkerAvailability: async (availabilityId, workerId) => {
    return apiRequest(`/worker/availability/${availabilityId}`, {
      method: 'DELETE',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },

  // Get worker's appointments
  getWorkerAppointments: async (workerId) => {
    return apiRequest(`/worker/${workerId}/appointments`, {
      method: 'GET',
    });
  },

  // Get user's bookings
  getUserBookings: async (userId) => {
    return apiRequest(`/user/bookings?user_id=${userId}`, {
      method: 'GET',
    });
  },

  // Cancel booking
  cancelBooking: async (bookingId, userId) => {
    return apiRequest('/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, user_id: userId }),
    });
  },

  // Update booking status (worker actions)
  updateBookingStatus: async (bookingId, workerId, status) => {
    return apiRequest('/booking/update-status', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, worker_id: workerId, status }),
    });
  },

  // Get worker notifications
  getWorkerNotifications: async (workerId, unreadOnly = false) => {
    const params = unreadOnly ? '?unread_only=true' : '';
    return apiRequest(`/worker/${workerId}/notifications${params}`, {
      method: 'GET',
    });
  },

  // Mark notification as read
  markNotificationRead: async (notificationId, workerId) => {
    return apiRequest('/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ notification_id: notificationId, worker_id: workerId }),
    });
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (workerId) => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },
};

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
  // Worker Verification
  getPendingWorkers: async () => {
    return apiRequest('/admin/pending-workers', {
      method: 'GET',
    });
  },

  approveWorker: async (workerId) => {
    return apiRequest('/admin/approve-worker', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },

  rejectWorker: async (workerId) => {
    return apiRequest('/admin/reject-worker', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },

  // Complaint Management
  getComplaints: async (status = '') => {
    const url = status ? `/admin/complaints?status=${status}` : '/admin/complaints';
    return apiRequest(url, {
      method: 'GET',
    });
  },

  resolveComplaint: async (complaintId) => {
    return apiRequest('/admin/resolve-complaint', {
      method: 'POST',
      body: JSON.stringify({ complaint_id: complaintId }),
    });
  },

  // User Management
  getAllUsers: async () => {
    return apiRequest('/admin/users', {
      method: 'GET',
    });
  },

  blockUser: async (userId, action = 'block') => {
    return apiRequest('/admin/block-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, action }),
    });
  },

  deleteUser: async (userId) => {
    return apiRequest('/admin/delete-user', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // Worker Management
  getAllWorkers: async () => {
    return apiRequest('/admin/workers', {
      method: 'GET',
    });
  },

  blockWorker: async (workerId, action = 'block') => {
    return apiRequest('/admin/block-worker', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId, action }),
    });
  },

  deleteWorker: async (workerId) => {
    return apiRequest('/admin/delete-worker', {
      method: 'DELETE',
      body: JSON.stringify({ worker_id: workerId }),
    });
  },
};

// ============================================
// COMPLAINTS APIs
// ============================================

export const complaintsAPI = {
  submitComplaint: async (userId, workerId, complaintText) => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        worker_id: workerId,
        complaint_text: complaintText,
      }),
    });
  },
};


// ============================================
// TRACKING APIs
// ============================================

export const trackingAPI = {
  // Worker sends their current GPS coordinates
  updateLocation: async (workerId, latitude, longitude) => {
    return apiRequest('/tracking/update', {
      method: 'POST',
      body: JSON.stringify({ worker_id: workerId, latitude, longitude }),
    });
  },

  // User fetches worker's latest coordinates
  getWorkerLocation: async (workerId) => {
    return apiRequest('/tracking/worker/' + workerId, { method: 'GET' });
  },

  // Worker stops sharing location
  stopTracking: async (workerId) => {
    return apiRequest('/tracking/worker/' + workerId, { method: 'DELETE' });
  },
};

// ============================================
// USER LOCATION SHARING APIs
// ============================================

export const userLocationAPI = {
  // User sends their current GPS coordinates
  updateLocation: async (userId, latitude, longitude) => {
    return apiRequest('/tracking/user/update', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, latitude, longitude }),
    });
  },

  // Worker fetches user's latest coordinates
  getUserLocation: async (userId) => {
    return apiRequest('/tracking/user/' + userId, { method: 'GET' });
  },

  // User stops sharing location
  stopSharing: async (userId) => {
    return apiRequest('/tracking/user/' + userId, { method: 'DELETE' });
  },
};
