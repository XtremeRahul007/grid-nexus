import { z } from "zod";

const loginUserSchema = z.strictObject({
  email: z.pipe(
    z.string().trim().toLowerCase(),
    z.email("Invalid email address"),
  ),
  password: z.string().trim().min(1, "Password is required"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

export default loginUserSchema;
