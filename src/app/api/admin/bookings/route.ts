import { NextRequest, NextResponse } from "next/server";
import { getBookings, deleteBooking, updateBookingStatus, addBooking, getInventory, updateBookingPayment } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/auth-security";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await getBookings();
  return NextResponse.json({ success: true, bookings });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, id, status } = body;

    if (action === "delete" && id) {
      const deleted = await deleteBooking(id);
      if (!deleted) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "update-status" && id && status) {
      const updated = await updateBookingStatus(id, status);
      if (!updated) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "record-payment" && id && body.amount && body.method) {
      const amountNum = parseFloat(body.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
      }
      const updated = await updateBookingPayment(id, amountNum, body.method, body.paymentId);
      if (!updated) {
        return NextResponse.json({ error: "Booking not found or update failed" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "create" && body.booking) {
      const { customer, event, delivery, items, notes, discount: bodyDiscount } = body.booking;

      // Calculate itemCount and estimatedTotal dynamically
      const inventory = await getInventory();
      let itemCount = 0;
      let subtotal = 0;

      for (const [itemId, qty] of Object.entries(items || {})) {
        const item = inventory.find((i) => i.id === itemId);
        const quantity = Number(qty);
        if (item && quantity > 0) {
          itemCount += quantity;
          subtotal += item.price * quantity;
        }
      }

      const discount = Number(bodyDiscount) || 0;
      const estimatedTotal = Math.max(0, subtotal - discount);

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
        discount,
        paymentMethod: body.booking.paymentMethod || "Offline Block",
        status: body.booking.status || "confirmed",
        notes: notes || "Manual offline block/booking created from admin panel.",
        submittedAt: new Date().toISOString(),
      };

      await addBooking(newBooking);
      return NextResponse.json({ success: true, booking: newBooking });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Bookings API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
