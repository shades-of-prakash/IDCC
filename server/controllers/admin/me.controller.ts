import type { Context } from "hono";
import { getSignedCookie } from "hono/cookie";
import mongoose from "mongoose";
import { Admin } from "../../models/admin.model";
import { SuccessResponse } from "../../utils/response";

const COOKIE_SECRET =
	process.env.COOKIE_SECRET ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

export const adminMe = async (c: Context) => {
	const cookieValue = await getSignedCookie(c, COOKIE_SECRET, "adminAuth");
	console.log("Raw cookie:", cookieValue);

	if (!cookieValue) {
		return c.json({ message: "Not authenticated" }, 401);
	}

	let admin;
	try {
		admin = JSON.parse(cookieValue);
	} catch {
		return c.json({ message: "Invalid cookie format" }, 400);
	}

	if (!admin?.id) {
		return c.json({ message: "Invalid admin data in cookie" }, 400);
	}

	let objectId;
	try {
		objectId = mongoose.Types.ObjectId.createFromHexString(admin.id);
	} catch {
		return c.json({ message: "Invalid admin ID" }, 400);
	}

	const adminDoc = await Admin.findById(objectId);
	if (!adminDoc) {
		return c.json({ message: "Admin not found" }, 404);
	}

	const user = {
		id: adminDoc._id.toHexString(),
		username: adminDoc.username,
		role: admin.role,
	};

	return SuccessResponse(c, "Fetched admin details", 200, user);
};
