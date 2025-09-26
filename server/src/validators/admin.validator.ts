// validation/adminValidation.ts
import { z } from "zod";

export const adminValidation = z.object({
	username: z.string().min(4, "username is invalid").trim(),
	password: z.string().min(8, "password is invalid"),
});
