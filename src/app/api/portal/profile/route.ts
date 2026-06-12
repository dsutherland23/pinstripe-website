import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, address, city, zipCode } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatedUser = updateUser(email, { name, phone, address, city, zipCode });
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
