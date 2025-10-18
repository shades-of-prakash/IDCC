
import bcrypt from "bcryptjs";
const pw = "ssk";

const hashed = bcrypt.hashSync(pw, 10);

console.log("Password:", pw);
console.log("Hashed:", hashed);
