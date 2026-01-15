export const ErrorCodes = {
  TokenInvalid: 'TokenInvalid',
  TokenMissing: 'TokenMissing',
} as const;

export type YurbajsErrorCodes = typeof ErrorCodes;
