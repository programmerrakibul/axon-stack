/**
 * Typed error classes for consistent API error handling
 * All errors inherit from AppError and should be caught by the handler wrapper
 */

export interface ErrorDetails {
  [key: string]: unknown;
}

/**
 * Base error class for all application errors
 * Every API error should either be this class or inherit from it
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: ErrorDetails,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * 400 Bad Request - Client sent malformed request
 * Use for general invalid request structure (use ValidationError for validation failures)
 */
export class BadRequestError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super("BAD_REQUEST", message, 400, details);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Request lacks valid authentication
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: ErrorDetails) {
    super("UNAUTHORIZED", message, 401, details);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but lacks permission for resource
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: ErrorDetails) {
    super("FORBIDDEN", message, 403, details);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource", details?: ErrorDetails) {
    super("NOT_FOUND", `${resource} not found`, 404, details);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Request violates system constraints
 * Use for duplicate entries, version conflicts, etc.
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super("CONFLICT", message, 409, details);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 400 Validation Error - Input validation failed (extends BadRequest semantically)
 * Contains structured validation errors from Zod or similar validators
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 500 Internal Server Error - Unexpected server-side error
 * Only returned when error cannot be categorized or is truly internal
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Internal server error",
    details?: ErrorDetails,
  ) {
    super("INTERNAL_SERVER_ERROR", message, 500, details);
    this.name = "InternalServerError";
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
