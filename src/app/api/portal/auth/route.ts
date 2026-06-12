import { NextRequest, NextResponse } from "next/server";
import { getUsers, addUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, phone, address, city, zipCode } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const emailClean = email.trim().toLowerCase();
    const users = getUsers();

    if (action === "signup") {
      const exists = users.some((u) => u.email.toLowerCase() === emailClean);
      if (exists) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
      }

      // In a real application, we would salt and hash the password (e.g. using bcrypt).
      // Here we store a simple mock hash for demonstration, ensuring the raw password is not plain text in the json db.
      const mockHash = Buffer.from(password).toString("base64");

      const newUser = {
        email: emailClean,
        passwordHash: mockHash,
        name: name || emailClean.split("@")[0],
        phone: phone || "",
        address: address || "",
        city: city || "",
        zipCode: zipCode || "",
      };

      addUser(newUser);
      
      // Return user details without passwordHash
      const { passwordHash: _, ...userWithoutPassword } = newUser;
      return NextResponse.json({ success: true, user: userWithoutPassword });
    }

    if (action === "login") {
      const user = users.find((u) => u.email.toLowerCase() === emailClean);
      if (!user) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const checkHash = Buffer.from(password).toString("base64");
      if (user.passwordHash !== checkHash) {
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
