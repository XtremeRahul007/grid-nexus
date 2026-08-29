import { z } from "zod/mini";

const userPasswordSchema = z.strictObject({
  password: z.string().check(z.trim(), z.minLength(1, "Password is required")),
});

export type UserPassword = z.infer<typeof userPasswordSchema>;

export default userPasswordSchema;
