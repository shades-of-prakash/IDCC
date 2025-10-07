import { AdminCreateSchema } from "./src/validators/admin.validator";

const payload = { username: "alice", password: "snehal" };

const valid = AdminCreateSchema.parse(payload);

console.log(valid);
