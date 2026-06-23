"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Lock, Database, Calendar, Plus, RefreshCw, Edit, Check, AlertTriangle,
  Eye, Trash2, Upload, Settings, Tag, Globe, ChevronDown, ChevronRight,
  X, Save, Star, Package, LayoutGrid, Palette, FileText, BarChart3,
  Phone, Mail, MapPin, Link2, Share2, Menu, Search, Filter,
  ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Image as ImageIcon,
  CheckCircle, XCircle, Clock, Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface RentalItem {
  id: string; title: string; category: string; description: string;
  price: number; depositAmount: number; availability: boolean;
  dimensions: string; capacity: string; image: string;
  rating?: number; reviews?: number; stock?: number;
}

interface Booking {
  id: string;
  customer: { name: string; email: string; phone: string };
  event: { type: string; date: string; location: string; guestCount: number };
  delivery: { address: string; city: string; zipCode: string };
  items: Record<string, number>;
  itemCount: number; estimatedTotal: number; paymentMethod: string;
  status?: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  notes?: string; submittedAt: string;
}

interface Category {
  id: string; name: string; icon: string; featured: boolean; order: number;
}

interface SiteContent {
  hero: { badge: string; headline: string; subheadline: string; trustPillars: Array<{ value: string; label: string }> };
  stats: Array<{ value: string; label: string; suffix?: string }>;
  footer: { phone: string; email: string; address: string; instagramUrl: string; facebookUrl: string };
  navbar: { rainCheckText: string; dispatchHours: string; serviceArea: string };
}

// ── Icon options for categories ────────────────────────────────────────────
const ICON_OPTIONS = [
  { key: "castle", label: "Castle" }, { key: "water", label: "Water" },
  { key: "tent", label: "Tent" }, { key: "table", label: "Table" },
  { key: "chair", label: "Chair" }, { key: "popcorn", label: "Popcorn" },
  { key: "candy", label: "Candy" }, { key: "camera", label: "Camera" },
  { key: "ice", label: "Ice" }, { key: "bolt", label: "Bolt" },
  { key: "speaker", label: "Speaker" }, { key: "heart", label: "Heart" },
  { key: "star", label: "Star" }, { key: "music", label: "Music" },
  { key: "gift", label: "Gift" }, { key: "zap", label: "Zap" },
];

// ── Shared UI components ───────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.625rem",
  background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff", fontSize: "0.875rem", outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#D4AF37", marginBottom: "0.4rem",
};

const cardStyle: React.CSSProperties = {
  background: "#111111", border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "1rem", padding: "1.5rem",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative", width: "48px", height: "26px",
        borderRadius: "13px", border: "none", cursor: "pointer",
        background: checked ? "#D4AF37" : "rgba(255,255,255,0.12)",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: checked ? "25px" : "3px",
        width: "20px", height: "20px", borderRadius: "50%",
        background: "#ffffff", transition: "left 0.2s",
      }} />
    </button>
  );
}

function Badge({ label, color = "gold" }: { label: string; color?: "gold" | "green" | "red" | "blue" | "purple" | "gray" }) {
  const colors: Record<string, { bg: string; text: string }> = {
    gold:   { bg: "rgba(212,175,55,0.15)",  text: "#D4AF37" },
    green:  { bg: "rgba(16,185,129,0.15)",  text: "#10b981" },
    red:    { bg: "rgba(239,68,68,0.15)",   text: "#ef4444" },
    blue:   { bg: "rgba(59,130,246,0.15)",  text: "#60a5fa" },
    purple: { bg: "rgba(139,92,246,0.15)",  text: "#a78bfa" },
    gray:   { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.5)" },
  };
  return (
    <span style={{
      padding: "0.2rem 0.65rem", borderRadius: "9999px",
      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: colors[color].bg, color: colors[color].text,
    }}>
      {label}
    </span>
  );
}

// ── Main Admin Component ───────────────────────────────────────────────────
type TabId = "overview" | "inventory" | "categories" | "bookings" | "content" | "settings";

export default function AdminDashboard() {
  const [passcode, setPasscode]   = useState("");
  const [isAuth, setIsAuth]       = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Data
  const [inventory, setInventory]   = useState<RentalItem[]>([]);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [settings, setSettings]     = useState({ tentPlannerEnabled: true, maintenanceMode: false, analyticsId: "", payInPersonEnabled: true, galleryEnabled: true });

  // UI state
  const [loading, setLoading]       = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat]   = useState("All");

  // Inventory editor
  const [editingItem, setEditingItem]     = useState<RentalItem | null>(null);
  const [isCreating, setIsCreating]       = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    title: "", category: "Tents", price: "0", depositAmount: "0",
    stock: "5", description: "", dimensions: "", capacity: "",
    availability: true, image: "", rating: "4.8", reviews: "0",
  });

  // Category editor
  const [editingCat, setEditingCat]   = useState<Category | null>(null);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [catDeleteConfirm, setCatDeleteConfirm] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "tent", featured: false });

  // Booking
  const [bookingDeleteConfirm, setBookingDeleteConfirm] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    itemId: "",
    quantity: "1",
    date: "",
    customerName: "Offline Block",
    customerEmail: "admin@pinstripe.com",
    customerPhone: "(757) 200-2600",
    eventType: "Offline Block",
    eventLocation: "Warehouse / Storage",
    notes: "Manual offline block/booking created from admin panel.",
  });

  // Settings
  const [savingSettings, setSavingSettings] = useState(false);

  // Content
  const [savingContent, setSavingContent] = useState(false);
  const [contentForm, setContentForm] = useState<SiteContent | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_passcode");
    if (saved) verifyPasscode(saved, true);
  }, []);

  const verifyPasscode = async (code: string, auto = false) => {
    setLoading(true); setAuthError("");
    try {
      const res = await fetch(`/api/admin/inventory?t=${Date.now()}`, {
        headers: { "x-admin-passcode": code },
      });
      if (res.ok) {
        setIsAuth(true);
        sessionStorage.setItem("admin_passcode", code);
        loadAll(code);
      } else if (!auto) {
        setAuthError("Invalid admin passcode. Please try again.");
      }
    } catch { if (!auto) setAuthError("Network error."); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_passcode");
    setIsAuth(false); setPasscode("");
  };

  const getCode = () => passcode || sessionStorage.getItem("admin_passcode") || "";

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadAll = async (code?: string) => {
    const c = code || getCode();
    setLoading(true); setErrorMsg("");
    try {
      const [invRes, bkRes, catRes, contentRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/inventory?t=${Date.now()}`, { headers: { "x-admin-passcode": c } }),
        fetch(`/api/admin/bookings?t=${Date.now()}`,  { headers: { "x-admin-passcode": c } }),
        fetch(`/api/admin/categories?t=${Date.now()}`,{ headers: { "x-admin-passcode": c } }),
        fetch(`/api/admin/content?t=${Date.now()}`,   { headers: { "x-admin-passcode": c } }),
        fetch(`/api/admin/settings?t=${Date.now()}`,  { headers: { "x-admin-passcode": c } }),
      ]);
      if (invRes.ok)  { const d = await invRes.json();     setInventory(d.items || []); }
      if (bkRes.ok)   { const d = await bkRes.json();      setBookings(d.bookings || []); }
      if (catRes.ok)  { const d = await catRes.json();     setCategories(d.categories || []); }
      if (contentRes.ok) { const d = await contentRes.json(); setSiteContent(d.content); setContentForm(d.content); }
      if (settingsRes.ok){ const d = await settingsRes.json(); setSettings({ tentPlannerEnabled: d.tentPlannerEnabled, maintenanceMode: d.maintenanceMode ?? false, analyticsId: d.analyticsId ?? "", payInPersonEnabled: d.payInPersonEnabled ?? true, galleryEnabled: d.galleryEnabled ?? true }); }
    } catch { setErrorMsg("Network error loading data."); }
    finally { setLoading(false); }
  };

  const notify = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 4000); }
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 6000); }
  };

  // ── Inventory CRUD ────────────────────────────────────────────────────────
  const startEdit = (item: RentalItem) => {
    setEditingItem(item); setIsCreating(false);
    setItemForm({
      title: item.title, category: item.category,
      price: String(item.price), depositAmount: String(item.depositAmount),
      stock: String(item.stock ?? 5), description: item.description,
      dimensions: item.dimensions, capacity: item.capacity,
      availability: item.availability, image: item.image || "",
      rating: String(item.rating ?? 4.8), reviews: String(item.reviews ?? 0),
    });
  };

  const startCreate = () => {
    setEditingItem(null); setIsCreating(true);
    setItemForm({ title: "", category: categories[0]?.name || "Tents", price: "100", depositAmount: "30", stock: "5", description: "", dimensions: "10ft × 10ft", capacity: "Standard", availability: true, image: "", rating: "4.8", reviews: "0" });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({
          action: isCreating ? "create" : "update",
          item: { id: editingItem?.id, ...itemForm, price: parseFloat(itemForm.price), depositAmount: parseFloat(itemForm.depositAmount), stock: parseInt(itemForm.stock), rating: parseFloat(itemForm.rating), reviews: parseInt(itemForm.reviews) },
        }),
      });
      const d = await res.json();
      if (d.success) {
        notify(isCreating ? "Rental item created!" : "Rental item updated!");
        setEditingItem(null); setIsCreating(false);
        loadAll();
      } else notify(d.error || "Failed to save.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); }
  };

  const handleDeleteItem = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({ action: "delete", item: { id } }),
      });
      const d = await res.json();
      if (d.success) { notify("Item deleted."); loadAll(); }
      else notify(d.error || "Failed to delete.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); setDeleteConfirmId(null); }
  };

  const handleUploadImage = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLoading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("itemId", itemId);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST", headers: { "x-admin-passcode": getCode() }, body: fd,
      });
      const d = await res.json();
      if (d.success) {
        notify("Image uploaded!");
        if (editingItem?.id === itemId) setEditingItem({ ...editingItem, image: d.imagePath });
        loadAll();
      } else notify(d.error || "Upload failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); }
  };

  // ── Category CRUD ─────────────────────────────────────────────────────────
  const startEditCat = (cat: Category) => {
    setEditingCat(cat); setIsCreatingCat(false);
    setCatForm({ name: cat.name, icon: cat.icon, featured: cat.featured });
  };

  const startCreateCat = () => {
    setEditingCat(null); setIsCreatingCat(true);
    setCatForm({ name: "", icon: "tent", featured: false });
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({
          action: isCreatingCat ? "create" : "update",
          category: isCreatingCat ? catForm : { id: editingCat?.id, ...catForm },
        }),
      });
      const d = await res.json();
      if (d.success) {
        notify(isCreatingCat ? "Category created!" : "Category updated!");
        setEditingCat(null); setIsCreatingCat(false);
        loadAll();
      } else notify(d.error || "Failed to save.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); }
  };

  const handleDeleteCat = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({ action: "delete", category: { id } }),
      });
      const d = await res.json();
      if (d.success) { notify("Category deleted."); loadAll(); }
      else notify(d.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); setCatDeleteConfirm(null); }
  };

  const moveCat = async (catId: string, dir: "up" | "down") => {
    const idx = categories.findIndex(c => c.id === catId);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === categories.length - 1)) return;
    const next = [...categories];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const reordered = next.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(reordered);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
      body: JSON.stringify({ action: "reorder", categories: reordered }),
    });
    notify("Order saved.");
  };

  // ── Bookings ──────────────────────────────────────────────────────────────
  const handleDeleteBooking = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({ action: "delete", id }),
      });
      const d = await res.json();
      if (d.success) { notify("Booking deleted."); loadAll(); }
      else notify(d.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setLoading(false); setBookingDeleteConfirm(null); }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({ action: "update-status", id, status }),
      });
      const d = await res.json();
      if (d.success) { notify("Status updated!"); loadAll(); }
    } catch { notify("Network error.", "error"); }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { itemId, quantity, date, customerName, customerEmail, customerPhone, eventType, eventLocation, notes } = bookingForm;
      const parsedQty = parseInt(quantity) || 1;

      const payload = {
        action: "create",
        booking: {
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          event: {
            type: eventType,
            date,
            location: eventLocation,
            guestCount: 0,
          },
          items: {
            [itemId]: parsedQty,
          },
          paymentMethod: "Offline Block",
          status: "confirmed",
          notes,
        }
      };

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": getCode(),
        },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (d.success) {
        notify("Booking/Block created successfully!");
        setIsCreatingBooking(false);
        setBookingForm({
          itemId: inventory[0]?.id || "",
          quantity: "1",
          date: "",
          customerName: "Offline Block",
          customerEmail: "admin@pinstripe.com",
          customerPhone: "(757) 200-2600",
          eventType: "Offline Block",
          eventLocation: "Warehouse / Storage",
          notes: "Manual offline block/booking created from admin panel.",
        });
        loadAll();
      } else {
        notify(d.error || "Failed to create booking.", "error");
      }
    } catch (err) {
      notify("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Site Content ─────────────────────────────────────────────────────────
  const handleSaveContent = async (section: string) => {
    if (!contentForm) return;
    setSavingContent(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify({ section, data: (contentForm as any)[section] }),
      });
      const d = await res.json();
      if (d.success) notify("Content saved!"); else notify(d.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setSavingContent(false); }
  };

  // ── System Settings ───────────────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": getCode() },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.success) notify("Settings saved!"); else notify(d.error || "Failed.", "error");
    } catch { notify("Network error.", "error"); }
    finally { setSavingSettings(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (p: number) => `$${p.toFixed(2)}`;
  const filteredInventory = inventory.filter(i => {
    const matchCat = filterCat === "All" || i.category === filterCat;
    const matchQ = !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.estimatedTotal, 0);
  const lowStock = inventory.filter(i => (i.stock ?? 5) <= 3).length;
  const pendingBookings = bookings.filter(b => !b.status || b.status === "pending").length;

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0a 0%, #111111 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "var(--font-body, system-ui, sans-serif)" }}>
        <div style={{ maxWidth: "420px", width: "100%" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "1.25rem", borderRadius: "50%", background: "rgba(212,175,55,0.08)", border: "2px solid rgba(212,175,55,0.2)", color: "#D4AF37", marginBottom: "1.25rem" }}>
              <Lock size={32} />
            </div>
            <h1 style={{ fontFamily: "var(--font-heading, serif)", color: "#ffffff", fontSize: "2rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
              Admin Portal
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Pinstripes Party & Event Rentals
            </p>
          </div>

          <div style={{ background: "#111111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "1.25rem", padding: "2rem", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <form onSubmit={(e) => { e.preventDefault(); verifyPasscode(passcode); }} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Admin Passcode</label>
                <input
                  required type="password" placeholder="Enter passcode…"
                  value={passcode} onChange={e => setPasscode(e.target.value)}
                  style={{ ...inputStyle, fontSize: "1rem" }}
                  onFocus={e => { e.target.style.borderColor = "#D4AF37"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              {authError && <p style={{ color: "#ef4444", fontSize: "0.82rem", textAlign: "center", margin: 0 }}>{authError}</p>}
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.9rem", borderRadius: "0.75rem", background: "linear-gradient(135deg, #D4AF37 0%, #f5e8a0 50%, #D4AF37 100%)", border: "none", color: "#000000", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {loading ? <RefreshCw size={16} className="animate-spin" /> : "Access Dashboard"}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "0.8rem" }}>← Return to Website</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SIDEBAR NAV ───────────────────────────────────────────────────────────
  const navItems: Array<{ id: TabId; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: "overview",   label: "Overview",     icon: <BarChart3 size={18} /> },
    { id: "inventory",  label: "Inventory",    icon: <Package size={18} />,  badge: inventory.length },
    { id: "categories", label: "Categories",   icon: <Tag size={18} />,      badge: categories.length },
    { id: "bookings",   label: "Bookings",     icon: <Calendar size={18} />, badge: pendingBookings > 0 ? pendingBookings : undefined },
    { id: "content",    label: "Site Content", icon: <Globe size={18} /> },
    { id: "settings",   label: "Settings",     icon: <Settings size={18} /> },
  ];

  // ── MAIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "var(--font-body, system-ui, sans-serif)", display: "flex" }}>

      {/* Backdrop overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 90,
          }}
        />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: isMobile ? (sidebarOpen ? "240px" : "0px") : (sidebarOpen ? "240px" : "64px"),
        minHeight: "100vh", background: "#111111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: isMobile ? 100 : 1,
        overflowY: "auto", overflowX: "hidden",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: (isMobile || sidebarOpen) ? "space-between" : "center" }}>
          {(isMobile || sidebarOpen) && (
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#D4AF37", letterSpacing: "0.05em", textTransform: "uppercase" }}>Pinstripes</div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin CMS</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.25rem", display: "flex" }}>
            {isMobile ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
          {navItems.map(item => {
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  width: "100%", padding: "0.75rem",
                  borderRadius: "0.75rem", border: "none",
                  background: isTabActive ? "rgba(212,175,55,0.12)" : "transparent",
                  color: isTabActive ? "#D4AF37" : "rgba(255,255,255,0.55)",
                  fontWeight: isTabActive ? 700 : 500,
                  fontSize: "0.85rem", cursor: "pointer",
                  marginBottom: "0.25rem",
                  transition: "all 0.15s ease",
                  justifyContent: (isMobile || sidebarOpen) ? "flex-start" : "center",
                  position: "relative",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                title={(!isMobile && !sidebarOpen) ? item.label : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {(isMobile || sidebarOpen) && <span>{item.label}</span>}
                {(isMobile || sidebarOpen) && item.badge !== undefined && (
                  <span style={{ marginLeft: "auto", background: isTabActive ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "0.1rem 0.5rem", fontSize: "0.62rem", fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {(isMobile || sidebarOpen) && (
            <Link href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 0.75rem", borderRadius: "0.625rem", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", textDecoration: "none", marginBottom: "0.5rem" }}>
              <Eye size={15} />View Site
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", justifyContent: (isMobile || sidebarOpen) ? "flex-start" : "center", gap: "0.65rem", width: "100%", padding: "0.65rem 0.75rem", borderRadius: "0.625rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
          >
            <Lock size={15} />
            {(isMobile || sidebarOpen) && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: isMobile ? "1rem" : "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {(isMobile || !sidebarOpen) && (
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.5rem",
                  color: "rgba(255,255,255,0.7)",
                  padding: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Menu size={18} />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: isMobile ? "1rem" : "1.1rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              {!isMobile && (
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => loadAll()} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", padding: "0.45rem 0.875rem", cursor: "pointer" }}>
              <RefreshCw size={13} /> {!isMobile && "Refresh"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "9999px", padding: "0.3rem 0.75rem" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#10b981" }}>LIVE</span>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {(errorMsg || successMsg) && (
          <div style={{ padding: "0 2rem", paddingTop: "1rem" }}>
            {errorMsg && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "0.875rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><XCircle size={16} />{errorMsg}</div>}
            {successMsg && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "0.875rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle size={16} />{successMsg}</div>}
          </div>
        )}

        <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>

          {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Total Revenue", value: fmt(totalRevenue), sub: `${bookings.length} quote requests`, color: "#D4AF37", icon: <BarChart3 size={20} /> },
                  { label: "Rental Items", value: String(inventory.length), sub: `${inventory.filter(i => i.availability).length} active`, color: "#60a5fa", icon: <Package size={20} /> },
                  { label: "Pending Bookings", value: String(pendingBookings), sub: "Awaiting confirmation", color: "#f59e0b", icon: <Clock size={20} /> },
                  { label: "Low Stock Alerts", value: String(lowStock), sub: "Items ≤ 3 units", color: lowStock > 0 ? "#ef4444" : "#10b981", icon: <AlertTriangle size={20} /> },
                ].map(stat => (
                  <div key={stat.label} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", margin: 0 }}>{stat.label}</p>
                      <span style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</span>
                    </div>
                    <p style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1 }}>{stat.value}</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>Quick Actions</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  {[
                    { label: "Add Rental Item", tab: "inventory" as TabId, color: "#D4AF37", action: startCreate },
                    { label: "Add Category",    tab: "categories" as TabId, color: "#60a5fa", action: startCreateCat },
                    { label: "Edit Hero Text",  tab: "content" as TabId },
                    { label: "Manage Settings", tab: "settings" as TabId },
                  ].map(qa => (
                    <button key={qa.label} onClick={() => { setActiveTab(qa.tab); qa.action?.(); }} style={{ padding: "0.6rem 1.25rem", borderRadius: "0.625rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Plus size={14} />{qa.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent bookings */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ffffff", marginBottom: "1rem" }}>Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>No bookings yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {bookings.slice(0, 5).map(b => (
                      <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", borderRadius: "0.625rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.85rem", margin: 0 }}>{b.customer.name}</p>
                          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", margin: 0 }}>{b.event.type} · {b.event.date}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "0.9rem", margin: 0 }}>{fmt(b.estimatedTotal)}</p>
                          <Badge 
                             label={b.status || "pending"} 
                             color={
                               b.status === "confirmed" ? "green" : 
                               b.status === "preparing" ? "blue" : 
                               b.status === "delivered" ? "purple" : 
                               b.status === "cancelled" ? "red" : "gold"
                             } 
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INVENTORY TAB ────────────────────────────────────────────── */}
          {activeTab === "inventory" && (
            <div style={{ display: "grid", gridTemplateColumns: (editingItem || isCreating) && !isMobile ? "1fr 400px" : "1fr", gap: "1.5rem", alignItems: "flex-start" }}>
              {/* Table / Card List */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Rental Equipment ({filteredInventory.length})</h3>
                  <button onClick={startCreate} style={{ padding: "0.55rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Plus size={14} />Add New Item
                  </button>
                </div>

                {/* Search + Filter */}
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, position: "relative", minWidth: "180px" }}>
                    <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search items…" style={{ ...inputStyle, paddingLeft: "2.25rem" }} />
                  </div>
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "120px" }}>
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                {isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredInventory.map(item => (
                      <div key={item.id} style={{ ...cardStyle, background: "rgba(255,255,255,0.02)", display: "flex", gap: "0.75rem", padding: "1rem" }}>
                        <img src={item.image} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "0.5rem", background: "#1a1a1a", flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).src = "/images/canopy-tent.png"; }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.85rem", margin: "0 0 0.25rem 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                            <Badge label={item.category} color="gray" />
                            <Badge label={item.availability ? "Active" : "Off"} color={item.availability ? "green" : "red"} />
                          </div>
                          <p style={{ color: "#D4AF37", fontWeight: 800, fontSize: "0.85rem", margin: 0 }}>{fmt(item.price)} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 400 }}>/ day · Stock: {item.stock ?? "–"}</span></p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", justifyContent: "center" }}>
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button onClick={() => startEdit(item)} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: "0.375rem", padding: "0.45rem", cursor: "pointer", display: "flex" }} title="Edit">
                              <Edit size={14} />
                            </button>
                            <label style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", borderRadius: "0.375rem", padding: "0.45rem", cursor: "pointer", display: "flex" }} title="Upload image">
                              <Upload size={14} />
                              <input type="file" accept="image/*" onChange={e => handleUploadImage(item.id, e)} style={{ display: "none" }} />
                            </label>
                          </div>
                          {deleteConfirmId === item.id ? (
                            <div style={{ display: "flex", gap: "0.25rem" }}>
                              <button onClick={() => handleDeleteItem(item.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>Confirm</button>
                              <button onClick={() => setDeleteConfirmId(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", borderRadius: "0.375rem", padding: "0.25rem", cursor: "pointer", display: "flex" }}><X size={12} /></button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(item.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.45rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredInventory.length === 0 && (
                      <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No items found</div>
                    )}
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {["Image", "Title", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                            <th key={h} style={{ padding: "8px 10px", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map(item => (
                          <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "10px" }}>
                              <img src={item.image} alt="" style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "0.375rem", background: "#1a1a1a" }} onError={e => { (e.target as HTMLImageElement).src = "/images/canopy-tent.png"; }} />
                            </td>
                            <td style={{ padding: "10px", fontWeight: 600, color: "#ffffff", fontSize: "0.85rem", maxWidth: "200px" }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                            </td>
                            <td style={{ padding: "10px" }}><Badge label={item.category} color="gray" /></td>
                            <td style={{ padding: "10px", fontWeight: 700, color: "#D4AF37", fontSize: "0.88rem" }}>{fmt(item.price)}</td>
                            <td style={{ padding: "10px", color: (item.stock ?? 5) <= 3 ? "#ef4444" : "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 600 }}>{item.stock ?? "–"}</td>
                            <td style={{ padding: "10px" }}>
                              <Badge label={item.availability ? "Active" : "Off"} color={item.availability ? "green" : "red"} />
                            </td>
                            <td style={{ padding: "10px" }}>
                              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                                <button onClick={() => startEdit(item)} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: "0.375rem", padding: "0.35rem", cursor: "pointer", display: "flex" }} title="Edit">
                                  <Edit size={14} />
                                </button>
                                <label style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", borderRadius: "0.375rem", padding: "0.35rem", cursor: "pointer", display: "flex" }} title="Upload image">
                                  <Upload size={14} />
                                  <input type="file" accept="image/*" onChange={e => handleUploadImage(item.id, e)} style={{ display: "none" }} />
                                </label>
                                {deleteConfirmId === item.id ? (
                                  <>
                                    <button onClick={() => handleDeleteItem(item.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Confirm</button>
                                    <button onClick={() => setDeleteConfirmId(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", borderRadius: "0.375rem", padding: "0.35rem", cursor: "pointer", display: "flex" }}><X size={14} /></button>
                                  </>
                                ) : (
                                  <button onClick={() => setDeleteConfirmId(item.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.35rem", cursor: "pointer", display: "flex" }} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredInventory.length === 0 && (
                          <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No items found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Editor Panel */}
              {(editingItem || isCreating) && (
                <div style={{
                  ...cardStyle,
                  border: "1px solid rgba(212,175,55,0.25)",
                  position: isMobile ? "static" : "sticky",
                  top: isMobile ? undefined : "80px",
                  maxHeight: isMobile ? undefined : "calc(100vh - 100px)",
                  overflowY: isMobile ? undefined : "auto"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>
                      {isCreating ? "Create New Item" : `Edit #${editingItem?.id}`}
                    </h3>
                    <button onClick={() => { setEditingItem(null); setIsCreating(false); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex" }}><X size={18} /></button>
                  </div>

                  <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Title</label>
                      <input required type="text" value={itemForm.title} onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                    </div>

                    {/* Image preview + upload */}
                    {editingItem && (
                      <div>
                        <label style={labelStyle}>Image</label>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", padding: "0.75rem" }}>
                          <img src={editingItem.image || itemForm.image} alt="" style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "0.375rem" }} onError={e => { (e.target as HTMLImageElement).src = "/images/canopy-tent.png"; }} />
                          <div style={{ flex: 1 }}>
                            <input type="text" value={itemForm.image} onChange={e => setItemForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL…" style={{ ...inputStyle, marginBottom: "0.5rem" }} />
                            <label style={{ padding: "0.4rem 0.75rem", borderRadius: "0.375rem", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.08)", color: "#D4AF37", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                              <Upload size={12} />Upload File
                              <input type="file" accept="image/*" onChange={e => handleUploadImage(editingItem.id, e)} style={{ display: "none" }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Category</label>
                        <select value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Daily Price ($)</label>
                        <input required type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Deposit ($)</label>
                        <input type="number" step="0.01" value={itemForm.depositAmount} onChange={e => setItemForm(f => ({ ...f, depositAmount: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Stock Qty</label>
                        <input required type="number" value={itemForm.stock} onChange={e => setItemForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Rating</label>
                        <input type="number" step="0.1" min="1" max="5" value={itemForm.rating} onChange={e => setItemForm(f => ({ ...f, rating: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}># Reviews</label>
                        <input type="number" value={itemForm.reviews} onChange={e => setItemForm(f => ({ ...f, reviews: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea rows={3} value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: "none" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Dimensions</label>
                        <input type="text" value={itemForm.dimensions} onChange={e => setItemForm(f => ({ ...f, dimensions: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Capacity</label>
                        <input type="text" value={itemForm.capacity} onChange={e => setItemForm(f => ({ ...f, capacity: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1a1a", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div>
                        <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>Available for rent</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", margin: 0 }}>Show on public website</p>
                      </div>
                      <Toggle checked={itemForm.availability} onChange={v => setItemForm(f => ({ ...f, availability: v }))} />
                    </div>

                    <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #D4AF37, #f5e8a0)", border: "none", color: "#000", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Save size={15} />{loading ? "Saving…" : (isCreating ? "Create Item" : "Save Changes")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── CATEGORIES TAB ───────────────────────────────────────────── */}
          {activeTab === "categories" && (
            <div style={{ display: "grid", gridTemplateColumns: (editingCat || isCreatingCat) && !isMobile ? "1fr 360px" : "1fr", gap: "1.5rem", alignItems: "flex-start" }}>
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>Categories ({categories.length})</h3>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      Drag or use arrows to reorder. Changes reflect on public site.
                    </p>
                  </div>
                  <button onClick={startCreateCat} style={{ padding: "0.55rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Plus size={14} />Add Category
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {categories.map((cat, idx) => {
                    const itemCount = inventory.filter(i => i.category === cat.name).length;
                    return (
                      <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderRadius: "0.875rem", background: editingCat?.id === cat.id ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${editingCat?.id === cat.id ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.05)"}`, transition: "all 0.15s" }}>
                        {/* Order controls */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <button onClick={() => moveCat(cat.id, "up")} disabled={idx === 0} style={{ background: "transparent", border: "none", color: idx === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", cursor: idx === 0 ? "default" : "pointer", padding: "2px", display: "flex" }}><ArrowUp size={12} /></button>
                          <button onClick={() => moveCat(cat.id, "down")} disabled={idx === categories.length - 1} style={{ background: "transparent", border: "none", color: idx === categories.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", cursor: idx === categories.length - 1 ? "default" : "pointer", padding: "2px", display: "flex" }}><ArrowDown size={12} /></button>
                        </div>

                        {/* Icon badge */}
                        <div style={{ width: "40px", height: "40px", borderRadius: "0.75rem", background: "rgba(212,175,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", flexShrink: 0 }}>
                          <Tag size={18} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.9rem", margin: 0 }}>{cat.name}</p>
                            {cat.featured && <Badge label="Featured" color="gold" />}
                          </div>
                          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", margin: 0 }}>icon: {cat.icon} · {itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <button onClick={() => startEditCat(cat)} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: "0.375rem", padding: "0.4rem", cursor: "pointer", display: "flex" }} title="Edit">
                            <Edit size={14} />
                          </button>
                          {catDeleteConfirm === cat.id ? (
                            <>
                              <button onClick={() => handleDeleteCat(cat.id)} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.4rem 0.65rem", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Delete</button>
                              <button onClick={() => setCatDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: "0.375rem", padding: "0.4rem", cursor: "pointer", display: "flex" }}><X size={14} /></button>
                            </>
                          ) : (
                            <button onClick={() => setCatDeleteConfirm(cat.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.4rem", cursor: "pointer", display: "flex" }} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Editor */}
              {(editingCat || isCreatingCat) && (
                <div style={{
                  ...cardStyle,
                  border: "1px solid rgba(212,175,55,0.25)",
                  position: isMobile ? "static" : "sticky",
                  top: isMobile ? undefined : "80px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>
                      {isCreatingCat ? "New Category" : `Edit "${editingCat?.name}"`}
                    </h3>
                    <button onClick={() => { setEditingCat(null); setIsCreatingCat(false); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex" }}><X size={18} /></button>
                  </div>

                  <form onSubmit={handleSaveCat} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Category Name</label>
                      <input required type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Water Slides" style={inputStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Icon Key</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        {ICON_OPTIONS.map(ico => (
                          <button
                            key={ico.key} type="button"
                            onClick={() => setCatForm(f => ({ ...f, icon: ico.key }))}
                            style={{ padding: "0.5rem 0.25rem", borderRadius: "0.5rem", border: `1px solid ${catForm.icon === ico.key ? "#D4AF37" : "rgba(255,255,255,0.08)"}`, background: catForm.icon === ico.key ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)", color: catForm.icon === ico.key ? "#D4AF37" : "rgba(255,255,255,0.55)", fontSize: "0.62rem", fontWeight: 600, cursor: "pointer", textAlign: "center" }}
                          >
                            <Tag size={14} style={{ display: "block", margin: "0 auto 0.25rem" }} />
                            {ico.label}
                          </button>
                        ))}
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem" }}>Selected: <strong style={{ color: "#D4AF37" }}>{catForm.icon}</strong></p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1a1a1a", borderRadius: "0.625rem", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div>
                        <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>Featured Category</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", margin: 0 }}>Show prominently on homepage</p>
                      </div>
                      <Toggle checked={catForm.featured} onChange={v => setCatForm(f => ({ ...f, featured: v }))} />
                    </div>

                    <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #D4AF37, #f5e8a0)", border: "none", color: "#000", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <Save size={15} />{loading ? "Saving…" : (isCreatingCat ? "Create Category" : "Save Changes")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS TAB ─────────────────────────────────────────────── */}
          {activeTab === "bookings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Customer Bookings & Quotes ({bookings.length})
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingBooking(!isCreatingBooking);
                    if (!bookingForm.itemId && inventory.length > 0) {
                      setBookingForm(f => ({ ...f, itemId: inventory[0].id }));
                    }
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    color: "#D4AF37",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#D4AF37";
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(212,175,55,0.1)";
                    e.currentTarget.style.color = "#D4AF37";
                  }}
                >
                  {isCreatingBooking ? "Close Form" : "Block Dates / Offline Booking"}
                </button>
              </div>

              {/* Offline Booking Form */}
              {isCreatingBooking && (
                <div style={{ ...cardStyle, border: "1px solid rgba(212,175,55,0.25)" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#D4AF37", marginBottom: "1.25rem" }}>
                    Create Offline Booking or Block Equipment
                  </h4>
                  <form onSubmit={handleCreateBooking} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Rental Item</label>
                        <select
                          value={bookingForm.itemId}
                          onChange={e => setBookingForm({ ...bookingForm, itemId: e.target.value })}
                          style={inputStyle}
                          required
                        >
                          <option value="" disabled>Select an Item</option>
                          {inventory.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.title} ({item.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Quantity to Block/Book</label>
                        <input
                          type="number"
                          min="1"
                          value={bookingForm.quantity}
                          onChange={e => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                          style={inputStyle}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Event / Block Date</label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Customer Name</label>
                        <input
                          type="text"
                          value={bookingForm.customerName}
                          onChange={e => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                          style={inputStyle}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Customer Email</label>
                        <input
                          type="email"
                          value={bookingForm.customerEmail}
                          onChange={e => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                          style={inputStyle}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Customer Phone</label>
                        <input
                          type="text"
                          value={bookingForm.customerPhone}
                          onChange={e => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Booking Type</label>
                        <select
                          value={bookingForm.eventType}
                          onChange={e => setBookingForm({ ...bookingForm, eventType: e.target.value })}
                          style={inputStyle}
                          required
                        >
                          <option value="Offline Block">Offline Block / Maintenance</option>
                          <option value="Offline Booking">Manual Offline Booking</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Graduation">Graduation</option>
                          <option value="Birthday Party">Birthday Party</option>
                          <option value="Corporate Event">Corporate Event</option>
                          <option value="Other">Other Event</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Event Location</label>
                        <input
                          type="text"
                          value={bookingForm.eventLocation}
                          onChange={e => setBookingForm({ ...bookingForm, eventLocation: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Notes / Internal Memo</label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "0.8rem",
                        borderRadius: "0.625rem",
                        background: "linear-gradient(135deg, #D4AF37, #f5e8a0)",
                        border: "none",
                        color: "#000",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginTop: "0.5rem"
                      }}
                    >
                      {loading ? "Creating..." : "Save Offline Booking / Block"}
                    </button>
                  </form>
                </div>
              )}

              {/* Bookings List Card */}
              <div style={cardStyle}>
                {bookings.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.9rem", textAlign: "center", padding: "3rem" }}>No bookings in the database.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {bookings.map(booking => (
                    <div key={booking.id} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", background: "#161616", padding: "1.25rem" }}>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "0.78rem", color: "#D4AF37", fontWeight: 800 }}>{booking.id}</span>
                          {/* Status selector */}
                          <select
                            value={booking.status || "pending"}
                            onChange={e => handleUpdateBookingStatus(booking.id, e.target.value)}
                            style={{ ...inputStyle, width: "auto", padding: "0.2rem 0.5rem", fontSize: "0.72rem", background: "transparent", borderColor: "rgba(255,255,255,0.1)" }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="delivered">Delivered &amp; Setup</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Badge 
                            label={booking.status || "pending"} 
                            color={
                              booking.status === "confirmed" ? "green" : 
                              booking.status === "preparing" ? "blue" : 
                              booking.status === "delivered" ? "purple" : 
                              booking.status === "cancelled" ? "red" : "gold"
                            } 
                          />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{new Date(booking.submittedAt).toLocaleDateString()}</span>
                          <Link href={`/portal/invoice?id=${booking.id}&passcode=${encodeURIComponent(getCode())}`} target="_blank" style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.75rem", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "0.375rem", color: "#D4AF37", fontSize: "0.72rem", textDecoration: "none", fontWeight: 600 }}>
                            <Eye size={12} />Invoice
                          </Link>
                          {bookingDeleteConfirm === booking.id ? (
                            <>
                              <button onClick={() => handleDeleteBooking(booking.id)} style={{ padding: "0.35rem 0.6rem", borderRadius: "0.375rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Delete</button>
                              <button onClick={() => setBookingDeleteConfirm(null)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: "0.375rem", padding: "0.35rem", cursor: "pointer", display: "flex" }}><X size={14} /></button>
                            </>
                          ) : (
                            <button onClick={() => setBookingDeleteConfirm(booking.id)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: "0.375rem", padding: "0.375rem", cursor: "pointer", display: "flex" }} title="Delete booking">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                        <div>
                          <p style={{ fontSize: "0.68rem", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.35rem" }}>Customer</p>
                          <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.88rem", margin: 0 }}>{booking.customer.name}</p>
                          <a href={`mailto:${booking.customer.email}`} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", display: "block", textDecoration: "none" }}>{booking.customer.email}</a>
                          <a href={`tel:${booking.customer.phone}`} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", textDecoration: "none" }}>{booking.customer.phone}</a>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.68rem", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.35rem" }}>Event</p>
                          <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.88rem", margin: 0 }}>{booking.event.type}</p>
                          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: 0 }}>{booking.event.date} · {booking.event.guestCount} guests</p>
                          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: 0 }}>{booking.event.location}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "0.68rem", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.35rem" }}>Delivery</p>
                          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                            {booking.delivery.address}<br />{booking.delivery.city}, VA {booking.delivery.zipCode}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", justifyContent: "center" }}>
                          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Total</p>
                          <p style={{ fontSize: "1.5rem", color: "#D4AF37", fontWeight: 900, margin: 0 }}>{fmt(booking.estimatedTotal)}</p>
                          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>{booking.paymentMethod}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div style={{ marginTop: "0.75rem", padding: "0.625rem 0.875rem", borderLeft: "3px solid #D4AF37", background: "rgba(212,175,55,0.05)", borderRadius: "0 0.375rem 0.375rem 0" }}>
                          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", margin: 0 }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Notes:</strong> {booking.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

          {/* ── SITE CONTENT TAB ─────────────────────────────────────────── */}
          {activeTab === "content" && contentForm && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>
              {/* Hero */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>🦸 Hero Section</h3>
                  <button onClick={() => handleSaveContent("hero")} disabled={savingContent} style={{ padding: "0.5rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Save size={13} />{savingContent ? "Saving…" : "Save Hero"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div><label style={labelStyle}>Badge Text</label><input type="text" value={contentForm.hero.badge} onChange={e => setContentForm(f => f ? { ...f, hero: { ...f.hero, badge: e.target.value } } : f)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Headline</label><input type="text" value={contentForm.hero.headline} onChange={e => setContentForm(f => f ? { ...f, hero: { ...f.hero, headline: e.target.value } } : f)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Subheadline</label><textarea rows={3} value={contentForm.hero.subheadline} onChange={e => setContentForm(f => f ? { ...f, hero: { ...f.hero, subheadline: e.target.value } } : f)} style={{ ...inputStyle, resize: "none" }} /></div>
                  <div>
                    <label style={labelStyle}>Trust Pillars</label>
                    {contentForm.hero.trustPillars.map((pillar, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <input type="text" placeholder="Value (e.g. 100%)" value={pillar.value} onChange={e => { const p = [...contentForm.hero.trustPillars]; p[i] = { ...p[i], value: e.target.value }; setContentForm(f => f ? { ...f, hero: { ...f.hero, trustPillars: p } } : f); }} style={{ ...inputStyle, fontSize: "0.82rem" }} />
                        <input type="text" placeholder="Label (e.g. Sanitised Equipment)" value={pillar.label} onChange={e => { const p = [...contentForm.hero.trustPillars]; p[i] = { ...p[i], label: e.target.value }; setContentForm(f => f ? { ...f, hero: { ...f.hero, trustPillars: p } } : f); }} style={{ ...inputStyle, fontSize: "0.82rem" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>📊 Stats Bar</h3>
                  <button onClick={() => handleSaveContent("stats")} disabled={savingContent} style={{ padding: "0.5rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Save size={13} />{savingContent ? "Saving…" : "Save Stats"}
                  </button>
                </div>
                {contentForm.stats.map((stat, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <input type="text" placeholder="Value" value={stat.value} onChange={e => { const s = [...contentForm.stats]; s[i] = { ...s[i], value: e.target.value }; setContentForm(f => f ? { ...f, stats: s } : f); }} style={{ ...inputStyle, fontSize: "0.82rem" }} />
                    <input type="text" placeholder="Label" value={stat.label} onChange={e => { const s = [...contentForm.stats]; s[i] = { ...s[i], label: e.target.value }; setContentForm(f => f ? { ...f, stats: s } : f); }} style={{ ...inputStyle, fontSize: "0.82rem" }} />
                    <input type="text" placeholder="Suffix" value={stat.suffix || ""} onChange={e => { const s = [...contentForm.stats]; s[i] = { ...s[i], suffix: e.target.value }; setContentForm(f => f ? { ...f, stats: s } : f); }} style={{ ...inputStyle, fontSize: "0.82rem" }} />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>🦶 Footer Info</h3>
                  <button onClick={() => handleSaveContent("footer")} disabled={savingContent} style={{ padding: "0.5rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Save size={13} />{savingContent ? "Saving…" : "Save Footer"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Phone", key: "phone", icon: "📞" },
                    { label: "Email", key: "email", icon: "✉️" },
                    { label: "Address", key: "address", icon: "📍" },
                    { label: "Instagram URL", key: "instagramUrl", icon: "📸" },
                    { label: "Facebook URL", key: "facebookUrl", icon: "👥" },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={labelStyle}>{field.icon} {field.label}</label>
                      <input type="text" value={(contentForm.footer as any)[field.key]} onChange={e => setContentForm(f => f ? { ...f, footer: { ...f.footer, [field.key]: e.target.value } } : f)} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navbar */}
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", margin: 0 }}>🧭 Navbar Text</h3>
                  <button onClick={() => handleSaveContent("navbar")} disabled={savingContent} style={{ padding: "0.5rem 1.1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Save size={13} />{savingContent ? "Saving…" : "Save Navbar"}
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div><label style={labelStyle}>Rain-Check Text</label><textarea rows={2} value={contentForm.navbar.rainCheckText} onChange={e => setContentForm(f => f ? { ...f, navbar: { ...f.navbar, rainCheckText: e.target.value } } : f)} style={{ ...inputStyle, resize: "none" }} /></div>
                  <div><label style={labelStyle}>Dispatch Hours</label><input type="text" value={contentForm.navbar.dispatchHours} onChange={e => setContentForm(f => f ? { ...f, navbar: { ...f.navbar, dispatchHours: e.target.value } } : f)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Service Area</label><input type="text" value={contentForm.navbar.serviceArea} onChange={e => setContentForm(f => f ? { ...f, navbar: { ...f.navbar, serviceArea: e.target.value } } : f)} style={inputStyle} /></div>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ─────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "600px" }}>
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Feature Toggles */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", marginBottom: "1.25rem" }}>Feature Toggles</h3>
                  {[
                    { key: "tentPlannerEnabled", label: "Tent Layout Simulator", desc: "Show the interactive tent planner widget on the homepage." },
                    { key: "galleryEnabled",     label: "Gallery / Instagram",  desc: "Show the Gallery / Instagram section on the homepage." },
                    { key: "maintenanceMode",    label: "Maintenance Mode",     desc: "Put the public site into maintenance — admins still have access." },
                    { key: "payInPersonEnabled", label: "Pay in Person Option", desc: "Allow users to choose Pay in Person (Cash / Check / Zelle) during booking." },
                  ].map(toggle => (
                    <div key={toggle.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#ffffff", fontSize: "0.88rem", margin: 0 }}>{toggle.label}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: 0 }}>{toggle.desc}</p>
                      </div>
                      <Toggle
                        checked={(settings as any)[toggle.key]}
                        onChange={v => setSettings(s => ({ ...s, [toggle.key]: v }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Analytics */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#D4AF37", marginBottom: "1rem" }}>Analytics</h3>
                  <div>
                    <label style={labelStyle}>Google Analytics ID (G-XXXXXXXXXX)</label>
                    <input type="text" value={settings.analyticsId} onChange={e => setSettings(s => ({ ...s, analyticsId: e.target.value }))} placeholder="G-XXXXXXXXXX" style={inputStyle} />
                  </div>
                </div>

                <button
                  type="submit" disabled={savingSettings}
                  style={{ alignSelf: "flex-start", padding: "0.8rem 2rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #D4AF37, #f5e8a0)", border: "none", color: "#000", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 16px rgba(212,175,55,0.25)" }}
                >
                  <Save size={15} />{savingSettings ? "Saving…" : "Save All Settings"}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
