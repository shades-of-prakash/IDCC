import type { Context } from "hono";
import * as bcrypt from "bcryptjs";
import { setSignedCookie } from "hono/cookie";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

const COOKIE_SECRET =
	process.env.COOKIE_SECRET ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

export const loginAdmin = async (c: Context) => {
	const { username, password } = await c.req.json();

	const adminDoc = await Admin.findOne({ username });

	if (!adminDoc) {
		return ErrorResponse(c, "Invalid credentials", 401);
	}

	const isValid = await bcrypt.compare(password, adminDoc.password);

	if (!isValid) {
		return ErrorResponse(c, "Invalid credentials", 401);
	}

	await setSignedCookie(
		c,
		"adminAuth",
		adminDoc._id.toString(),
		COOKIE_SECRET,
		{
			httpOnly: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		}
	);

	return SuccessResponse(c, "Login successful", 200, {
		id: adminDoc._id,
		username: adminDoc.username,
	});
};
