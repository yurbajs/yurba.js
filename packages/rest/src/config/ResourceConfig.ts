/**
 * Configuration for resources
 */
export interface ResourceConfig {
  /** Enable validation */
  validation: boolean;
  /** Enable caching */
  caching: boolean;
  /** Enable rate limiting */
  rateLimit: boolean;
  /** Enable logging */
  logging: boolean;
  /** Default page size */
  defaultPageSize: number;
  /** Maximum string length */
  maxStringLength: number;
}

/**
 * Default resource configuration
 */
export const DEFAULT_CONFIG: ResourceConfig = {
  validation: true,
  caching: false,
  rateLimit: false,
  logging: false,
  defaultPageSize: 20,
  maxStringLength: 255
};

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
  TAG_MAX_LENGTH: 255,
  CONTENT_MAX_LENGTH: 1000,
  CAPTION_MAX_LENGTH: 1000,
  PLAYLIST_NAME_MAX_LENGTH: 100,
  MIN_ID: 1,
  MIN_PAGE: 0
} as const;