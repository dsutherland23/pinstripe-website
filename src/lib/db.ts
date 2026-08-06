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
    method?: "delivery" | "pickup";
    fee?: number;
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

export interface SpecialItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  originalPrice: number;
  specialPrice: number;
  promoCode?: string;
  itemId?: string;
  endDate?: string;
  badge?: string;
  enabled: boolean;
  featured: boolean;
  order: number;
}

export interface PackageAddon {
  id: string;
  label: string;
  price: number;
}

export interface PhotoBoothPackage {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  duration: string;
  extraHourPrice: number;
  color: string;
  popular: boolean;
  order: number;
  items: string[];
  addons: PackageAddon[];
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
  about?: {
    title: string;
    paragraph1: string;
    paragraph2: string;
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

    try {
      await conn.query("ALTER TABLE inventory ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00");
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
        promo_codes           JSON,
        specials_enabled      TINYINT(1) NOT NULL DEFAULT 1
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
      await conn.query("ALTER TABLE settings ADD COLUMN specials_enabled TINYINT(1) NOT NULL DEFAULT 1");
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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id               VARCHAR(64)   NOT NULL PRIMARY KEY,
        name             VARCHAR(255)  NOT NULL,
        tagline          VARCHAR(255)  NOT NULL DEFAULT '',
        description      TEXT          NOT NULL,
        price            DECIMAL(10,2) NOT NULL DEFAULT 0,
        duration         VARCHAR(64)   NOT NULL DEFAULT '4 hrs',
        extra_hour_price DECIMAL(10,2) NOT NULL DEFAULT 65,
        color            VARCHAR(64)   NOT NULL DEFAULT '#D4AF37',
        popular          TINYINT(1)    NOT NULL DEFAULT 0,
        \`order\`          INT           NOT NULL DEFAULT 0,
        items            JSON          NOT NULL,
        addons           JSON          NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS specials (
        id             VARCHAR(64)   NOT NULL PRIMARY KEY,
        title          VARCHAR(255)  NOT NULL,
        description    TEXT          NOT NULL,
        image          VARCHAR(512),
        original_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        special_price  DECIMAL(10,2) NOT NULL DEFAULT 0,
        promo_code     VARCHAR(64),
        item_id        VARCHAR(64),
        end_date       VARCHAR(64),
        badge          VARCHAR(128),
        enabled        TINYINT(1)    NOT NULL DEFAULT 1,
        featured       TINYINT(1)    NOT NULL DEFAULT 0,
        \`order\`        INT           NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default data: unconditionally run INSERT IGNORE for mock items and categories
    for (const item of mockInventory) {
      await conn.query(
        `INSERT IGNORE INTO inventory
          (id, title, category, description, price, deposit_amount, availability, dimensions, capacity, image, rating, reviews, stock, delivery_fee)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          item.stock ?? null,
          item.deliveryFee ?? 0
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
      { id: "cat-10", name: "Party Extras",         icon: "shopping-bag", featured: false, order: 10 },
    ];
    for (const cat of DEFAULT_CATEGORIES) {
      await conn.query(
        "INSERT IGNORE INTO categories (id, name, icon, featured, `order`) VALUES (?, ?, ?, ?, ?)",
        [cat.id, cat.name, cat.icon, cat.featured ? 1 : 0, cat.order]
      );
    }

    // Auto-migrate legacy Products category name to Party Extras in MySQL database
    await conn.query("UPDATE categories SET name = 'Party Extras' WHERE name = 'Products'");
    await conn.query("UPDATE inventory SET category = 'Party Extras' WHERE category = 'Products'");

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

// ─── Per-call DB helper ──────────────────────────────────────────────────────
// IMPORTANT: There is NO permanent useFallback flag.
// Each database function catches errors independently and falls back for that
// single call only. The database is retried on every subsequent request.
// This prevents a single transient error from permanently disabling writes.

// ─── Resilient In-Memory Fallback Store ──────────────────────────────────────

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
  about: {
    title: "Discover Our Vision",
    paragraph1: "At Pinstripes Party & Event Rentals, we take immense pride in delivering premier, commercial-grade event equipment and sophisticated designs to elevate every occasion. From majestic, high-peak wedding marquee setups to vibrant, meticulously sanitized bounce castles and interactive concession systems, our core mission is to transform your milestones into unforgettable memories.",
    paragraph2: "Under local ownership in Hampton Roads, Virginia, we represent absolute commitment to flawless service delivery, rigorous safety compliance, and fully licensed & insured logistics. Our dedicated team is committed to ensuring that your custom setup is executed seamlessly, leaving you free to celebrate with complete peace of mind.",
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
    { id: "cat-10", name: "Party Extras",         icon: "shopping-bag", featured: false, order: 10 },
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
    specialsEnabled: true,
    promoCodes: [
      { code: "WELCOME10", type: "percent" as "percent" | "flat", value: 10 },
      { code: "VIP50", type: "percent" as "percent" | "flat", value: 50 },
      { code: "ONSITE20", type: "percent" as "percent" | "flat", value: 20 }
    ]
  },
  bookings: [] as Booking[],
  users: [] as User[],
  messages: [] as Message[],
  specials: [
    {
      id: "spec-1",
      title: "Weekend Inflatable Combo Deal",
      description: "Book any Bounce House + Water Slide combo for the weekend and get 20% off plus free popcorn machine rental!",
      image: "/images/inflatable-fun.png",
      originalPrice: 380,
      specialPrice: 299,
      promoCode: "WEEKEND20",
      endDate: "2026-08-31T23:59:59.000Z",
      badge: "Best Seller",
      enabled: true,
      featured: true,
      order: 1
    },
    {
      id: "spec-2",
      title: "Elite Wedding Tent Package",
      description: "Includes a 20x40 High-Peak Tent, 6 round tables, 48 folding chairs, and beautiful warm white globe lighting setup.",
      image: "/images/canopy-tent.png",
      originalPrice: 750,
      specialPrice: 599,
      promoCode: "ONSITE20",
      endDate: "2026-09-30T23:59:59.000Z",
      badge: "Luxury Deal",
      enabled: true,
      featured: true,
      order: 2
    }
  ] as SpecialItem[],
  packages: [
    {
      id: "pkg-snapit",
      name: "Snap It",
      tagline: "DIY hosts who want great digital photos",
      description: "Perfect for DIY hosts who want great digital photos without the full-service price. Optional backdrop & print add-ons available.",
      price: 250,
      duration: "4 hrs",
      extraHourPrice: 65,
      color: "#f59e0b",
      popular: false,
      order: 1,
      items: [
        "Open-air booth (drop-off)",
        "Studio lighting for high-quality photos",
        "Theme-matched photo template",
        "Instant text sharing + live gallery",
        "GIFs, Boomerangs & Slow Motion"
      ],
      addons: [
        { id: "backdrop", label: "Choice of Premium Backdrop", price: 100 },
        { id: "prints", label: "Unlimited Physical Prints (2×6 or 4×6)", price: 250 },
        { id: "glam", label: "Glam Filter (Magazine-style finish)", price: 100 },
        { id: "guestbook", label: "Memory Photo Guest Book", price: 100 }
      ]
    },
    {
      id: "pkg-party",
      name: "Party",
      tagline: "Full-service, staffed booth experience",
      description: "Full-service, staffed booth. We handle everything before, during, and after — you just enjoy.",
      price: 500,
      duration: "4 hrs",
      extraHourPrice: 65,
      color: "#D4AF37",
      popular: true,
      order: 2,
      items: [
        "Everything in Snap It, plus:",
        "On-site professional attendant",
        "Props included",
        "Choice of backdrop",
        "Custom photo overlay",
        "Custom tap-to-start screen",
        "GIFs, Boomerangs & Slow Motion"
      ],
      addons: [
        { id: "prints", label: "Unlimited Physical Prints (2×6 or 4×6)", price: 250 },
        { id: "glam", label: "Glam Filter (Magazine-style finish)", price: 100 },
        { id: "guestbook", label: "Memory Photo Guest Book", price: 100 },
        { id: "idle", label: "Additional Idle Time", price: 50 }
      ]
    },
    {
      id: "pkg-vvip",
      name: "VVIP",
      tagline: "Guests look like they're on a red carpet",
      description: "Guests look like they're on a red carpet. Glam filter, unlimited prints, and video messaging included.",
      price: 750,
      duration: "4 hrs",
      extraHourPrice: 65,
      color: "#a855f7",
      popular: false,
      order: 3,
      items: [
        "Everything in Party, plus:",
        "Glam filter (B&W or Smooth Skin)",
        "Unlimited prints (2×6 or 4×6)",
        "Audio / Video messaging",
        "Live slideshow on TV or secondary screen",
        "Priority VIP setup & teardown"
      ],
      addons: [
        { id: "guestbook", label: "Memory Photo Guest Book", price: 100 },
        { id: "redcarpet", label: "Red Carpet & Stanchions VIP Setup", price: 150 },
        { id: "idle", label: "Additional Idle Time", price: 50 }
      ]
    }
  ] as PhotoBoothPackage[],
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
    if (parsed.settings) fallbackStore.settings = { ...fallbackStore.settings, ...parsed.settings };
    if (parsed.bookings) fallbackStore.bookings = parsed.bookings;
    if (parsed.users) fallbackStore.users = parsed.users;
    if (parsed.messages) fallbackStore.messages = parsed.messages;
    if (parsed.specials) fallbackStore.specials = parsed.specials;
    if (parsed.packages && Array.isArray(parsed.packages) && parsed.packages.length > 0) fallbackStore.packages = parsed.packages;
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
  delivery_fee: number;
};

function rowToItem(r: InventoryRow): RentalItem {
  return {
    id: r.id, title: r.title, category: r.category, description: r.description,
    price: Number(r.price), depositAmount: Number(r.deposit_amount),
    availability: Boolean(r.availability),
    dimensions: r.dimensions, capacity: r.capacity, image: r.image,
    rating: Number(r.rating), reviews: r.reviews,
    ...(r.stock !== null ? { stock: r.stock } : {}),
    deliveryFee: Number(r.delivery_fee ?? 0),
  };
}

export async function getInventory(): Promise<RentalItem[]> {
  try {
    await ensureInit();
    const rows = await query<InventoryRow>("SELECT * FROM inventory ORDER BY CAST(id AS UNSIGNED)");
    return rows.map(rowToItem);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getInventory. Using in-memory fallback for this request.", err);
    return fallbackStore.inventory;
  }
}

export async function updateInventoryItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem | null> {
  let updatedItem: RentalItem | null = null;
  try {
    await ensureInit();
    const fieldMap: Record<string, string> = {
      title: "title", category: "category", description: "description",
      price: "price", depositAmount: "deposit_amount", availability: "availability",
      dimensions: "dimensions", capacity: "capacity", image: "image",
      rating: "rating", reviews: "reviews", stock: "stock",
      deliveryFee: "delivery_fee",
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, val] of Object.entries(updates)) {
      const col = fieldMap[key];
      if (!col) continue;
      setClauses.push(`${col} = ?`);
      values.push(key === "availability" ? (val ? 1 : 0) : (val ?? null));
    }
    if (setClauses.length > 0) {
      values.push(id);
      await query(`UPDATE inventory SET ${setClauses.join(", ")} WHERE id = ?`, values);
      const rows = await query<InventoryRow>("SELECT * FROM inventory WHERE id = ?", [id]);
      if (rows.length) updatedItem = rowToItem(rows[0]);
    }
  } catch (err) {
    console.warn("⚠️ Database unavailable for updateInventoryItem. Updating fallback store.", err);
  }

  // ALWAYS keep fallbackStore & db.json synced across all requests
  const idx = fallbackStore.inventory.findIndex(item => item.id === id);
  if (idx !== -1) {
    fallbackStore.inventory[idx] = { ...fallbackStore.inventory[idx], ...updates };
    saveFallbackStore();
    if (!updatedItem) updatedItem = fallbackStore.inventory[idx];
  }
  return updatedItem;
}

export async function addInventoryItem(item: RentalItem): Promise<RentalItem> {
  try {
    await ensureInit();
    await query(
      `INSERT INTO inventory (id, title, category, description, price, deposit_amount, availability, dimensions, capacity, image, rating, reviews, stock, delivery_fee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        item.stock ?? null,
        item.deliveryFee ?? 0
      ]
    );
  } catch (err) {
    console.warn("⚠️ Database unavailable for addInventoryItem. Updating fallback store.", err);
  }

  // ALWAYS keep fallbackStore & db.json synced across all requests
  const existingIdx = fallbackStore.inventory.findIndex(i => i.id === item.id);
  if (existingIdx !== -1) {
    fallbackStore.inventory[existingIdx] = { ...item };
  } else {
    fallbackStore.inventory.push(item);
  }
  saveFallbackStore();
  return item;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  let affected = false;
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>("DELETE FROM inventory WHERE id = ?", [id]);
    affected = result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable for deleteInventoryItem. Updating fallback store.", err);
  }

  // ALWAYS keep fallbackStore & db.json synced across all requests
  const before = fallbackStore.inventory.length;
  fallbackStore.inventory = fallbackStore.inventory.filter(item => item.id !== id);
  if (fallbackStore.inventory.length < before) {
    saveFallbackStore();
    affected = true;
  }
  return affected;
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
    console.warn("⚠️ Database unavailable for getBookings. Using in-memory fallback for this request.", err);
    return fallbackStore.bookings.map(b => {
      const hasUnread = fallbackStore.messages.some(
        m => m.bookingId === b.id && m.senderRole === "customer" && m.status !== "read"
      );
      return { ...b, hasUnreadMessages: hasUnread };
    });
  }
}

export async function addBooking(booking: Booking): Promise<Booking> {
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
    console.warn("⚠️ Database unavailable for addBooking. Using in-memory fallback for this request.", err);
    fallbackStore.bookings.push(booking);
    saveFallbackStore();
    return booking;
  }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    await ensureInit();
    const rows = await query<BookingRow>("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows.length ? rowToBooking(rows[0]) : null;
  } catch (err) {
    console.warn("⚠️ Database unavailable for getBookingById. Using in-memory fallback for this request.", err);
    return fallbackStore.bookings.find(b => b.id === id) || null;
  }
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>(
      "DELETE FROM bookings WHERE id = ?", [id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable for deleteBooking. Using in-memory fallback for this request.", err);
    const before = fallbackStore.bookings.length;
    fallbackStore.bookings = fallbackStore.bookings.filter(b => b.id !== id);
    const affected = fallbackStore.bookings.length < before;
    if (affected) saveFallbackStore();
    return affected;
  }
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<boolean> {
  try {
    await ensureInit();
    const [result] = await getPool().execute<mysql.ResultSetHeader>(
      "UPDATE bookings SET status = ? WHERE id = ?", [status, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.warn("⚠️ Database unavailable for updateBookingStatus. Using in-memory fallback for this request.", err);
    const b = fallbackStore.bookings.find(x => x.id === id);
    if (!b) return false;
    b.status = status;
    saveFallbackStore();
    return true;
  }
}

export async function updateBookingPayment(
  id: string,
  amount: number,
  method: string,
  paymentId?: string
): Promise<boolean> {
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
    console.warn("⚠️ Database unavailable for updateBookingPayment. Using in-memory fallback for this request.", err);
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
}

export async function getUserBookings(email: string): Promise<Booking[]> {
  try {
    await ensureInit();
    const rows = await query<BookingRow>(
      "SELECT * FROM bookings WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(customer, '$.email'))) = ? ORDER BY submitted_at DESC",
      [email.toLowerCase()]
    );
    return rows.map(rowToBooking);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getUserBookings. Using in-memory fallback for this request.", err);
    return fallbackStore.bookings.filter(b => {
      const emailVal = b.customer?.email || (b as any).email;
      return emailVal && emailVal.toLowerCase() === email.toLowerCase();
    });
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getItemAvailability(
  itemId: string,
  date: string
): Promise<{ totalStock: number; rented: number; available: number }> {
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
    console.warn("⚠️ Database unavailable for getItemAvailability. Using in-memory fallback for this request.", err);
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
  specials_enabled: number;
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
  specialsEnabled?: boolean;
}> {
  try {
    await ensureInit();
    const rows = await query<SettingsRow>("SELECT * FROM settings WHERE id = 1");
    if (!rows.length) return { tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "", payInPersonEnabled: true, galleryEnabled: true, categoriesEnabled: true, featuredRentalsEnabled: true, depositEnabled: true, depositPercentage: 50, promoCodes: [], specialsEnabled: true };
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
      specialsEnabled: Boolean(rows[0].specials_enabled ?? 1),
    };
  } catch (err) {
    console.warn("⚠️ Database unavailable for getSettings. Using in-memory fallback for this request.", err);
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
  specialsEnabled?: boolean;
}): Promise<void> {
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
    if (updates.specialsEnabled !== undefined) {
      setClauses.push("specials_enabled = ?");
      values.push(updates.specialsEnabled ? 1 : 0);
    }
    if (setClauses.length === 0) return;
    values.push(1);
    await query(`UPDATE settings SET ${setClauses.join(", ")} WHERE id = ?`, values);
  } catch (err) {
    console.warn("⚠️ Database unavailable for updateSettings. Using in-memory fallback for this request.", err);
    fallbackStore.settings = { ...fallbackStore.settings, ...updates };
    saveFallbackStore();
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
  try {
    await ensureInit();
    const rows = await query<CategoryRow>("SELECT * FROM categories ORDER BY `order` ASC");
    return rows.map(rowToCategory);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getCategories. Using in-memory fallback for this request.", err);
    return fallbackStore.categories;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
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
    // BUG FIX: Previously missing saveFallbackStore() call — changes were lost on next restart
    console.warn("⚠️ Database unavailable for saveCategories. Using in-memory fallback for this request.", err);
    fallbackStore.categories = [...categories];
    saveFallbackStore();
  }
}

export async function renameCategoryInInventory(oldName: string, newName: string): Promise<void> {
  if (!oldName || !newName || oldName === newName) return;
  try {
    await ensureInit();
    await query("UPDATE inventory SET category = ? WHERE category = ?", [newName, oldName]);
  } catch (err) {
    console.warn("⚠️ Database unavailable for renameCategoryInInventory. Updating fallback store.", err);
  }
  // Also update fallback store to keep in sync
  let modified = false;
  fallbackStore.inventory = fallbackStore.inventory.map((item) => {
    if (item.category === oldName) {
      modified = true;
      return { ...item, category: newName };
    }
    return item;
  });
  if (modified) {
    saveFallbackStore();
  }
}

// ─── Site Content ─────────────────────────────────────────────────────────────

function normalizeSiteContent(content: SiteContent): SiteContent {
  if (!content) return DEFAULT_SITE_CONTENT;
  const copy = { ...DEFAULT_SITE_CONTENT, ...content };
  if (copy.stats && !Array.isArray(copy.stats)) {
    copy.stats = Object.values(copy.stats);
  }
  if (copy.hero?.trustPillars && !Array.isArray(copy.hero.trustPillars)) {
    copy.hero = {
      ...copy.hero,
      trustPillars: Object.values(copy.hero.trustPillars),
    };
  }
  if (!copy.about) {
    copy.about = DEFAULT_SITE_CONTENT.about;
  }
  return copy;
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await ensureInit();
    const rows = await query<{ id: number; content: any }>(
      "SELECT * FROM site_content WHERE id = 1"
    );
    if (!rows.length) return DEFAULT_SITE_CONTENT;
    const parsed = safeParseJson<SiteContent>(rows[0].content, DEFAULT_SITE_CONTENT);
    return normalizeSiteContent(parsed);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getSiteContent. Using in-memory fallback for this request.", err);
    return normalizeSiteContent(fallbackStore.siteContent);
  }
}

export async function updateSiteContent(updates: Partial<SiteContent>): Promise<void> {
  try {
    await ensureInit();
    const current = await getSiteContent();
    const merged = { ...current, ...updates };
    await query("UPDATE site_content SET content = ? WHERE id = 1", [JSON.stringify(merged)]);
  } catch (err) {
    console.warn("⚠️ Database unavailable for updateSiteContent. Using in-memory fallback for this request.", err);
    fallbackStore.siteContent = { ...fallbackStore.siteContent, ...updates };
    saveFallbackStore();
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
  try {
    await ensureInit();
    const rows = await query<UserRow>("SELECT * FROM users");
    return rows.map(rowToUser);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getUsers. Using in-memory fallback for this request.", err);
    return fallbackStore.users;
  }
}

export async function addUser(user: User): Promise<User> {
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
    console.warn("⚠️ Database unavailable for addUser. Using in-memory fallback for this request.", err);
    fallbackStore.users.push(user);
    saveFallbackStore();
    return user;
  }
}

export async function updateUser(email: string, updates: Partial<User>): Promise<User | null> {
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
    console.warn("⚠️ Database unavailable for updateUser. Using in-memory fallback for this request.", err);
    const idx = fallbackStore.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return null;
    fallbackStore.users[idx] = { ...fallbackStore.users[idx], ...updates };
    saveFallbackStore();
    return fallbackStore.users[idx];
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
  try {
    await ensureInit();
    const rows = await query<MessageRow>(
      "SELECT * FROM messages WHERE booking_id = ? ORDER BY timestamp ASC",
      [bookingId]
    );
    return rows.map(rowToMessage);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getMessages. Using in-memory fallback for this request.", err);
    return fallbackStore.messages.filter(m => m.bookingId === bookingId);
  }
}

export async function addMessage(message: Message): Promise<Message> {
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
    console.warn("⚠️ Database unavailable for addMessage. Using in-memory fallback for this request.", err);
    fallbackStore.messages.push(message);
    saveFallbackStore();
    return message;
  }
}

export async function markMessagesAsRead(
  bookingId: string,
  role: "customer" | "admin"
): Promise<boolean> {
  const targetRole = role === "admin" ? "customer" : "admin";
  try {
    await ensureInit();
    await query(
      "UPDATE messages SET status = 'read' WHERE booking_id = ? AND sender_role = ?",
      [bookingId, targetRole]
    );
    return true;
  } catch (err) {
    console.warn("⚠️ Database unavailable for markMessagesAsRead. Using in-memory fallback for this request.", err);
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
}

// ─── Specials ──────────────────────────────────────────────────────────────────

type SpecialRow = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  original_price: number;
  special_price: number;
  promo_code: string | null;
  item_id: string | null;
  end_date: string | null;
  badge: string | null;
  enabled: number;
  featured: number;
  order: number;
};

function rowToSpecial(r: SpecialRow): SpecialItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image ?? undefined,
    originalPrice: Number(r.original_price),
    specialPrice: Number(r.special_price),
    promoCode: r.promo_code ?? undefined,
    itemId: r.item_id ?? undefined,
    endDate: r.end_date ?? undefined,
    badge: r.badge ?? undefined,
    enabled: Boolean(r.enabled),
    featured: Boolean(r.featured),
    order: r.order,
  };
}

export async function getSpecials(): Promise<SpecialItem[]> {
  try {
    await ensureInit();
    const rows = await query<SpecialRow>("SELECT * FROM specials ORDER BY `order` ASC");
    return rows.map(rowToSpecial);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getSpecials. Using in-memory fallback for this request.", err);
    return [...fallbackStore.specials].sort((a, b) => a.order - b.order);
  }
}

export async function createSpecial(special: SpecialItem): Promise<SpecialItem> {
  try {
    await ensureInit();
    await query(
      `INSERT INTO specials (id, title, description, image, original_price, special_price, promo_code, item_id, end_date, badge, enabled, featured, \`order\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        special.id,
        special.title,
        special.description,
        special.image ?? null,
        special.originalPrice,
        special.specialPrice,
        special.promoCode ?? null,
        special.itemId ?? null,
        special.endDate ?? null,
        special.badge ?? null,
        special.enabled ? 1 : 0,
        special.featured ? 1 : 0,
        special.order,
      ]
    );
    return special;
  } catch (err) {
    console.warn("⚠️ Database unavailable for createSpecial. Using in-memory fallback for this request.", err);
    fallbackStore.specials.push(special);
    saveFallbackStore();
    return special;
  }
}

export async function updateSpecial(id: string, updates: Partial<SpecialItem>): Promise<SpecialItem> {
  try {
    await ensureInit();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    if (updates.title !== undefined) { setClauses.push("title = ?"); values.push(updates.title); }
    if (updates.description !== undefined) { setClauses.push("description = ?"); values.push(updates.description); }
    if (updates.image !== undefined) { setClauses.push("image = ?"); values.push(updates.image ?? null); }
    if (updates.originalPrice !== undefined) { setClauses.push("original_price = ?"); values.push(updates.originalPrice); }
    if (updates.specialPrice !== undefined) { setClauses.push("special_price = ?"); values.push(updates.specialPrice); }
    if (updates.promoCode !== undefined) { setClauses.push("promo_code = ?"); values.push(updates.promoCode ?? null); }
    if (updates.itemId !== undefined) { setClauses.push("item_id = ?"); values.push(updates.itemId ?? null); }
    if (updates.endDate !== undefined) { setClauses.push("end_date = ?"); values.push(updates.endDate ?? null); }
    if (updates.badge !== undefined) { setClauses.push("badge = ?"); values.push(updates.badge ?? null); }
    if (updates.enabled !== undefined) { setClauses.push("enabled = ?"); values.push(updates.enabled ? 1 : 0); }
    if (updates.featured !== undefined) { setClauses.push("featured = ?"); values.push(updates.featured ? 1 : 0); }
    if (updates.order !== undefined) { setClauses.push("`order` = ?"); values.push(updates.order); }
    
    if (setClauses.length === 0) {
      const rows = await query<SpecialRow>("SELECT * FROM specials WHERE id = ?", [id]);
      if (!rows.length) throw new Error("Special not found");
      return rowToSpecial(rows[0]);
    }
    
    values.push(id);
    await query(`UPDATE specials SET ${setClauses.join(", ")} WHERE id = ?`, values);
    
    const rows = await query<SpecialRow>("SELECT * FROM specials WHERE id = ?", [id]);
    return rowToSpecial(rows[0]);
  } catch (err) {
    console.warn("⚠️ Database unavailable for updateSpecial. Using in-memory fallback for this request.", err);
    const idx = fallbackStore.specials.findIndex(x => x.id === id);
    if (idx !== -1) {
      fallbackStore.specials[idx] = { ...fallbackStore.specials[idx], ...updates };
      saveFallbackStore();
      return fallbackStore.specials[idx];
    }
    throw new Error("Special not found");
  }
}

export async function deleteSpecial(id: string): Promise<boolean> {
  try {
    await ensureInit();
    const result = await query("DELETE FROM specials WHERE id = ?", [id]);
    const r = result as any;
    const affected = r.affectedRows !== undefined ? r.affectedRows > 0 : true;
    return affected;
  } catch (err) {
    console.warn("⚠️ Database unavailable for deleteSpecial. Using in-memory fallback for this request.", err);
    const before = fallbackStore.specials.length;
    fallbackStore.specials = fallbackStore.specials.filter(x => x.id !== id);
    const affected = fallbackStore.specials.length < before;
    if (affected) saveFallbackStore();
    return affected;
  }
}

// ─── Photo Booth Packages ───────────────────────────────────────────────────

type PackageRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  price: number;
  duration: string;
  extra_hour_price: number;
  color: string;
  popular: number;
  order: number;
  items: any;
  addons: any;
};

function rowToPackage(r: PackageRow): PhotoBoothPackage {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? undefined,
    description: r.description,
    price: Number(r.price),
    duration: r.duration || "4 hrs",
    extraHourPrice: Number(r.extra_hour_price),
    color: r.color || "#D4AF37",
    popular: Boolean(r.popular),
    order: r.order,
    items: Array.isArray(r.items) ? r.items : typeof r.items === "string" ? JSON.parse(r.items) : [],
    addons: Array.isArray(r.addons) ? r.addons : typeof r.addons === "string" ? JSON.parse(r.addons) : [],
  };
}

export async function getPhotoBoothPackages(): Promise<PhotoBoothPackage[]> {
  try {
    await ensureInit();
    const rows = await query<PackageRow>("SELECT * FROM packages ORDER BY `order` ASC");
    return rows.map(rowToPackage);
  } catch (err) {
    console.warn("⚠️ Database unavailable for getPhotoBoothPackages. Using in-memory fallback for this request.", err);
    return [...fallbackStore.packages].sort((a, b) => a.order - b.order);
  }
}

export async function createPhotoBoothPackage(pkg: PhotoBoothPackage): Promise<PhotoBoothPackage> {
  try {
    await ensureInit();
    await query(
      `INSERT INTO packages (id, name, tagline, description, price, duration, extra_hour_price, color, popular, \`order\`, items, addons)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pkg.id,
        pkg.name,
        pkg.tagline ?? null,
        pkg.description,
        pkg.price,
        pkg.duration || "4 hrs",
        pkg.extraHourPrice || 65,
        pkg.color || "#D4AF37",
        pkg.popular ? 1 : 0,
        pkg.order || 1,
        JSON.stringify(pkg.items || []),
        JSON.stringify(pkg.addons || []),
      ]
    );
    return pkg;
  } catch (err) {
    console.warn("⚠️ Database unavailable for createPhotoBoothPackage. Using in-memory fallback for this request.", err);
    fallbackStore.packages.push(pkg);
    saveFallbackStore();
    return pkg;
  }
}

export async function updatePhotoBoothPackage(id: string, updates: Partial<PhotoBoothPackage>): Promise<PhotoBoothPackage> {
  try {
    await ensureInit();
    const setClauses: string[] = [];
    const values: unknown[] = [];
    if (updates.name !== undefined) { setClauses.push("name = ?"); values.push(updates.name); }
    if (updates.tagline !== undefined) { setClauses.push("tagline = ?"); values.push(updates.tagline ?? null); }
    if (updates.description !== undefined) { setClauses.push("description = ?"); values.push(updates.description); }
    if (updates.price !== undefined) { setClauses.push("price = ?"); values.push(updates.price); }
    if (updates.duration !== undefined) { setClauses.push("duration = ?"); values.push(updates.duration); }
    if (updates.extraHourPrice !== undefined) { setClauses.push("extra_hour_price = ?"); values.push(updates.extraHourPrice); }
    if (updates.color !== undefined) { setClauses.push("color = ?"); values.push(updates.color); }
    if (updates.popular !== undefined) { setClauses.push("popular = ?"); values.push(updates.popular ? 1 : 0); }
    if (updates.order !== undefined) { setClauses.push("`order` = ?"); values.push(updates.order); }
    if (updates.items !== undefined) { setClauses.push("items = ?"); values.push(JSON.stringify(updates.items)); }
    if (updates.addons !== undefined) { setClauses.push("addons = ?"); values.push(JSON.stringify(updates.addons)); }

    if (setClauses.length === 0) {
      const rows = await query<PackageRow>("SELECT * FROM packages WHERE id = ?", [id]);
      if (!rows.length) throw new Error("Package not found");
      return rowToPackage(rows[0]);
    }

    values.push(id);
    await query(`UPDATE packages SET ${setClauses.join(", ")} WHERE id = ?`, values);

    const rows = await query<PackageRow>("SELECT * FROM packages WHERE id = ?", [id]);
    return rowToPackage(rows[0]);
  } catch (err) {
    console.warn("⚠️ Database unavailable for updatePhotoBoothPackage. Using in-memory fallback for this request.", err);
    const idx = fallbackStore.packages.findIndex(x => x.id === id);
    if (idx !== -1) {
      fallbackStore.packages[idx] = { ...fallbackStore.packages[idx], ...updates };
      saveFallbackStore();
      return fallbackStore.packages[idx];
    }
    throw new Error("Package not found");
  }
}

export async function deletePhotoBoothPackage(id: string): Promise<boolean> {
  try {
    await ensureInit();
    const result = await query("DELETE FROM packages WHERE id = ?", [id]);
    const r = result as any;
    const affected = r.affectedRows !== undefined ? r.affectedRows > 0 : true;
    return affected;
  } catch (err) {
    console.warn("⚠️ Database unavailable for deletePhotoBoothPackage. Using in-memory fallback for this request.", err);
    const before = fallbackStore.packages.length;
    fallbackStore.packages = fallbackStore.packages.filter(x => x.id !== id);
    const affected = fallbackStore.packages.length < before;
    if (affected) saveFallbackStore();
    return affected;
  }
}

