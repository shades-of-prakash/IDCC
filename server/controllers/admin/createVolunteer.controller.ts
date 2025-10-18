import type { Context } from "hono";
import bcrypt from "bcryptjs";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

export const createVolunteer = async (c: Context) => {
  try {
    const { username, name, password, confirmPassword } = await c.req.json();

    console.log(username,name,password,confirmPassword,"comformingng")

    if (!username || !name || !password || !confirmPassword) {
      return ErrorResponse(c, "All fields are required", 400);
    }

    if (password !== confirmPassword) {
      return ErrorResponse(c, "Passwords do not match", 400);
    }

    const existingUser = await Admin.findOne({ username, role: "volunteer" });

    console.log(existingUser,"existing")
    if (existingUser) {
      return ErrorResponse(c, "Username already exists", 409);
    }

    console.log("Raw password:", password);

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword,"hashhhh")

    const newVolunteer = new Admin({
      name,
      username,
      password: hashedPassword,
      role: "volunteer",
    });

  console.log(newVolunteer,"hjoooooo")
    await newVolunteer.save();

    return SuccessResponse(c, "Volunteer created successfully", 201, {
      id: newVolunteer._id,
      name: newVolunteer.name,
      username: newVolunteer.username,
      role: newVolunteer.role,
    });
  } catch (err) {
    console.error("Error creating volunteer:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
