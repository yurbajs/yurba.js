/**
 * Base resource error
 */
export class ResourceError extends Error {
  constructor(message: string, public code: string, public resource: string) {
    super(message);
    this.name = 'ResourceError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends ResourceError {
  constructor(message: string, resource: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', resource);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ResourceError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', resource);
    this.name = 'NotFoundError';
  }
}

/**
 * Permission error
 */
export class PermissionError extends ResourceError {
  constructor(resource: string, action: string) {
    super(`Permission denied for ${action} on ${resource}`, 'PERMISSION_DENIED', resource);
    this.name = 'PermissionError';
  }
}