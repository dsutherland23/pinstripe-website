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
  status?: "pending" | "confirmed" | "cancelled";
  notes?: string;
  submittedAt: string;
  amountPaid?: number;
  paymentStatus?: "unpaid" | "deposit_paid" | "fully_paid";
  payments?: Array<{ id: string; amount: number; method: string; timestamp: string }>;
}

export interface User {
  email: string;
  passwordHash: string; // Simple hashed/plain password
  name: string;
  phone: string;
  address?: string;
  city?: string;
  zipCode?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  featured: boolean;
  order: number;
}

export interface SiteContent {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    trustPillars: Array<{ value: string; label: string }>;
  };
  stats: Array<{ value: string; label: string; suffix?: string }>;
  footer: {
    phone: string;
    email: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
  };
  navbar: {
    rainCheckText: string;
    dispatchHours: string;
    serviceArea: string;
  };
}

interface DatabaseSchema {
  inventory: RentalItem[];
  bookings: Booking[];
  categories?: Category[];
  siteContent?: SiteContent;
  users?: User[];
  settings?: {
    tentPlannerEnabled: boolean;
    maintenanceMode?: boolean;
    analyticsId?: string;
  };
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Bounce Houses",         icon: "castle",  featured: true,  order: 1 },
  { id: "cat-2", name: "Water Slides",           icon: "water",   featured: true,  order: 2 },
  { id: "cat-3", name: "Tents",                  icon: "tent",    featured: true,  order: 3 },
  { id: "cat-4", name: "Tables",                 icon: "table",   featured: false, order: 4 },
  { id: "cat-5", name: "Chairs",                 icon: "chair",   featured: false, order: 5 },
  { id: "cat-6", name: "Cotton Candy Machines",  icon: "candy",   featured: false, order: 6 },
  { id: "cat-7", name: "Popcorn Machines",        icon: "popcorn", featured: false, order: 7 },
  { id: "cat-8", name: "Photo Booths",            icon: "camera",  featured: false, order: 8 },
];

const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    badge: "America's #1 Rated Event Rentals",
    headline: "Creating Unforgettable Events, One Rental At A Time",
    subheadline: "From premium bounce houses & massive water slides to elegant wedding tents, tables, chairs, and concession machines — Pinstripes delivers everything your event needs.",
    trustPillars: [
      { value: "100%", label: "Sanitised Equipment" },
      { value: "Ontime", label: "Delivery & Setup" },
      { value: "5.0 ★", label: "Customer Rated" },
    ],
  },
  stats: [
    { value: "500", label: "Events Served", suffix: "+" },
    { value: "5.0", label: "Star Rating", suffix: "★" },
    { value: "48", label: "Hour Booking", suffix: "hr" },
    { value: "100", label: "Satisfaction", suffix: "%" },
  ],
  footer: {
    phone: "(757) 749-3407",
    email: "pinstripes@events.com",
    address: "Hampton Roads, Virginia",
    instagramUrl: "https://www.instagram.com/socialkon10_cre8tive/",
    facebookUrl: "https://facebook.com",
  },
  navbar: {
    rainCheckText: "100% Free date shifts & weather protection for all Hampton Roads rentals.",
    dispatchHours: "7:00 AM – 7:00 PM",
    serviceArea: "Serving Norfolk, VA Beach, Chesapeake, Suffolk & surrounding.",
  },
};

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
      categories: DEFAULT_CATEGORIES,
      siteContent: DEFAULT_SITE_CONTENT,
      settings: {
        tentPlannerEnabled: true,
        maintenanceMode: false,
        analyticsId: "",
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
      data.settings = { tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "" };
      modified = true;
    }
    if (!data.categories) {
      data.categories = DEFAULT_CATEGORIES;
      modified = true;
    }
    if (!data.siteContent) {
      data.siteContent = DEFAULT_SITE_CONTENT;
      modified = true;
    }
    if (!data.users) {
      data.users = [];
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
    return { inventory: mockInventory, bookings: [], categories: DEFAULT_CATEGORIES, siteContent: DEFAULT_SITE_CONTENT };
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
export function getSettings(): { tentPlannerEnabled: boolean; maintenanceMode?: boolean; analyticsId?: string } {
  const db = readDb();
  return db.settings || { tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "" };
}

/** Update system settings */
export function updateSettings(updates: { tentPlannerEnabled?: boolean; maintenanceMode?: boolean; analyticsId?: string }) {
  const db = readDb();
  db.settings = { tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "", ...db.settings, ...updates };
  writeDb(db);
}

/** Get all categories */
export function getCategories(): Category[] {
  const db = readDb();
  return (db.categories || DEFAULT_CATEGORIES).sort((a, b) => a.order - b.order);
}

/** Save categories (full replace) */
export function saveCategories(categories: Category[]) {
  const db = readDb();
  db.categories = categories;
  writeDb(db);
}

/** Get site content */
export function getSiteContent(): SiteContent {
  const db = readDb();
  return db.siteContent || DEFAULT_SITE_CONTENT;
}

/** Update site content */
export function updateSiteContent(updates: Partial<SiteContent>) {
  const db = readDb();
  db.siteContent = { ...(db.siteContent || DEFAULT_SITE_CONTENT), ...updates };
  writeDb(db);
}

/** Delete a booking by ID */
export function deleteBooking(id: string): boolean {
  const db = readDb();
  const before = db.bookings.length;
  db.bookings = db.bookings.filter((b) => b.id !== id);
  if (db.bookings.length === before) return false;
  writeDb(db);
  return true;
}

/** Update booking status */
export function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled"): boolean {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  (db.bookings[idx] as any).status = status;
  writeDb(db);
  return true;
}

/** Get all users */
export function getUsers(): User[] {
  const db = readDb();
  return db.users || [];
}

/** Add a new user */
export function addUser(user: User): User {
  const db = readDb();
  if (!db.users) db.users = [];
  db.users.push(user);
  writeDb(db);
  return user;
}

/** Update an existing user */
export function updateUser(email: string, updates: Partial<User>): User | null {
  const db = readDb();
  if (!db.users) return null;
  const idx = db.users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  writeDb(db);
  return db.users[idx];
}

/** Get bookings for a user by email */
export function getUserBookings(email: string): Booking[] {
  return getBookings().filter((b) => b.customer.email.toLowerCase() === email.toLowerCase());
}

/** Process a payment for a booking */
export function updateBookingPayment(id: string, amount: number, method: string): boolean {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  
  const booking = db.bookings[idx];
  const total = booking.estimatedTotal;
  const currentPaid = booking.amountPaid || 0;
  const newPaid = currentPaid + amount;
  
  booking.amountPaid = newPaid;
  
  const payments = booking.payments || [];
  payments.push({
    id: "PAY-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    amount,
    method,
    timestamp: new Date().toISOString()
  });
  booking.payments = payments;
  
  if (newPaid >= total) {
    booking.paymentStatus = "fully_paid";
    booking.status = "confirmed";
  } else if (newPaid > 0) {
    booking.paymentStatus = "deposit_paid";
    booking.status = "confirmed";
  } else {
    booking.paymentStatus = "unpaid";
  }
  
  writeDb(db);
  return true;
}
