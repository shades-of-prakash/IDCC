import type { Context } from "hono";
import User from "../../models/user.model.js";
import { createHash, randomBytes } from "crypto";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

export const generatePassword = (length = 10) => {
  const charset =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

  const randomBuffer = randomBytes(length);

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[randomBuffer[i] % charset.length];
  }

  return password;
};

export const createUsers = async (c: Context) => {
  try {
    const { number, contestId, contestName } = await c.req.json();

    if (!contestId) return ErrorResponse(c, "Contest ID is required", 400);

    const num = parseInt(number);
    if (isNaN(num) || num <= 0 || num > 1000) {
      return ErrorResponse(c, "Invalid number (1-1000)", 400);
    }

    const contestCode =
      contestName?.slice(0, 3).toUpperCase() ||
      contestId.slice(-3).toUpperCase();

    const lastUser = await User.findOne({ contestId }).sort({ _id: -1 }).lean();

    let lastIndex = 0;

    if (lastUser?.username) {
      const match = lastUser.username.match(/\d+$/);
      if (match) lastIndex = parseInt(match[0]);
    }

    // Now continue numbering
    const usersToInsert = [];
    const responseUsers = [];

    for (let i = 0; i < num; i++) {
      const index = lastIndex + i + 1;
      const username = `u${contestCode}${index}`;
      const password = generatePassword();
      const hash = hashPassword(password);

      usersToInsert.push({ username, hash, contestId });
      responseUsers.push({ username, password });
    }

    await User.insertMany(usersToInsert, { ordered: false });

    return SuccessResponse(c, "Users created successfully", 200, {
      users: responseUsers,
    });
  } catch (err: any) {
    console.error("❌ createUsers error:", err);
    if (err.code === 11000) {
      return ErrorResponse(c, "Username conflict, please retry", 409);
    }
    return ErrorResponse(c, err.message || "Failed to create users", 500);
  }
};
