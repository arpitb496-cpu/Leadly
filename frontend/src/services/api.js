const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    let message = 'An unexpected error occurred';
    if (data) {
      if (data.errors && typeof data.errors === 'object') {
        const fieldErrors = Object.entries(data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        message = data.error ? `${data.error}: ${fieldErrors}` : fieldErrors;
      } else if (data.error) {
        message = data.error;
      }
    }
    const err = new Error(message);
    err.fieldErrors = (data && data.errors) || (data && data.details) || {};
    err.status = response.status;
    throw err;
  }
  return data;
}

export const api = {
  // GET /api/leads/stats - counts of leads per status
  async getLeadStats() {
    try {
      const res = await fetch(`${BASE_URL}/leads/stats`);
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error('Backend server is currently offline.');
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },

  // GET /api/leads - search, filter, pagination, sorting
  async getLeads({
    status = 'All',
    search = '',
    page = 1,
    per_page = 10,
    sort = 'created_at',
    order = 'desc',
  } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('name', search.trim());
    }
    if (page) params.append('page', page);
    if (per_page) params.append('per_page', per_page);
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);

    const query = params.toString() ? `?${params.toString()}` : '';

    try {
      const res = await fetch(`${BASE_URL}/leads${query}`);
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error(
          'Unable to connect to the Flask API. Please ensure the backend server is running on http://localhost:5001.'
        );
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },

  async getLead(id) {
    try {
      const res = await fetch(`${BASE_URL}/leads/${id}`);
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error('Backend server is currently offline.');
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },

  async createLead(leadData) {
    try {
      const res = await fetch(`${BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error('Failed to save: Backend server is offline.');
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },

  async updateLead(id, updates) {
    try {
      const res = await fetch(`${BASE_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error('Failed to update: Backend server is offline.');
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },

  async deleteLead(id) {
    try {
      const res = await fetch(`${BASE_URL}/leads/${id}`, {
        method: 'DELETE',
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        const networkErr = new Error('Failed to delete: Backend server is offline.');
        networkErr.isApiDown = true;
        throw networkErr;
      }
      throw err;
    }
  },
};
