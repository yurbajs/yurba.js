import { REST, RequestConfig } from '../BaseClient';

/**
 * Base class for all API resources
 * Provides common functionality and utilities
 * 
 * @internal
 */
export abstract class BaseResource {
  protected readonly client: REST;

  /**
   * Creates a new resource instance
   * @param client - REST client instance
   */
  constructor(client: REST) {
    this.client = client;
  }

  /**
   * Validate required parameters
   * @param params - Parameters to validate
   * @param required - Required parameter names
   * @throws {Error} If any required parameter is missing
   */
  protected validateRequired(params: Record<string, any>, required: string[]): void {
    for (const param of required) {
      if (params[param] === undefined || params[param] === null) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }

  /**
   * Validate parameter constraints
   * @param value - Value to validate
   * @param constraints - Validation constraints
   * @param paramName - Parameter name for error messages
   */
  protected validateConstraints(
    value: any,
    constraints: {
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
      enum?: any[];
    },
    paramName: string
  ): void {
    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        throw new Error(`${paramName} must be >= ${constraints.min}`);
      }
      if (constraints.max !== undefined && value > constraints.max) {
        throw new Error(`${paramName} must be <= ${constraints.max}`);
      }
    }

    if (typeof value === 'string') {
      if (constraints.minLength !== undefined && value.length < constraints.minLength) {
        throw new Error(`${paramName} must be at least ${constraints.minLength} characters`);
      }
      if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
        throw new Error(`${paramName} must be at most ${constraints.maxLength} characters`);
      }
      if (constraints.pattern && !constraints.pattern.test(value)) {
        throw new Error(`${paramName} format is invalid`);
      }
    }

    if (constraints.enum && !constraints.enum.includes(value)) {
      throw new Error(`${paramName} must be one of: ${constraints.enum.join(', ')}`);
    }
  }

  /**
   * Build paginated endpoint URL
   * @param baseEndpoint - Base endpoint
   * @param page - Page number
   * @param limit - Items per page
   * @returns Formatted endpoint with pagination
   */
  protected buildPaginatedEndpoint(
    baseEndpoint: string,
    page?: number,
    limit?: number
  ): string {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', String(page));
    if (limit !== undefined) params.append('limit', String(limit));
    
    const queryString = params.toString();
    return queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;
  }

  /**
   * Validate dialog ID
   */
  protected validateDialogId(dialogId: number): void {
    if (dialogId < 1) throw new Error('Invalid dialogId');
  }

  /**
   * Validate page number
   */
  protected validatePage(page: number): void {
    if (page < 0) throw new Error('Page number must be >= 0');
  }

  /**
   * Validate string length
   */
  protected validateStringLength(value: string, maxLength: number, fieldName: string): void {
    if (value.length > maxLength) {
      throw new Error(`${fieldName} exceeds ${maxLength} characters`);
    }
  }

  /**
   * Handle API errors with consistent error mapping
   */
  protected handleApiError(err: any, endpoint?: string): never {
    const detail = err?.response?.data?.detail;
    
    switch (detail) {
      case 'auth_failed':
        throw new Error('Authorization failed: invalid token');
      case 'access_denied':
        throw new Error('Access denied or resource does not exist');
      case 'not_found':
        throw new Error('Resource not found');
      case 'invalid_type':
        throw new Error('Invalid type provided');
      case 'upload_error':
        throw new Error('Failed to save to database');
      default:
        throw new Error(`API Error: ${detail || err.message}`);
    }
  }

  /**
   * Execute request with automatic error handling and type safety
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param data - Request data
   * @param config - Request configuration
   * @returns Promise resolving to typed response
   */
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    switch (method) {
      case 'GET':
        return this.client.get<T>(endpoint, data, config);
      case 'POST':
        return this.client.post<T>(endpoint, data, config);
      case 'PUT':
        return this.client.put<T>(endpoint, data, config);
      case 'PATCH':
        return this.client.patch<T>(endpoint, data, config);
      case 'DELETE':
        return this.client.delete<T>(endpoint, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}