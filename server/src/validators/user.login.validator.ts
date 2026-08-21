import { z } from "zod/mini";

const loginUserSchema = z.strictObject({
  email: z.pipe(
    z.string().check(z.trim(), z.toLowerCase()),
    z.email("Invalid email address"),
  ),
  password: z.string().check(z.trim(), z.minLength(1, "Password is required")),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export default loginUserSchema;
