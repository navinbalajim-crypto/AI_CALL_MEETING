// Base API Client configured for REST backend with mock fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('g13_auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('g13_auth_token', token);
    } else {
      localStorage.removeItem('g13_auth_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // In development / demo mode, return simulated response or rethrow gracefully
      console.warn(`[API] Fallback/Network note on ${endpoint}:`, error.message);
      throw error;
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
