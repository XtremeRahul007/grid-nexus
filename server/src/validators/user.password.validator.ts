import { z } from "zod";

const userPasswordSchema = z.strictObject({
  password: z.string().trim().min(1, "Password is required"),
});

export type UserPassword = z.infer<typeof userPasswordSchema>;

export default userPasswordSchema;
