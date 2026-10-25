const NETLIFY_API_BASE = '/api';

// Type definitions for API responses
export interface ApiParams {
  [key: string]: string | number | boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: string;
  message?: string;
}

export async function fetchFromApi<T = any>(
  endpoint: string, 
  params: ApiParams = {},
  method: 'GET' | 'POST' = 'GET'
): Promise<T> {
  let url = `${NETLIFY_API_BASE}/${endpoint}`;
  let body: string | undefined;
  
  if (method === 'GET') {
    // If params exist, add as query string for GET
    if (Object.keys(params).length) {
      const query = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      url += `?${query}`;
    }
  } else {
    // For POST, send params in body
    if (Object.keys(params).length) {
      body = JSON.stringify(params);
    }
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}