import { sign, verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

const JWT_SECRET =
	process.env.JWT_SECRET ||
	"7ce5073efc5fd2e1146b15bf9638243e1bade392e9ff359d4f34345ec07ab3f3";

// export async function signToken(payload: object, expiresIn = "1h") {
// 	return await sign(payload as JWTPayload, JWT_SECRET, expiresIn);
// }

export async function verifyToken(token: string) {
	try {
		const payload = await verify(token, JWT_SECRET);
		return { valid: true, payload };
	} catch (err) {
		return { valid: false, error: "Invalid or expired token" };
	}
}
