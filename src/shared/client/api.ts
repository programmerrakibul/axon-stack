import { ApiResponse } from "@/shared/server/apiResponse";

/**
 * Typed error for API failures
 * Thrown by apiFetch when response.ok === false
 */
export class ApiClientError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  /**
   * Check if this error is a specific error code
   * @param code The error code to check
   * @returns true if this error matches the code
   *
   * @example
   * try {
   *   await apiFetch('/api/auth/signup', { ... });
   * } catch (err) {
   *   if (err instanceof ApiClientError && err.isCode('CONFLICT')) {
   *     toast.error('Email already in use');
   *   }
   * }
   */
  isCode(code: string): boolean {
    return this.code === code;
  }
}

/**
 * Type-safe fetch wrapper that handles ApiResponse
 * Converts server errors to thrown ApiClientError
 *
 * @param url - API endpoint to call
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<T> - The data from successful response
 * @throws {ApiClientError} - If response.ok === false
 *
 * @example
 * // Success case - returns data directly
 * const user = await apiFetch<User>('/api/user', { method: 'GET' });
 *
 * @example
 * // Error case - throws ApiClientError
 * try {
 *   await apiFetch('/api/auth/signup', {
 *     method: 'POST',
 *     body: JSON.stringify({ email, password }),
 *   });
 * } catch (err) {
 *   if (err instanceof ApiClientError) {
 *     console.error(`[${err.code}] ${err.message}`);
 *     if (err.details) {
 *       console.log('Details:', err.details);
 *     }
 *   }
 * }
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await response.json();

  // Success case
  if (json.ok) {
    return json.data;
  }

  // Error case - throw typed error
  throw new ApiClientError(
    json.error.code,
    json.error.message,
    json.error.details,
  );
}
