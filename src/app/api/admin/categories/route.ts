import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories, type Category } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await getCategories();
  return NextResponse.json({ success: true, categories });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, category, categories } = body;

    if (action === "save-all" && Array.isArray(categories)) {
      // Full replace
      await saveCategories(categories);
      return NextResponse.json({ success: true, categories });
    }

    const current = await getCategories();

    if (action === "create" && category) {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: category.name,
        icon: category.icon || "tent",
        featured: category.featured ?? false,
        order: current.length + 1,
      };
      await saveCategories([...current, newCat]);
      return NextResponse.json({ success: true, category: newCat });
    }

    if (action === "update" && category?.id) {
      const updated = current.map((c) =>
        c.id === category.id ? { ...c, ...category } : c
      );
      await saveCategories(updated);
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && category?.id) {
      const filtered = current.filter((c) => c.id !== category.id);
      await saveCategories(filtered);
      return NextResponse.json({ success: true });
    }

    if (action === "reorder" && Array.isArray(categories)) {
      const reordered = categories.map((c: Category, i: number) => ({ ...c, order: i + 1 }));
      await saveCategories(reordered);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Categories API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
