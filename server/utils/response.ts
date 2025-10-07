import type { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const SuccessResponse = (
	c: Context,
	message: string,
	status: ContentfulStatusCode,
	data?: any
) => {
	return c.json(
		{
			success: true,
			message,
			data: data || null,
		},
		status
	);
};

export const ErrorResponse = (
	c: Context,
	message: string,
	status: ContentfulStatusCode = 400,
	errors?: any
) => {
	return c.json(
		{
			success: false,
			message,
			errors: errors || null,
		},
		status
	);
};
