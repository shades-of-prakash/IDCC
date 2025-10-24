import type { Context, Next } from "hono";
import { getSignedCookie } from "hono/cookie";

const COOKIE_SECRET =
  process.env.COOKIE_SECRET ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

const  getCookie=async (c:Context,cookieName:string)=>{
  return  await getSignedCookie(c, COOKIE_SECRET,cookieName);
}

export const getAuthUser = async (c: Context, next: Next) => {
  try {

    const cookieNames=["adminAuth","coordinatorAuth","volunteerAuth"];

    let cookie=null;

    for (const cookieName of cookieNames) {
      cookie = await getCookie(c, cookieName);
      if (cookie) {
        break;
      }
    }
    

    if (!cookie) {
      return c.json({ success: false, message: "Unauthorized: No cookie found" }, 401);
    }

    const user = JSON.parse(cookie);
    if (!user?.id || !user?.role) {
      return c.json({ success: false, message: "Unauthorized: Invalid cookie" }, 401);
    }

    c.set("user", user);
    await next();
  } catch (err) {
    console.error("Error verifying cookie:", err);
    return c.json({ success: false, message: "Unauthorized: Invalid signature" }, 401);
  }
};


export const checkRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    console.log(user,"coming ")
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json(
        { success: false, message: `Forbidden: Requires role ${allowedRoles.join(" or ")}` },
        403
      );
    }
    await next();
  };
};

export const checkAdmin = checkRole(["admin"]);

export const checkAdminOrCoordinator = checkRole(["admin", "coordinator"]);

export const checkCoordinatorOrVolunteer = checkRole(["coordinator", "volunteer"]);
