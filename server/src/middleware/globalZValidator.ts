import { zValidator } from "@hono/zod-validator";
import { ErrorResponse } from "../utils/response";
import { ZodObject } from "zod";

export const gloabalZValidator = (
	schema: ZodObject<any>,
	target: "json" | "form" | "query" = "json"
) =>
	zValidator(target, schema, (r, c) => {
		if (!r.success) {
			const fieldErrors = r.error.issues.reduce<Record<string, string>>(
				(acc, issue) => {
					const key = issue.path.join(".") || "form";
					acc[key] = issue.message;
					return acc;
				},
				{}
			);

			return ErrorResponse(c, "Validation failed", 422, fieldErrors);
		}
	});
