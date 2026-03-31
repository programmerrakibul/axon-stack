/**
 * Standard API response shapes for type safety across all endpoints
 * All API responses should match one of these types
 */

/**
 * Successful API response
 * - ok: true indicates success
 * - data: the response payload of generic type T
 */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

/**
 * Failed API response
 * - ok: false indicates failure
 * - error: error details with code, message, and optional structured details
 */
export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Union type for all API responses
 * Discriminated union on 'ok' field allows type-safe handling in client code
 *
 * @example
 * const response: ApiResponse<User> = await fetch('/api/user').then(r => r.json());
 * if (response.ok) {
 *   // response.data is User
 *   console.log(response.data.name);
 * } else {
 *   // response.error is present
 *   console.error(response.error.message);
 * }
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
