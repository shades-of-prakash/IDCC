import { randomBytes, subtle } from "crypto";

export async function hashPassword(password: string) {
  const salt = randomBytes(16); 
  const enc = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256
  );
  const hash = Buffer.from(derivedBits);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const enc = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256
  );
  const hash = Buffer.from(derivedBits);
  return hash.toString("hex") === hashHex;
}

// const run = async () => {
// 	const hashed = await hashPassword("snehal@344");
// 	console.log("Hashed password:", hashed);
// };
  
// run();
  