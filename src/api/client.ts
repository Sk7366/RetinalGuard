/**
 * Base HTTP Client for FastAPI & Cloud Run Microservices
 */

import { APP_CONFIG } from '../config/appConfig';
import { authService } from '../auth/authService';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any,
    message?: string
  ) {
    super(message || `API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || APP_CONFIG.apiBaseUrl).replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const timeoutMs = options.timeoutMs || 15000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const currentUser = authService.getCurrentUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (currentUser?.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new ApiError(response.status, response.statusText, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError(408, 'Request Timeout', null, `Request to ${url} timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
