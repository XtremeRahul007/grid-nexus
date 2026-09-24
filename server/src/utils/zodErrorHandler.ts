import z from "zod";
import type { FieldErrors } from "../@types/auth.types.js";
import { AppError } from "../core/errors/AppError.js";

export function parseWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  const flattened = z.flattenError(result.error);

  const formError = flattened.formErrors[0];

  throw new AppError("Validation failed", {
    statusCode: 400,
    code: "VALIDATION_ERROR",
    details: {
      fields: flattened.fieldErrors as FieldErrors,
      ...(formError !== undefined ? { formError } : {}),
    },
  });
}
