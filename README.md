ev
To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

import { randomBytes, subtle, timingSafeEqual } from "crypto";

const ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const HASH_ALGO = "SHA-256";

/**
 * Create password hash for storage
 */
export async function createPasswordHash(
  username: string,
  password: string
): Promise<{ username: string; passwordHash: string }> {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  const salt = randomBytes(16);
  const enc = new TextEncoder();

  const key = await subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGO,
    },
    key,
    KEY_LENGTH
  );

  const hash = Buffer.from(derivedBits);

  return {
    username,
    passwordHash: `${salt.toString("hex")}:${hash.toString("hex")}`,
  };
}
