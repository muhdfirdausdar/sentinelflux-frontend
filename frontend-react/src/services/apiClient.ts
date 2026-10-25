import tokenService from './tokenService';

// HTTP Client with automatic JWT token management
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api-sf01.sentinelflux.software';
  }

  // Make authenticated request
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure we have a valid token
    await tokenService.ensureValidToken();
    
    const token = tokenService.getToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Build full URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Make request
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });
    
    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      console.log('Received 401, refreshing token...');
      
      try {
        await tokenService.refreshToken();
        const newToken = tokenService.getToken();
        
        if (newToken) {
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(fullUrl, { ...options, headers });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        tokenService.clearToken();
        throw new Error('Authentication failed');
      }
    }
    
    return response;
  }

  // GET request
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  }

  // POST request
  async post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Create EventSource with authentication
  async createEventSource(path: string, options: EventSourceInit = {}): Promise<EventSource> {
    const token = await tokenService.ensureValidToken();
    if (!token) {
      throw new Error('No valid token available for EventSource');
    }
    
    const url = new URL(path, this.baseURL);
    url.searchParams.set('access_token', token);
    
    return new EventSource(url.toString(), options);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
