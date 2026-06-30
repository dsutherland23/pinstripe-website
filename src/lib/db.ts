import mysql from "mysql2/promise";
import { mockInventory, RentalItem } from "@/data/mockInventory";
import { config } from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables in production since standalone Next.js does not load .env files automatically
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });


// ─── Types (unchanged public API) ────────────────────────────────────────────

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
  hasUnreadMessages?: boolean;
  discount?: number;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: "customer" | "admin";
  text: string;
  mediaUrl?: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface User {
  email: string;
  passwordHash: string;
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

// ─── Connection Pool ──────────────────────────────────────────────────────────

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    const dbHost = process.env.DB_HOST;
    const dbName = process.env.DB_NAME;
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASS;

    if (!dbHost || !dbName || !dbUser) {
      const missing = [];
      if (!dbHost) missing.push("DB_HOST");
      if (!dbName) missing.push("DB_NAME");
      if (!dbUser) missing.push("DB_USER");
      throw new Error(`CRITICAL: Database configuration environment variables are missing: ${missing.join(", ")}`);
    }

    const socketPath = process.env.DB_SOCKET || "/var/lib/mysql/mysql.sock";
    // When host is 'localhost', use Unix socket to avoid IPv6 resolution issues.
    const useSocket = dbHost === "localhost";
    pool = mysql.createPool({
      ...(useSocket
        ? { socketPath }
        : { host: dbHost, port: parseInt(process.env.DB_PORT || "3306", 10) }),
      database: dbName,
      user: dbUser,
      password: dbPass ?? "",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Automatically parse JSON columns from MySQL 5.7+
      typeCast(field, next) {
        if (field.type === "JSON") {
          const val = field.string();
          if (val === null) return null;
          try { return JSON.parse(val); } catch { return val; }
        }
        return next();
      },
    });
  }
  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function query<T = unknown>(sql: string, values?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(sql, values);
  return rows as unknown as T[];
}

// ─── Table Initialisation (idempotent) ───────────────────────────────────────

export async function initDb(): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id          VARCHAR(64)  NOT NULL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        category    VARCHAR(128) NOT NULL,
        description TEXT         NOT NULL,
        price       DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        availability TINYINT(1)  NOT NULL DEFAULT 1,
        dimensions  VARCHAR(255) NOT NULL DEFAULT '',
        capacity    VARCHAR(255) NOT NULL DEFAULT '',
        image       VARCHAR(512) NOT NULL DEFAULT '',
        rating      DECIMAL(3,1) NOT NULL DEFAULT 5.0,
        reviews     INT          NOT NULL DEFAULT 0,
        stock       INT          NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id               VARCHAR(64)   NOT NULL PRIMARY KEY,
        customer         JSON          NOT NULL,
        event_data       JSON          NOT NULL,
        delivery         JSON          NOT NULL,
        items            JSON          NOT NULL,
        item_count       INT           NOT NULL DEFAULT 0,
        estimated_total  DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method   VARCHAR(128)  NOT NULL DEFAULT '',
        status           ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
        notes            TEXT,
        submitted_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount_paid      DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_status   ENUM('unpaid','deposit_paid','fully_paid') NOT NULL DEFAULT 'unpaid',
        payments         JSON,
        discount         DECIMAL(10,2) NOT NULL DEFAULT 0.00
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await conn.query("ALTER TABLE bookings ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    } catch (err) {
      // Ignore if column already exists
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id       VARCHAR(64)  NOT NULL PRIMARY KEY,
        name     VARCHAR(128) NOT NULL,
        icon     VARCHAR(64)  NOT NULL DEFAULT '',
        featured TINYINT(1)   NOT NULL DEFAULT 0,
        \`order\` INT          NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        id      INT         NOT NULL PRIMARY KEY DEFAULT 1,
        content JSON        NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id                   INT        NOT NULL PRIMARY KEY DEFAULT 1,
        tent_planner_enabled TINYINT(1) NOT NULL DEFAULT 1,
        maintenance_mode     TINYINT(1) NOT NULL DEFAULT 0,
        analytics_id         VARCHAR(128) NOT NULL DEFAULT '',
        pay_in_person_enabled TINYINT(1) NOT NULL DEFAULT 1,
        gallery_enabled       TINYINT(1) NOT NULL DEFAULT 1,
        categories_enabled    TINYINT(1) NOT NULL DEFAULT 1,
        featured_rentals_enabled TINYINT(1) NOT NULL DEFAULT 1,
        deposit_enabled       TINYINT(1) NOT NULL DEFAULT 1,
        deposit_percentage    INT NOT NULL DEFAULT 50,
        promo_codes           JSON
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN pay_in_person_enabled TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN gallery_enabled TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN categories_enabled TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN featured_rentals_enabled TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN deposit_enabled TINYINT(1) NOT NULL DEFAULT 1");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN deposit_percentage INT NOT NULL DEFAULT 50");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("ALTER TABLE settings ADD COLUMN promo_codes JSON");
    } catch (err) {
      // Ignore if column already exists
    }

    try {
      await conn.query("UPDATE settings SET promo_codes = '[{\"code\":\"WELCOME10\",\"type\":\"percent\",\"value\":10},{\"code\":\"VIP50\",\"type\":\"percent\",\"value\":50},{\"code\":\"ONSITE20\",\"type\":\"percent\",\"value\":20}]' WHERE promo_codes IS NULL");
    } catch (err) {
      // Ignore
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        email         VARCHAR(255) NOT NULL PRIMARY KEY,
        password_hash VARCHAR(512) NOT NULL,
        name          VARCHAR(255) NOT NULL DEFAULT '',
        phone         VARCHAR(64)  NOT NULL DEFAULT '',
        address       VARCHAR(512),
        city          VARCHAR(128),
        zip_code      VARCHAR(32)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id            VARCHAR(64)  NOT NULL PRIMARY KEY,
        booking_id    VARCHAR(64)  NOT NULL,
        sender_id     VARCHAR(255) NOT NULL,
        sender_role   ENUM('customer','admin') NOT NULL,
        text          TEXT         NOT NULL,
        media_url     VARCHAR(512),
        timestamp     VARCHAR(64)  NOT NULL,
        status        ENUM('sent','delivered','read') NOT NULL DEFAULT 'sent',
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default data: unconditionally run INSERT IGNORE for mock items and categories
    for (const item of mockInventory) {
      await conn.query(
        `INSERT IGNORE INTO inventory
          (id, title, category, description, price, deposit_amount, availability, dimensions, capacity, image, rating, reviews, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.title,
          item.category,
          item.description,
          item.price ?? 0,
          item.depositAmount ?? 0,
          item.availability ? 1 : 0,
          item.dimensions ?? "",
          item.capacity ?? "",
          item.image ?? "",
          item.rating ?? 5.0,
          item.reviews ?? 0,
          item.stock ?? null
        ]
      );
    }

    const DEFAULT_CATEGORIES: Category[] = [
      { id: "cat-1", name: "Bounce Houses",        icon: "castle",  featured: true,  order: 1 },
      { id: "cat-2", name: "Water Slides",          icon: "water",   featured: true,  order: 2 },
      { id: "cat-3", name: "Tents",                 icon: "tent",    featured: true,  order: 3 },
      { id: "cat-4", name: "Tables",                icon: "table",   featured: false, order: 4 },
      { id: "cat-5", name: "Chairs",                icon: "chair",   featured: false, order: 5 },
      { id: "cat-6", name: "Cotton Candy Machines", icon: "candy",   featured: false, order: 6 },
      { id: "cat-7", name: "Popcorn Machines",      icon: "popcorn", featured: false, order: 7 },
      { id: "cat-8", name: "Photo Booths",          icon: "camera",  featured: false, order: 8 },
      { id: "cat-9", name: "Snow-cone Machines",    icon: "ice",     featured: false, order: 9 },
      { id: "cat-10", name: "Products",             icon: "shopping-bag", featured: false, order: 10 },
    ];
    for (const cat of DEFAULT_CATEGORIES) {
      await conn.query(
        "INSERT IGNORE INTO categories (id, name, icon, featured, `order`) VALUES (?, ?, ?, ?, ?)",
        [cat.id, cat.name, cat.icon, cat.featured ? 1 : 0, cat.order]
      );
    }

    const [scCount] = await conn.query<mysql.RowDataPacket[]>("SELECT COUNT(*) as c FROM site_content");
    if ((scCount as mysql.RowDataPacket[])[0].c === 0) {
      const DEFAULT_SITE_CONTENT: SiteContent = {
        hero: {
          badge: "America's #1 Rated Event Rentals",
          headline: "Creating Unforgettable Events, One Rental At A Time",
          subheadline:
            "From premium bounce houses & massive water slides to elegant wedding tents, tables, chairs, and concession machines — Pinstripes delivers everything your event needs.",
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
      await conn.query("INSERT IGNORE INTO site_content (id, content) VALUES (1, ?)", [
        JSON.stringify(DEFAULT_SITE_CONTENT),
      ]);
    }

    const [setCount] = await conn.query<mysql.RowDataPacket[]>("SELECT COUNT(*) as c FROM settings");
    if ((setCount as mysql.RowDataPacket[])[0].c === 0) {
      await conn.query(
        "INSERT IGNORE INTO settings (id, tent_planner_enabled, maintenance_mode, analytics_id, pay_in_person_enabled, gallery_enabled, categories_enabled, featured_rentals_enabled, deposit_enabled, deposit_percentage, promo_codes) VALUES (1, 1, 0, '', 1, 1, 1, 1, 1, 50, '[{\"code\":\"WELCOME10\",\"type\":\"percent\",\"value\":10},{\"code\":\"VIP50\",\"type\":\"percent\",\"value\":50},{\"code\":\"ONSITE20\",\"type\":\"percent\",\"value\":20}]')"
      );
    }
  } finally {
    conn.release();
  }
}

// ─── Helper: ensure DB is seeded before every operation ──────────────────────

let _initialized = false;
async function ensureInit() {
  if (!_initialized) {
    await initDb();
    _initialized = true;
  }
}

// ─── Resilient In-Memory Fallback Store ──────────────────────────────────────

let useFallback = false;

const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    badge: "America's #1 Rated Event Rentals",
    headline: "Creating Unforgettable Events, One Rental At A Time",
    subheadline:
      "From premium bounce houses & massive water slides to elegant wedding tents, tables, chairs, and concession machines — Pinstripes delivers everything your event needs.",
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

const fallbackStore = {
  inventory: [...mockInventory],
  categories: [
    { id: "cat-1", name: "Bounce Houses",        icon: "castle",  featured: true,  order: 1 },
    { id: "cat-2", name: "Water Slides",          icon: "water",   featured: true,  order: 2 },
    { id: "cat-3", name: "Tents",                 icon: "tent",    featured: true,  order: 3 },
    { id: "cat-4", name: "Tables",                icon: "table",   featured: false, order: 4 },
    { id: "cat-5", name: "Chairs",                icon: "chair",   featured: false, order: 5 },
    { id: "cat-6", name: "Cotton Candy Machines", icon: "candy",   featured: false, order: 6 },
    { id: "cat-7", name: "Popcorn Machines",      icon: "popcorn", featured: false, order: 7 },
    { id: "cat-8", name: "Photo Booths",          icon: "camera",  featured: false, order: 8 },
    { id: "cat-9", name: "Snow-cone Machines",    icon: "ice",     featured: false, order: 9 },
    { id: "cat-10", name: "Products",             icon: "shopping-bag", featured: false, order: 10 },
  ],
  siteContent: { ...DEFAULT_SITE_CONTENT },
  settings: { 
    tentPlannerEnabled: true, 
    maintenanceMode: false, 
    analyticsId: "", 
    payInPersonEnabled: true, 
    galleryEnabled: true, 
    categoriesEnabled: true, 
    featuredRentalsEnabled: true, 
    depositEnabled: true, 
    depositPercentage: 50,
    promoCodes: [
      { code: "WELCOME10", type: "percent" as "percent" | "flat", value: 10 },
      { code: "VIP50", type: "percent" as "percent" | "flat", value: 50 },
      { code: "ONSITE20", type: "percent" as "percent" | "flat", value: 20 }
    ]
  },
  bookings: [] as Booking[],
  users: [] as User[],
  messages: [] as Message[],
};

// Resolve local JSON fallback path
const DB_JSON_PATH = path.resolve(process.cwd(), "src/data/db.json");

// Eagerly load fallbackStore data from db.json if database is offline/fallback mode is active
try {
  if (fs.existsSync(DB_JSON_PATH)) {
    const raw = fs.readFileSync(DB_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.inventory) fallbackStore.inventory = parsed.inventory;
    if (parsed.categories) fallbackStore.categories = parsed.categories;
    if (parsed.siteContent) fallbackStore.siteContent = parsed.siteContent;
    if (parsed.settings) fallbackStore.settings = parsed.settings;
    if (parsed.bookings) fallbackStore.bookings = parsed.bookings;
    if (parsed.users) fallbackStore.users = parsed.users;
    if (parsed.messages) fallbackStore.messages = parsed.messages;
    console.log("💾 Loaded fallback database from local JSON file.");
  }
} catch (err) {
  console.error("⚠️ Failed to load local JSON fallback database:", err);
}

// Persist fallbackStore changes to db.json
function saveFallbackStore() {
  try {
    const raw = JSON.stringify(fallbackStore, null, 2);
    fs.writeFileSync(DB_JSON_PATH, raw, "utf8");
    console.log("💾 Saved fallback database to local JSON file.");
  } catch (err) {
    console.error("⚠️ Failed to save local JSON fallback database:", err);
  }
}

// ─── Inventory ────────────────────────────────────────────────────────────────

type InventoryRow = {
  id: string; title: string; category: string; description: string;
  price: number; deposit_amount: number; availability: number;
  dimensions: string; capacity: string; image: string;
  rating: number; reviews: number; stock: number | null;
};

function rowToItem(r: InventoryRow): RentalItem {
  return {
    id: r.id, title: r.title, category: r.category, description: r.description,
    price: Number(r.price), depositAmount: Number(r.deposit_amount),
    availability: Boolean(r.availability),
    dimensions: r.dimensions, capacity: r.capacity, image: r.image,
    rating: Number(r.rating), reviews: r.reviews,
    ...(r.stock !== null ? { stock: r.stock } : {}),
  };
}

export async function getInventory(): Promise<RentalItem[]> {
  if (useFallback) return fallbackStore.inventory;
  try {
    await ensureInit();
    const rows = await query<InventoryRow>("SELECT * FROM inventory ORDER BY CAST(id AS UNSIGNED)");
    return rows.map(rowToItem);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory inventory store.", err);
    useFallback = true;
    return fallbackStore.inventory;
  }
}

export async function updateInventoryItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem | null> {
  if (useFallback) {
    const idx = fallbackStore.inventory.findIndex(item => item.id === id);
    if (idx === -1) return null;
    fallbackStore.inventory[idx] = { ...fallbackStore.inventory[idx], ...updates };
    saveFallbackStore();
    return fallbackStore.inventory[idx];
  }
  try {
    await ensureInit();
    const fieldMap: Record<string, string> = {
      title: "title", category: "category", description: "description",
      price: "price", depositAmount: "deposit_amount", availability: "availability",
      dimensions: "dimensions", capacity: "capacity", image: "image",
      rating: "rating", reviews: "reviews", stock: "stock",
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, val] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = ?`);
      values.push(key === "availability" ? (val ? 1 : 0) : (val ?? null));
    }
    if (setClauses.length === 0) return null;
    values.push(id);
    await query(`UPDATE inventory SET ${setClauses.join(", ")} WHERE id = ?`, values);
    const rows = await query<InventoryRow>("SELECT * FROM inventory WHERE id = ?", [id]);
    return rows.length ? rowToItem(rows[0]) : null;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateInventoryItem(id, updates);
  }
}

export async function addInventoryItem(item: RentalItem): Promise<RentalItem> {
  if (useFallback) {
    fallbackStore.inventory.push(item);
    saveFallbackStore();
    return item;
  }
  try {
    await ensureInit();
    await query(
      `INSERT INTO inventory (id, title, category, description, price, deposit_amount, availability, dimensions, capacity, image, rating, reviews, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.title,
        item.category,
        item.description,
        item.price ?? 0,
        item.depositAmount ?? 0,
        item.availability ? 1 : 0,
        item.dimensions ?? "",
        item.capacity ?? "",
        item.image ?? "",
        item.rating ?? 5.0,
        item.reviews ?? 0,
        item.stock ?? null
      ]
    );
    return item;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return addInventoryItem(item);
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  if (useFallback) {
    const before = fallbackStore.inventory.length;
    fallbackStore.inventory = fallbackStore.inventory.filter(item => item.id !== id);
    const affected = fallbackStore.inventory.length < before;
    if (affected) saveFallbackStore();
    return affected;
  }
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>("DELETE FROM inventory WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return deleteInventoryItem(id);
  }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

type BookingRow = {
  id: string; customer: Booking["customer"]; event_data: Booking["event"];
  delivery: Booking["delivery"]; items: Record<string, number>;
  item_count: number; estimated_total: number; payment_method: string;
  status: Booking["status"]; notes: string | null; submitted_at: Date | string;
  amount_paid: number; payment_status: Booking["paymentStatus"];
  payments: Booking["payments"] | null;
  discount: number;
};

function safeParseJson<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

function rowToBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    customer: safeParseJson(r.customer, { name: "", email: "", phone: "" }),
    event: safeParseJson(r.event_data, { type: "", date: "", location: "", guestCount: 0 }),
    delivery: safeParseJson(r.delivery, { address: "", city: "", zipCode: "" }),
    items: safeParseJson(r.items, {}),
    itemCount: r.item_count,
    estimatedTotal: Number(r.estimated_total),
    paymentMethod: r.payment_method,
    status: r.status,
    notes: r.notes ?? undefined,
    submittedAt: r.submitted_at instanceof Date
      ? r.submitted_at.toISOString()
      : String(r.submitted_at),
    amountPaid: Number(r.amount_paid),
    paymentStatus: r.payment_status,
    payments: safeParseJson(r.payments, null) ?? undefined,
    discount: Number(r.discount ?? 0),
  };
}

export async function getBookings(): Promise<Booking[]> {
  if (useFallback) {
    return fallbackStore.bookings.map(b => {
      const hasUnread = fallbackStore.messages.some(
        m => m.bookingId === b.id && m.senderRole === "customer" && m.status !== "read"
      );
      return { ...b, hasUnreadMessages: hasUnread };
    });
  }
  try {
    await ensureInit();
    const rows = await query<BookingRow>("SELECT * FROM bookings ORDER BY submitted_at DESC");
    const bookings = rows.map(rowToBooking);
    
    // Fetch bookings with unread customer messages
    const unreadRows = await query<{ booking_id: string }>(
      "SELECT DISTINCT booking_id FROM messages WHERE sender_role = 'customer' AND status != 'read'"
    );
    const unreadBookingIds = new Set(unreadRows.map(r => r.booking_id));
    
    return bookings.map(b => ({
      ...b,
      hasUnreadMessages: unreadBookingIds.has(b.id)
    }));
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return fallbackStore.bookings.map(b => {
      const hasUnread = fallbackStore.messages.some(
        m => m.bookingId === b.id && m.senderRole === "customer" && m.status !== "read"
      );
      return { ...b, hasUnreadMessages: hasUnread };
    });
  }
}

export async function addBooking(booking: Booking): Promise<Booking> {
  if (useFallback) {
    fallbackStore.bookings.push(booking);
    saveFallbackStore();
    return booking;
  }
  try {
    await ensureInit();
    await query(
      `INSERT INTO bookings
        (id, customer, event_data, delivery, items, item_count, estimated_total,
         payment_method, status, notes, submitted_at, amount_paid, payment_status, payments, discount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        JSON.stringify(booking.customer ?? null),
        JSON.stringify(booking.event ?? null),
        JSON.stringify(booking.delivery ?? null),
        JSON.stringify(booking.items ?? {}),
        booking.itemCount ?? 0,
        booking.estimatedTotal ?? 0,
        booking.paymentMethod ?? "",
        booking.status ?? "pending",
        booking.notes ?? null,
        booking.submittedAt ?? new Date().toISOString(),
        booking.amountPaid ?? 0,
        booking.paymentStatus ?? "unpaid",
        booking.payments ? JSON.stringify(booking.payments) : null,
        booking.discount ?? 0,
      ]
    );
    return booking;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return addBooking(booking);
  }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (useFallback) {
    return fallbackStore.bookings.find(b => b.id === id) || null;
  }
  try {
    await ensureInit();
    const rows = await query<BookingRow>("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows.length ? rowToBooking(rows[0]) : null;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return getBookingById(id);
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  if (useFallback) {
    const before = fallbackStore.bookings.length;
    fallbackStore.bookings = fallbackStore.bookings.filter(b => b.id !== id);
    const affected = fallbackStore.bookings.length < before;
    if (affected) saveFallbackStore();
    return affected;
  }
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>(
      "DELETE FROM bookings WHERE id = ?", [id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return deleteBooking(id);
  }
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<boolean> {
  if (useFallback) {
    const b = fallbackStore.bookings.find(x => x.id === id);
    if (!b) return false;
    b.status = status;
    saveFallbackStore();
    return true;
  }
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>(
      "UPDATE bookings SET status = ? WHERE id = ?", [status, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateBookingStatus(id, status);
  }
}

export async function updateBookingPayment(
  id: string,
  amount: number,
  method: string,
  paymentId?: string
): Promise<boolean> {
  if (useFallback) {
    const booking = fallbackStore.bookings.find(x => x.id === id);
    if (!booking) return false;

    const currentPaid = booking.amountPaid ?? 0;
    const newPaid = currentPaid + amount;

    const payments = booking.payments ?? [];
    payments.push({
      id: paymentId || "PAY-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      amount,
      method,
      timestamp: new Date().toISOString(),
    });

    booking.payments = payments;
    booking.amountPaid = newPaid;

    if (newPaid >= booking.estimatedTotal) {
      booking.paymentStatus = "fully_paid";
      booking.status = "confirmed";
    } else if (newPaid > 0) {
      booking.paymentStatus = "deposit_paid";
      booking.status = "confirmed";
    }
    saveFallbackStore();
    return true;
  }
  try {
    await ensureInit();
    const rows = await query<BookingRow>("SELECT * FROM bookings WHERE id = ?", [id]);
    if (!rows.length) return false;

    const booking = rowToBooking(rows[0]);
    const currentPaid = booking.amountPaid ?? 0;
    const newPaid = currentPaid + amount;

    const payments = booking.payments ?? [];
    payments.push({
      id: paymentId || "PAY-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      amount,
      method,
      timestamp: new Date().toISOString(),
    });

    let paymentStatus: Booking["paymentStatus"] = "unpaid";
    let status: Booking["status"] = booking.status ?? "pending";
    if (newPaid >= booking.estimatedTotal) {
      paymentStatus = "fully_paid";
      status = "confirmed";
    } else if (newPaid > 0) {
      paymentStatus = "deposit_paid";
      status = "confirmed";
    }

    await query(
      `UPDATE bookings SET amount_paid = ?, payment_status = ?, status = ?, payments = ? WHERE id = ?`,
      [newPaid, paymentStatus, status, JSON.stringify(payments), id]
    );
    return true;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateBookingPayment(id, amount, method, paymentId);
  }
}

export async function getUserBookings(email: string): Promise<Booking[]> {
  if (useFallback) {
    return fallbackStore.bookings.filter(b => {
      const emailVal = b.customer?.email || (b as any).email;
      return emailVal && emailVal.toLowerCase() === email.toLowerCase();
    });
  }
  try {
    await ensureInit();
    const rows = await query<BookingRow>(
      "SELECT * FROM bookings WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(customer, '$.email'))) = ? ORDER BY submitted_at DESC",
      [email.toLowerCase()]
    );
    return rows.map(rowToBooking);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return getUserBookings(email);
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getItemAvailability(
  itemId: string,
  date: string
): Promise<{ totalStock: number; rented: number; available: number }> {
  if (useFallback) {
    const item = fallbackStore.inventory.find(i => i.id === itemId);
    if (!item) return { totalStock: 0, rented: 0, available: 0 };

    let totalStock = 5;
    if (item.category === "Chairs") totalStock = 500;
    else if (item.category === "Tables") totalStock = 50;
    else if (item.category === "Tents") totalStock = 8;
    else if (item.category === "Bounce Houses" || item.category === "Water Slides") totalStock = 3;
    if (item.stock !== null && item.stock !== undefined) totalStock = item.stock;

    let rented = 0;
    for (const b of fallbackStore.bookings) {
      if (JSON.stringify(b.event.date) === JSON.stringify(date) && b.items[itemId]) {
        rented += Number(b.items[itemId]);
      }
    }
    return { totalStock, rented, available: Math.max(0, totalStock - rented) };
  }
  try {
    await ensureInit();
    const items = await query<InventoryRow>("SELECT * FROM inventory WHERE id = ?", [itemId]);
    if (!items.length) return { totalStock: 0, rented: 0, available: 0 };

    const item = items[0];
    let totalStock = 5;
    if (item.category === "Chairs") totalStock = 500;
    else if (item.category === "Tables") totalStock = 50;
    else if (item.category === "Tents") totalStock = 8;
    else if (item.category === "Bounce Houses" || item.category === "Water Slides") totalStock = 3;
    if (item.stock !== null) totalStock = item.stock;

    // Sum quantities already booked for this date
    const booked = await query<{ total: number }>(
      `SELECT COALESCE(SUM(JSON_UNQUOTE(JSON_EXTRACT(items, CONCAT('$."', ?, '"')))), 0) as total
       FROM bookings
       WHERE JSON_UNQUOTE(JSON_EXTRACT(event_data, '$.date')) = ?
         AND JSON_EXTRACT(items, CONCAT('$."', ?, '"')) IS NOT NULL`,
      [itemId, date, itemId]
    );

    const rented = Number(booked[0]?.total ?? 0);
    return { totalStock, rented, available: Math.max(0, totalStock - rented) };
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return getItemAvailability(itemId, date);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

type SettingsRow = {
  id: number;
  tent_planner_enabled: number;
  maintenance_mode: number;
  analytics_id: string;
  pay_in_person_enabled: number;
  gallery_enabled: number;
  categories_enabled: number;
  featured_rentals_enabled: number;
  deposit_enabled: number;
  deposit_percentage: number;
  promo_codes: any;
};

export async function getSettings(): Promise<{
  tentPlannerEnabled: boolean;
  maintenanceMode?: boolean;
  analyticsId?: string;
  payInPersonEnabled?: boolean;
  galleryEnabled?: boolean;
  categoriesEnabled?: boolean;
  featuredRentalsEnabled?: boolean;
  depositEnabled?: boolean;
  depositPercentage?: number;
  promoCodes?: Array<{ code: string; type: "percent" | "flat"; value: number }>;
}> {
  if (useFallback) return fallbackStore.settings;
  try {
    await ensureInit();
    const rows = await query<SettingsRow>("SELECT * FROM settings WHERE id = 1");
    if (!rows.length) return { tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "", payInPersonEnabled: true, galleryEnabled: true, categoriesEnabled: true, featuredRentalsEnabled: true, depositEnabled: true, depositPercentage: 50, promoCodes: [] };
    return {
      tentPlannerEnabled: Boolean(rows[0].tent_planner_enabled),
      maintenanceMode: Boolean(rows[0].maintenance_mode),
      analyticsId: rows[0].analytics_id,
      payInPersonEnabled: Boolean(rows[0].pay_in_person_enabled ?? 1),
      galleryEnabled: Boolean(rows[0].gallery_enabled ?? 1),
      categoriesEnabled: Boolean(rows[0].categories_enabled ?? 1),
      featuredRentalsEnabled: Boolean(rows[0].featured_rentals_enabled ?? 1),
      depositEnabled: Boolean(rows[0].deposit_enabled ?? 1),
      depositPercentage: Number(rows[0].deposit_percentage ?? 50),
      promoCodes: safeParseJson(rows[0].promo_codes, []),
    };
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return fallbackStore.settings;
  }
}

export async function updateSettings(updates: {
  tentPlannerEnabled?: boolean;
  maintenanceMode?: boolean;
  analyticsId?: string;
  payInPersonEnabled?: boolean;
  galleryEnabled?: boolean;
  categoriesEnabled?: boolean;
  featuredRentalsEnabled?: boolean;
  depositEnabled?: boolean;
  depositPercentage?: number;
  promoCodes?: Array<{ code: string; type: "percent" | "flat"; value: number }>;
}): Promise<void> {
  if (useFallback) {
    fallbackStore.settings = { ...fallbackStore.settings, ...updates };
    saveFallbackStore();
    return;
  }
  try {
    await ensureInit();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    if (updates.tentPlannerEnabled !== undefined) {
      setClauses.push("tent_planner_enabled = ?");
      values.push(updates.tentPlannerEnabled ? 1 : 0);
    }
    if (updates.maintenanceMode !== undefined) {
      setClauses.push("maintenance_mode = ?");
      values.push(updates.maintenanceMode ? 1 : 0);
    }
    if (updates.analyticsId !== undefined) {
      setClauses.push("analytics_id = ?");
      values.push(updates.analyticsId);
    }
    if (updates.payInPersonEnabled !== undefined) {
      setClauses.push("pay_in_person_enabled = ?");
      values.push(updates.payInPersonEnabled ? 1 : 0);
    }
    if (updates.galleryEnabled !== undefined) {
      setClauses.push("gallery_enabled = ?");
      values.push(updates.galleryEnabled ? 1 : 0);
    }
    if (updates.categoriesEnabled !== undefined) {
      setClauses.push("categories_enabled = ?");
      values.push(updates.categoriesEnabled ? 1 : 0);
    }
    if (updates.featuredRentalsEnabled !== undefined) {
      setClauses.push("featured_rentals_enabled = ?");
      values.push(updates.featuredRentalsEnabled ? 1 : 0);
    }
    if (updates.depositEnabled !== undefined) {
      setClauses.push("deposit_enabled = ?");
      values.push(updates.depositEnabled ? 1 : 0);
    }
    if (updates.depositPercentage !== undefined) {
      setClauses.push("deposit_percentage = ?");
      values.push(updates.depositPercentage);
    }
    if (updates.promoCodes !== undefined) {
      setClauses.push("promo_codes = ?");
      values.push(JSON.stringify(updates.promoCodes));
    }
    if (setClauses.length === 0) return;
    values.push(1);
    await query(`UPDATE settings SET ${setClauses.join(", ")} WHERE id = ?`, values);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateSettings(updates);
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

type CategoryRow = {
  id: string; name: string; icon: string; featured: number; order: number;
};

function rowToCategory(r: CategoryRow): Category {
  return { id: r.id, name: r.name, icon: r.icon, featured: Boolean(r.featured), order: r.order };
}

export async function getCategories(): Promise<Category[]> {
  if (useFallback) return fallbackStore.categories;
  try {
    await ensureInit();
    const rows = await query<CategoryRow>("SELECT * FROM categories ORDER BY `order` ASC");
    return rows.map(rowToCategory);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return fallbackStore.categories;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  if (useFallback) {
    fallbackStore.categories = [...categories];
    return;
  }
  try {
    await ensureInit();
    const conn = await getPool().getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM categories");
      for (const cat of categories) {
        await conn.query(
          "INSERT INTO categories (id, name, icon, featured, `order`) VALUES (?, ?, ?, ?, ?)",
          [cat.id, cat.name, cat.icon, cat.featured ? 1 : 0, cat.order]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return saveCategories(categories);
  }
}

// ─── Site Content ─────────────────────────────────────────────────────────────

export async function getSiteContent(): Promise<SiteContent> {
  if (useFallback) return fallbackStore.siteContent;
  try {
    await ensureInit();
    const rows = await query<{ id: number; content: any }>(
      "SELECT * FROM site_content WHERE id = 1"
    );
    if (!rows.length) return DEFAULT_SITE_CONTENT;
    return safeParseJson<SiteContent>(rows[0].content, DEFAULT_SITE_CONTENT);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return fallbackStore.siteContent;
  }
}

export async function updateSiteContent(updates: Partial<SiteContent>): Promise<void> {
  if (useFallback) {
    fallbackStore.siteContent = { ...fallbackStore.siteContent, ...updates };
    saveFallbackStore();
    return;
  }
  try {
    await ensureInit();
    const current = await getSiteContent();
    const merged = { ...current, ...updates };
    await query("UPDATE site_content SET content = ? WHERE id = 1", [JSON.stringify(merged)]);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateSiteContent(updates);
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

type UserRow = {
  email: string; password_hash: string; name: string; phone: string;
  address: string | null; city: string | null; zip_code: string | null;
};

function rowToUser(r: UserRow): User {
  return {
    email: r.email, passwordHash: r.password_hash, name: r.name, phone: r.phone,
    address: r.address ?? undefined, city: r.city ?? undefined, zipCode: r.zip_code ?? undefined,
  };
}

export async function getUsers(): Promise<User[]> {
  if (useFallback) return fallbackStore.users;
  try {
    await ensureInit();
    const rows = await query<UserRow>("SELECT * FROM users");
    return rows.map(rowToUser);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return fallbackStore.users;
  }
}

export async function addUser(user: User): Promise<User> {
  if (useFallback) {
    fallbackStore.users.push(user);
    saveFallbackStore();
    return user;
  }
  try {
    await ensureInit();
    await query(
      "INSERT INTO users (email, password_hash, name, phone, address, city, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.email,
        user.passwordHash,
        user.name ?? "",
        user.phone ?? "",
        user.address ?? null,
        user.city ?? null,
        user.zipCode ?? null
      ]
    );
    return user;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return addUser(user);
  }
}

export async function updateUser(email: string, updates: Partial<User>): Promise<User | null> {
  if (useFallback) {
    const idx = fallbackStore.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return null;
    fallbackStore.users[idx] = { ...fallbackStore.users[idx], ...updates };
    saveFallbackStore();
    return fallbackStore.users[idx];
  }
  try {
    await ensureInit();
    const fieldMap: Record<string, string> = {
      name: "name", phone: "phone", address: "address",
      city: "city", zipCode: "zip_code", passwordHash: "password_hash",
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, val] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = ?`);
      values.push(val ?? null);
    }
    if (setClauses.length === 0) return null;
    values.push(email.toLowerCase());
    await query(`UPDATE users SET ${setClauses.join(", ")} WHERE LOWER(email) = ?`, values);
    const rows = await query<UserRow>("SELECT * FROM users WHERE LOWER(email) = ?", [email.toLowerCase()]);
    return rows.length ? rowToUser(rows[0]) : null;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return updateUser(email, updates);
  }
}

// ─── Chat Messages ─────────────────────────────────────────────────────────────

type MessageRow = {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: "customer" | "admin";
  text: string;
  media_url: string | null;
  timestamp: string;
  status: "sent" | "delivered" | "read";
};

function rowToMessage(r: MessageRow): Message {
  return {
    id: r.id,
    bookingId: r.booking_id,
    senderId: r.sender_id,
    senderRole: r.sender_role,
    text: r.text,
    mediaUrl: r.media_url ?? undefined,
    timestamp: r.timestamp,
    status: r.status,
  };
}

export async function getMessages(bookingId: string): Promise<Message[]> {
  if (useFallback) {
    return fallbackStore.messages.filter(m => m.bookingId === bookingId);
  }
  try {
    await ensureInit();
    const rows = await query<MessageRow>(
      "SELECT * FROM messages WHERE booking_id = ? ORDER BY timestamp ASC",
      [bookingId]
    );
    return rows.map(rowToMessage);
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return getMessages(bookingId);
  }
}

export async function addMessage(message: Message): Promise<Message> {
  if (useFallback) {
    fallbackStore.messages.push(message);
    saveFallbackStore();
    return message;
  }
  try {
    await ensureInit();
    await query(
      `INSERT INTO messages (id, booking_id, sender_id, sender_role, text, media_url, timestamp, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.bookingId,
        message.senderId,
        message.senderRole,
        message.text,
        message.mediaUrl ?? null,
        message.timestamp,
        message.status,
      ]
    );
    return message;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return addMessage(message);
  }
}

export async function markMessagesAsRead(
  bookingId: string,
  role: "customer" | "admin"
): Promise<boolean> {
  const targetRole = role === "admin" ? "customer" : "admin";
  if (useFallback) {
    let affected = false;
    fallbackStore.messages.forEach(m => {
      if (m.bookingId === bookingId && m.senderRole === targetRole && m.status !== "read") {
        m.status = "read";
        affected = true;
      }
    });
    if (affected) saveFallbackStore();
    return true;
  }
  try {
    await ensureInit();
    await query(
      "UPDATE messages SET status = 'read' WHERE booking_id = ? AND sender_role = ?",
      [bookingId, targetRole]
    );
    return true;
  } catch (err) {
    console.warn("⚠️ Database unavailable. Falling back to in-memory store.", err);
    useFallback = true;
    return markMessagesAsRead(bookingId, role);
  }
}

