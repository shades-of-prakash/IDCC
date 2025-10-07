import type { Context } from "hono";
import { getSignedCookie } from "hono/cookie";
import { Admin } from "../../models/admin.model";
import { SuccessResponse } from "../../utils/response";

const COOKIE_SECRET =
	process.env.COOKIE_SECRET ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

export const adminMe = async (c: Context) => {
	const adminId = await getSignedCookie(c, COOKIE_SECRET, "adminAuth");
	console.log("adminId:", adminId);

	if (!adminId) {
		return c.json({ message: "Not authenticated" }, 401);
	}

	const adminDoc = await Admin.findById(adminId);
	if (!adminDoc) {
		return c.json({ message: "Admin not found" }, 404);
	}
	const user = { id: adminDoc._id, username: adminDoc.username };
	return SuccessResponse(c, "Fetched admin details", 200, user);
};
