import { NextRequest, NextResponse } from "next/server";
import { getBookings, deleteBooking, updateBookingStatus, addBooking, getInventory } from "@/lib/db";

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "pinstripes2024";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-admin-passcode") === ADMIN_PASSCODE;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = getBookings();
  return NextResponse.json({ success: true, bookings });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, id, status } = body;

    if (action === "delete" && id) {
      const deleted = deleteBooking(id);
      if (!deleted) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "update-status" && id && status) {
      const updated = updateBookingStatus(id, status);
      if (!updated) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "create" && body.booking) {
      const { customer, event, delivery, items, notes } = body.booking;

      // Calculate itemCount and estimatedTotal dynamically
      const inventory = getInventory();
      let itemCount = 0;
      let estimatedTotal = 0;

      for (const [itemId, qty] of Object.entries(items || {})) {
        const item = inventory.find((i) => i.id === itemId);
        const quantity = Number(qty);
        if (item && quantity > 0) {
          itemCount += quantity;
          estimatedTotal += item.price * quantity;
        }
      }

      const newBooking = {
        id: body.booking.id || "PSR-MANUAL-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customer: {
          name: customer?.name || "Offline Block",
          email: customer?.email || "admin@pinstripe.com",
          phone: customer?.phone || "(757) 200-2600",
        },
        event: {
          type: event?.type || "Offline Block",
          date: event?.date || new Date().toISOString().split("T")[0],
          location: event?.location || "Warehouse / Storage",
          guestCount: Number(event?.guestCount || 0),
        },
        delivery: {
          address: delivery?.address || "N/A",
          city: delivery?.city || "N/A",
          zipCode: delivery?.zipCode || "N/A",
        },
        items: items || {},
        itemCount,
        estimatedTotal,
        paymentMethod: body.booking.paymentMethod || "Offline Block",
        status: body.booking.status || "confirmed",
        notes: notes || "Manual offline block/booking created from admin panel.",
        submittedAt: new Date().toISOString(),
      };

      addBooking(newBooking);
      return NextResponse.json({ success: true, booking: newBooking });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Bookings API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
