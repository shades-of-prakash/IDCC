import bcrypt from "bcryptjs";

async function testBcrypt() {
  const password = "MySecret123!";
  
  // Hash the password
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);

  // Compare password with hash
  const isMatch = await bcrypt.compare(password, hashed);
  console.log("Password matches:", isMatch);
}

testBcrypt();
