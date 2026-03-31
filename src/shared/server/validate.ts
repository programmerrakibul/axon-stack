import { z, ZodTypeAny } from "zod";
import { BadRequestError, ValidationError } from "./errors";

/**
 * Parse the request body as JSON.
 * Throws BadRequestError on malformed JSON so withErrorHandling serialises it as 400.
 */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new BadRequestError("Invalid JSON in request body");
  }
}

/**
 * Read + validate the request body against a Zod schema.
 * Returns the typed, parsed value or throws ValidationError with structured issues.
 */
export async function validateBody<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<z.infer<S>> {
  const raw = await readJson(req);
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Validation failed", {
      issues: result.error.issues.map((i) => ({
        field: i.path.join("."),
        code: i.code,
        message: i.message,
      })),
    });
  }
  return result.data;
}

/**
 * Validate URL search params against a Zod schema.
 * Converts all param values to strings first; use z.coerce in your schema
 * to handle numeric/boolean coercion.
 */
export function validateQuery<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): z.infer<S> {
  const { searchParams } = new URL(req.url);
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ValidationError("Invalid query parameters", {
      issues: result.error.issues.map((i) => ({
        field: i.path.join("."),
        code: i.code,
        message: i.message,
      })),
    });
  }
  return result.data;
}

/**
 * Validate dynamic route params (already resolved from the Next.js context).
 * Throws ValidationError if the params don't match the schema.
 */
export function validateParams<S extends ZodTypeAny>(
  params: Record<string, string>,
  schema: S,
): z.infer<S> {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw new ValidationError("Invalid route parameters", {
      issues: result.error.issues.map((i) => ({
        field: i.path.join("."),
        code: i.code,
        message: i.message,
      })),
    });
  }
  return result.data;
}
