// API service functions for making authenticated requests
import { API_BASE_URL } from '../constants';
import tokenService from './tokenService';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API client
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ensure we have a valid token
    const token = await tokenService.ensureValidToken();
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          tokenService.clearToken();
          // Try to refresh token and retry once
          const newToken = await tokenService.ensureValidToken();
          if (newToken) {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) {
              throw new ApiError(
                `API request failed: ${retryResponse.statusText}`,
                retryResponse.status,
                await retryResponse.text()
              );
            }
            const data = await retryResponse.json();
            return { data, status: retryResponse.status };
          }
        }
        
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          await response.text()
        );
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return this.makeRequest<T>(url.pathname + url.search);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
