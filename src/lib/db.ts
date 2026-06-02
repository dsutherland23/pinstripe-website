import fs from "fs";
import path from "path";
import { mockInventory, RentalItem } from "@/data/mockInventory";

const DATA_DIR = path.join(process.cwd(), "src/data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface Booking {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    type: string;
    date: string;
    location: string;
    guestCount: number;
  };
  delivery: {
    address: string;
    city: string;
    zipCode: string;
  };
  items: Record<string, number>;
  itemCount: number;
  estimatedTotal: number;
  paymentMethod: string;
  notes?: string;
  submittedAt: string;
}

interface DatabaseSchema {
  inventory: RentalItem[];
  bookings: Booking[];
  settings?: {
    tentPlannerEnabled: boolean;
  };
}

/**
 * Ensures the database directory and db.json exist, initialized with seed data.
 */
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      inventory: mockInventory,
      bookings: [
        // Seed database with a couple of mock bookings to test availability functionality
        {
          id: "PSR-SEEDBOOK1",
          customer: {
            name: "John Doe",
            email: "john@example.com",
            phone: "(757) 555-0199",
          },
          event: {
            type: "Wedding reception",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days from now
            location: "Backyard",
            guestCount: 80,
          },
          delivery: {
            address: "123 Ocean Front",
            city: "Virginia Beach",
            zipCode: "23451",
          },
          items: {
            "5": 1, // High-Peak Canopy Tent
            "2": 50, // folding chairs
          },
          itemCount: 51,
          estimatedTotal: 575.0,
          paymentMethod: "Pay in Person",
          notes: "Wedding reception booking.",
          submittedAt: new Date().toISOString(),
        },
      ],
      settings: {
        tentPlannerEnabled: true,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

/** Read database */
export function readDb(): DatabaseSchema {
  ensureDb();
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(content);
    let modified = false;
    if (!data.inventory) {
      data.inventory = mockInventory;
      modified = true;
    }
    if (!data.bookings) {
      data.bookings = [];
      modified = true;
    }
    if (!data.settings) {
      data.settings = { tentPlannerEnabled: true };
      modified = true;
    }
    if (modified) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      } catch (err) {
        console.error("Error writing healed database schema:", err);
      }
    }
    return data;
  } catch (err) {
    console.error("Error reading JSON database:", err);
    return { inventory: mockInventory, bookings: [] };
  }
}

/** Write database */
export function writeDb(data: DatabaseSchema) {
  ensureDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing JSON database:", err);
  }
}

/** Get all inventory items */
export function getInventory(): RentalItem[] {
  return readDb().inventory;
}

/** Update an inventory item's details */
export function updateInventoryItem(id: string, updates: Partial<RentalItem>): RentalItem | null {
  const db = readDb();
  const idx = db.inventory.findIndex((item) => item.id === id);
  if (idx === -1) return null;

  db.inventory[idx] = { ...db.inventory[idx], ...updates };
  writeDb(db);
  return db.inventory[idx];
}

/** Add a new inventory item */
export function addInventoryItem(item: RentalItem): RentalItem {
  const db = readDb();
  db.inventory.push(item);
  writeDb(db);
  return item;
}

/** Delete an inventory item */
export function deleteInventoryItem(id: string): boolean {
  const db = readDb();
  const initialLength = db.inventory.length;
  db.inventory = db.inventory.filter((item) => item.id !== id);
  if (db.inventory.length === initialLength) return false;
  writeDb(db);
  return true;
}

/** Get all bookings */
export function getBookings(): Booking[] {
  return readDb().bookings;
}

/** Add a booking */
export function addBooking(booking: Booking): Booking {
  const db = readDb();
  db.bookings.push(booking);
  writeDb(db);
  return booking;
}

/** Get booking by ID */
export function getBookingById(id: string): Booking | null {
  return getBookings().find((b) => b.id === id) || null;
}

/**
 * Calculates dynamic availability for a specific item on a given date.
 * Returns the quantity available to rent (maxStock - currentlyRentedOnDate).
 */
export function getItemAvailability(itemId: string, date: string): { totalStock: number; rented: number; available: number } {
  const db = readDb();
  const item = db.inventory.find((i) => i.id === itemId);
  if (!item) {
    return { totalStock: 0, rented: 0, available: 0 };
  }

  // Max stock in database is represented as quantity limits.
  // Standard items can be customized by adding a maxStock property or deriving.
  // Let's support a default capacity limit (e.g. canopy tent has max stock 5, chairs 500, slides 3, etc.)
  // Let's set standard limits for items based on their category:
  // Chairs: 500, Tables: 50, Tents: 5, Slides: 3, machines: 5
  let totalStock = 5;
  if (item.category === "Chairs") totalStock = 500;
  else if (item.category === "Tables") totalStock = 50;
  else if (item.category === "Tents") totalStock = 8;
  else if (item.category === "Bounce Houses" || item.category === "Water Slides") totalStock = 3;

  // Let's check if the item already has a custom quantity property or override
  // (We'll support an optional 'stock' property on the RentalItem interface)
  const itemWithStock = item as any;
  if (typeof itemWithStock.stock === "number") {
    totalStock = itemWithStock.stock;
  }

  // Count quantities already booked for this date
  let rented = 0;
  db.bookings.forEach((booking) => {
    if (booking.event.date === date && booking.items[itemId]) {
      rented += booking.items[itemId];
    }
  });

  return {
    totalStock,
    rented,
    available: Math.max(0, totalStock - rented),
  };
}

/** Get all system settings */
export function getSettings(): { tentPlannerEnabled: boolean } {
  const db = readDb();
  return db.settings || { tentPlannerEnabled: true };
}

/** Update system settings */
export function updateSettings(updates: { tentPlannerEnabled: boolean }) {
  const db = readDb();
  db.settings = { ...db.settings, ...updates };
  writeDb(db);
}
