import { NextRequest, NextResponse } from "next/server";
import { getUsers, addUser, updateUser } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, phone, address, city, zipCode } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const users = await getUsers();

    if (action === "signup") {
      const exists = users.some((u) => u.email.toLowerCase() === emailClean);
      if (exists) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      // Salt and hash the password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      const bcryptHash = await bcrypt.hash(password, salt);

      const newUser = {
        email: emailClean,
        passwordHash: bcryptHash,
        name: name || emailClean.split("@")[0],
        phone: phone || "",
        address: address || "",
        city: city || "",
        zipCode: zipCode || "",
      };

      await addUser(newUser);

      // Return user details without passwordHash
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }

    if (action === "login") {
      const user = users.find((u) => u.email.toLowerCase() === emailClean);
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // Check if user is using a bcrypt hash
      const isBcrypt = user.passwordHash.startsWith("$2a$") || 
                       user.passwordHash.startsWith("$2b$") || 
                       user.passwordHash.startsWith("$2y$");
      let isMatch = false;

      if (isBcrypt) {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } else {
        // Fallback check for legacy Base64 hashes
        const legacyHash = Buffer.from(password).toString("base64");
        isMatch = user.passwordHash === legacyHash;

        // If matched, migrate the user's password to bcrypt automatically
        if (isMatch) {
          try {
            const salt = await bcrypt.genSalt(10);
            const newBcryptHash = await bcrypt.hash(password, salt);
            await updateUser(user.email, { passwordHash: newBcryptHash });
            console.log(`Successfully migrated legacy password hash to bcrypt for user: ${user.email}`);
          } catch (migrateErr) {
            console.error(`Failed to migrate legacy password hash for user: ${user.email}`, migrateErr);
            // Don't fail the login if migration fails, as long as authentication was correct.
          }
        }
      }

      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
