/**
 * Standardized response formatter for all API responses
 * Ensures consistent response format across the entire API
 */

export const successResponse = (data, message = 'Success', code = 'SUCCESS') => ({
  success: true,
  code,
  message,
  data,
  timestamp: new Date().toISOString()
});

export const errorResponse = (
  code = 'INTERNAL_ERROR',
  message = 'An error occurred',
  statusCode = 500,
  details = null,
  requestId = null
) => ({
  success: false,
  code,
  message,
  statusCode,
  ...(details && { details }),
  ...(requestId && { requestId }),
  timestamp: new Date().toISOString()
});

/**
 * Error codes mapping for consistent error handling
 * Format: { code: { code: string, status: number } }
 */
export const ERROR_CODES = {
  // Authentication (AUTH_000-099)
  INVALID_CREDENTIALS: { code: 'AUTH_001', status: 401, message: 'Invalid email or password' },
  TOKEN_EXPIRED: { code: 'AUTH_002', status: 401, message: 'Token has expired' },
  TOKEN_INVALID: { code: 'AUTH_003', status: 401, message: 'Invalid token' },
  UNAUTHORIZED: { code: 'AUTH_004', status: 403, message: 'Unauthorized access' },
  USER_NOT_FOUND: { code: 'AUTH_005', status: 404, message: 'User not found' },
  USER_ALREADY_EXISTS: { code: 'AUTH_006', status: 409, message: 'User already exists' },
  
  // Validation (VAL_000-099)
  INVALID_INPUT: { code: 'VAL_001', status: 400, message: 'Invalid input provided' },
  MISSING_FIELD: { code: 'VAL_002', status: 400, message: 'Required field missing' },
  INVALID_FORMAT: { code: 'VAL_003', status: 400, message: 'Invalid format' },
  INVALID_EMAIL: { code: 'VAL_004', status: 400, message: 'Invalid email format' },
  WEAK_PASSWORD: { code: 'VAL_005', status: 400, message: 'Password does not meet requirements' },
  INVALID_PAGINATION: { code: 'VAL_006', status: 400, message: 'Invalid pagination parameters' },
  
  // Resources (RES_000-099)
  NOT_FOUND: { code: 'RES_001', status: 404, message: 'Resource not found' },
  JOB_NOT_FOUND: { code: 'RES_002', status: 404, message: 'Job not found' },
  EVENT_NOT_FOUND: { code: 'RES_003', status: 404, message: 'Event not found' },
  CONFLICT: { code: 'RES_004', status: 409, message: 'Resource conflict' },
  DUPLICATE_ENTRY: { code: 'RES_005', status: 409, message: 'Duplicate entry' },
  
  // File Operations (FILE_000-099)
  FILE_TOO_LARGE: { code: 'FILE_001', status: 413, message: 'File size exceeds limit' },
  INVALID_FILE_TYPE: { code: 'FILE_002', status: 400, message: 'Invalid file type' },
  UPLOAD_FAILED: { code: 'FILE_003', status: 500, message: 'File upload failed' },
  
  // Server (SYS_000-099)
  INTERNAL_ERROR: { code: 'SYS_001', status: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { code: 'SYS_002', status: 503, message: 'Service unavailable' },
  DATABASE_ERROR: { code: 'SYS_003', status: 500, message: 'Database error' },
  RATE_LIMIT_EXCEEDED: { code: 'SYS_004', status: 429, message: 'Too many requests' },
  
  // Business Logic (BIZ_000-099)
  INSUFFICIENT_FUNDS: { code: 'BIZ_001', status: 400, message: 'Insufficient funds' },
  OPERATION_FAILED: { code: 'BIZ_002', status: 400, message: 'Operation failed' },
  INVALID_STATUS: { code: 'BIZ_003', status: 400, message: 'Invalid status transition' }
};

export const createErrorResponse = (errorCode, customMessage = null, statusCode = null, details = null, requestId = null) => {
  const errorInfo = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
  const finalStatusCode = statusCode || errorInfo.status;
  const finalMessage = customMessage || errorInfo.message;
  
  return {
    statusCode: finalStatusCode,
    body: errorResponse(errorCode, finalMessage, finalStatusCode, details, requestId)
  };
};

export default {
  successResponse,
  errorResponse,
  createErrorResponse,
  ERROR_CODES
};
