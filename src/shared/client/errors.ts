import { ApiClientError } from "./api";

/**
 * Type guard for ApiClientError
 */
export function isApiClientError(err: unknown): err is ApiClientError {
  return err instanceof ApiClientError;
}

/**
 * Extract a user-facing message from any error.
 * Returns the ApiClientError message when available,
 * otherwise falls back to the provided fallback string.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (isApiClientError(err)) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
