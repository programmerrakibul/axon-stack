import { ZodError } from "zod";
import { AppError, ValidationError, InternalServerError } from "./errors";
import { ApiResponse, ApiFailure } from "./apiResponse";

/**
 * Converts unknown error types to AppError for consistent handling
 * - Already AppError instances are returned as-is
 * - Zod validation errors become ValidationError with details
 * - All other errors become InternalServerError
 *
 * @param err - Unknown error type from catch block
 * @returns Typed AppError for safe handling
 */
export function toAppError(err: unknown): AppError {
  // Already an app error
  if (err instanceof AppError) {
    return err;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return new ValidationError("Validation failed", {
      issues: err.issues.map((issue) => ({
        field: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      })),
    });
  }

  // Standard Error
  if (err instanceof Error) {
    // Database errors, network errors, etc. - log details but return generic message
    console.error("Unhandled error:", err.message, err.stack);
    return new InternalServerError();
  }

  // Complete unknown
  console.error("Unknown error type:", err);
  return new InternalServerError();
}

/**
 * Creates successful JSON response with proper typing
 *
 * @param data - Response payload
 * @param init - Optional ResponseInit (status, headers, etc.)
 * @returns Response with ApiSuccess shape
 *
 * @example
 * return jsonOk({ id: "123", name: "Product" });
 */
export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  const response: ApiResponse<T> = {
    ok: true,
    data,
  };

  return Response.json(response, {
    status: 200,
    ...init,
  });
}

/**
 * Creates error JSON response with safe details
 * - Exports error code, message, and safe details
 * - Never exposes stack traces or sensitive information
 * - Uses error status code if available, defaults to 500
 *
 * @param error - AppError instance to serialize
 * @param init - Optional ResponseInit (headers, etc.)
 * @returns Response with ApiFailure shape and appropriate status
 *
 * @example
 * const error = new ValidationError("Invalid input", { issues: [...] });
 * return jsonError(error);
 */
export function jsonError(error: AppError, init?: ResponseInit): Response {
  const response: ApiFailure = {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  };

  return Response.json(response, {
    status: error.status,
    ...init,
  });
}

/**
 * Type for handler functions
 * Matches Next.js API route handler signature
 */
export type Handler = (request: Request) => Promise<Response>;

/**
 * Wraps API route handler with automatic error handling
 * - Catches all thrown errors
 * - Converts to AppError using toAppError()
 * - Logs non-sensitive details server-side
 * - Returns proper ApiFailure response
 * - Prevents information leakage
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler with error handling
 *
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return jsonOk(data);
 * });
 *
 * @example
 * export const POST = withErrorHandling(async (request) => {
 *   const body = await request.json();
 *   const validated = mySchema.parse(body); // Zod error auto-converted
 *   const result = await createItem(validated);
 *   return jsonOk(result, { status: 201 });
 * });
 */
export function withErrorHandling(handler: Handler): Handler {
  return async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (err) {
      const appError = toAppError(err);

      // Log error details server-side (safe - no env secrets or PII)
      console.error(
        `[${appError.name}] ${appError.code}: ${appError.message}`,
        appError.details,
      );

      // Return safe error response to client
      return jsonError(appError);
    }
  };
}
