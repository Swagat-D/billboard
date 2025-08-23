import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../../constants/app';
import { storageService } from '../storage/storageService';

export interface APIError {
  message: string;
  status: number;
  data: any;
}

// Updated to match backend response format
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  otpSent?: boolean;
  errors?: string[];
}

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...API_CONFIG.HEADERS,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
  // Request interceptor - Add auth token
  this.client.interceptors.request.use(
    async (config: import('axios').InternalAxiosRequestConfig) => {
      try {
        const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          if (!config.headers) {
            config.headers = {} as import('axios').AxiosRequestHeaders;
          }
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.log('Error getting token from storage:', error);
      }

      // Enhanced logging
      if (__DEV__) {
        console.log('🔧 API Config BASE_URL:', this.client.defaults.baseURL);
        console.log('🚀 Full Request URL:', `${this.client.defaults.baseURL}${config.url}`);
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('📋 Request headers:', config.headers);
        if (config.data) {
          console.log('📤 Request data:', config.data);
        }
        console.log('⏱️ Request timeout:', config.timeout);
      }

      return config;
    },
    (error: any) => {
      console.log('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle responses and errors
  this.client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (__DEV__) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log('📊 Status:', response.status);
        console.log('📥 Response headers:', response.headers);
        console.log('📥 Response data:', response.data);
      }
      
      return response;
    },
    async (error: any) => {
      if (__DEV__) {
        console.log('❌ API Error Details:');
        console.log('🌐 Request URL:', error.config?.url);
        console.log('🌐 Full URL:', `${error.config?.baseURL}${error.config?.url}`);
        console.log('📡 Error code:', error.code);
        console.log('📡 Error message:', error.message);
        console.log('📡 Network state:', navigator?.onLine ? 'Online' : 'Offline');
        
        if (error.response) {
          console.log('📡 Response status:', error.response.status);
          console.log('📡 Response data:', error.response.data);
          console.log('📡 Response headers:', error.response.headers);
        } else if (error.request) {
          console.log('📡 No response received');
          console.log('📡 Request details:', error.request);
        }
      }

      // ... rest of your error handling code

      return Promise.reject(this.normalizeError(error));
    }
  );
}

  private normalizeError(error: any): APIError {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      
      return {
        message: errorData?.message || 
                errorData?.errors?.[0] || 
                `Server error: ${error.response.status}`,
        status: error.response.status,
        data: errorData,
      };
    } else if (error.request) {
      // Network error - no response received
      return {
        message: 'Network error. Please check your internet connection and try again.',
        status: 0,
        data: null,
      };
    } else {
      // Other error (configuration, etc.)
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  }

  // HTTP Methods - Simplified to return raw axios response
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // File upload method
  async uploadFile<T = any>(
    url: string, 
    file: any, 
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      };

      const response = await this.client.post<T>(url, formData, config);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Utility method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error(error)
      return false;
    }
  }

  // Utility method to get current user token
  async getAuthToken(): Promise<string | null> {
    try {
      return await storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();