"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Database, Calendar, Plus, RefreshCw, Edit, Check, AlertTriangle, Eye, Trash, Upload, Settings } from "lucide-react";

interface RentalItem {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  depositAmount: number;
  availability: boolean;
  dimensions: string;
  capacity: string;
  image: string;
  stock?: number; // Optional custom stock
}

interface Booking {
  id: string;
  customer: { name: string; email: string; phone: string };
  event: { type: string; date: string; location: string; guestCount: number };
  delivery: { address: string; city: string; zipCode: string };
  items: Record<string, number>;
  itemCount: number;
  estimatedTotal: number;
  paymentMethod: string;
  notes?: string;
  submittedAt: string;
}

export default function AdminDashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"inventory" | "bookings" | "settings">("inventory");
  
  // Data state
  const [inventory, setInventory] = useState<RentalItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tentPlannerEnabled, setTentPlannerEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // CRUD Editing states
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Tents");
  const [formPrice, setFormPrice] = useState("0");
  const [formStock, setFormStock] = useState("5");
  const [formDescription, setFormDescription] = useState("");
  const [formDimensions, setFormDimensions] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formAvailability, setFormAvailability] = useState(true);

  // Load passcode from sessionStorage if exists
  useEffect(() => {
    const savedPass = sessionStorage.getItem("admin_passcode");
    if (savedPass) {
      verifyPasscode(savedPass, true);
    }
  }, []);

  const verifyPasscode = async (codeToVerify: string, isAuto = false) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`/api/admin/inventory?t=${Date.now()}`, {
        headers: { "x-admin-passcode": codeToVerify },
      });
      if (res.ok) {
        setIsAuth(true);
        sessionStorage.setItem("admin_passcode", codeToVerify);
        loadData(codeToVerify);
      } else if (!isAuto) {
        setAuthError("Invalid admin passcode. Please try again.");
      }
    } catch {
      if (!isAuto) setAuthError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPasscode(passcode);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_passcode");
    setIsAuth(false);
    setPasscode("");
  };

  const loadData = async (code = passcode || sessionStorage.getItem("admin_passcode") || "") => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Load inventory
      const invRes = await fetch(`/api/admin/inventory?t=${Date.now()}`, {
        headers: { "x-admin-passcode": code },
      });
      const invData = await invRes.json();
      if (invRes.ok && invData.success) {
        setInventory(invData.items || []);
      } else {
        setErrorMsg("Failed to load inventory.");
      }

      // Load bookings
      const bkRes = await fetch(`/api/admin/bookings?t=${Date.now()}`, {
        headers: { "x-admin-passcode": code },
      });
      const bkData = await bkRes.json();
      if (bkRes.ok && bkData.success) {
        setBookings(bkData.bookings || []);
      } else {
        setErrorMsg("Failed to load bookings.");
      }

      // Load settings
      const settingsRes = await fetch(`/api/settings?t=${Date.now()}`);
      const settingsData = await settingsRes.json();
      if (settingsRes.ok && settingsData.success) {
        setTentPlannerEnabled(settingsData.tentPlannerEnabled);
      }
    } catch {
      setErrorMsg("Network error loading system data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setErrorMsg("");
    setSuccessMsg("");
    const code = passcode || sessionStorage.getItem("admin_passcode") || "";
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": code,
        },
        body: JSON.stringify({ tentPlannerEnabled: tentPlannerEnabled }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Settings updated successfully!");
      } else {
        setErrorMsg(data.error || "Failed to update settings.");
      }
    } catch {
      setErrorMsg("Network error saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const startEdit = (item: RentalItem) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormPrice(String(item.price));
    setFormStock(String(item.stock ?? (item.category === "Chairs" ? 500 : item.category === "Tables" ? 50 : 5)));
    setFormDescription(item.description || "");
    setFormDimensions(item.dimensions || "");
    setFormCapacity(item.capacity || "");
    setFormAvailability(item.availability);
  };

  const startCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
    setFormTitle("");
    setFormCategory("Tents");
    setFormPrice("100");
    setFormStock("5");
    setFormDescription("");
    setFormDimensions("10ft x 10ft");
    setFormCapacity("Standard");
    setFormAvailability(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const code = passcode || sessionStorage.getItem("admin_passcode") || "";
    
    const payload = {
      action: isCreating ? "create" : "update",
      item: {
        id: editingItem?.id,
        title: formTitle,
        category: formCategory,
        price: parseFloat(formPrice) || 0,
        stock: parseInt(formStock, 10) || 0,
        description: formDescription,
        dimensions: formDimensions,
        capacity: formCapacity,
        availability: formAvailability,
        depositAmount: (parseFloat(formPrice) || 0) * 0.3, // default deposit rate 30%
        image: editingItem?.image || "/images/canopy-tent.png", // fallback image
      },
    };

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": code,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(isCreating ? "Rental item created successfully!" : "Rental item updated successfully!");
        setEditingItem(null);
        setIsCreating(false);
        loadData(code);
      } else {
        setErrorMsg(data.error || "Failed to save rental item.");
      }
    } catch {
      setErrorMsg("Network error saving item.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const code = passcode || sessionStorage.getItem("admin_passcode") || "";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-passcode": code,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Image uploaded and updated successfully!");
        if (editingItem && editingItem.id === itemId) {
          setEditingItem({ ...editingItem, image: data.imagePath });
        }
        loadData(code);
      } else {
        setErrorMsg(data.error || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Network error uploading image.");
    } finally {
      setLoading(false);
    }
  };

  // Helper: compute category default stock levels if not set
  const getItemStock = (item: RentalItem) => {
    if (item.stock !== undefined) return item.stock;
    if (item.category === "Chairs") return 500;
    if (item.category === "Tables") return 50;
    return 5;
  };

  // Helper: Format price
  const formatPrice = (p: number) => `$${p.toFixed(2)}`;

  if (!isAuth) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", fontFamily: "var(--font-body, sans-serif)" }}>
        <div style={{ maxWidth: "420px", width: "100%", background: "#111111", border: "1px solid rgba(212,175,55,0.25)", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", marginBottom: "1rem" }}>
              <Lock size={28} />
            </div>
            <h1 style={{ fontFamily: "var(--font-heading, serif)", color: "#ffffff", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Admin Portal
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
              Pinstripes Party &amp; Event Rentals Management Console
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#D4AF37", marginBottom: "0.5rem" }}>
                Admin Passcode
              </label>
              <input
                required
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ width: "100%", padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", outline: "none", fontSize: "0.95rem" }}
              />
            </div>

            {authError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", background: "linear-gradient(90deg, #D4AF37, #F3E5AB)", border: "none", color: "#000000", fontWeight: 750, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : "Access Dashboard"}
            </button>
          </form>
          
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "0.8rem" }}>
              ← Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high level stats
  const totalRevenue = (bookings || []).reduce((sum, b) => sum + b.estimatedTotal, 0);
  const totalQuotes = (bookings || []).length;
  const lowStockCount = (inventory || []).filter(i => getItemStock(i) <= 3).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "var(--font-body, sans-serif)", paddingBottom: "3rem" }}>
      {/* Header bar */}
      <header style={{ background: "#111111", borderBottom: "1px solid rgba(212,175,55,0.15)", padding: "1.25rem 2rem", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#D4AF37", letterSpacing: "0.05em", textTransform: "uppercase" }}>Pinstripes Admin</span>
            <div style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "9999px", padding: "0.2rem 0.6rem", fontSize: "0.65rem", color: "#D4AF37", fontWeight: 700 }}>LIVE</div>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={() => loadData()} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={handleLogout} style={{ padding: "0.45rem 1rem", borderRadius: "0.5rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: "1280px", margin: "2rem auto", padding: "0 1.5rem" }}>
        
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          
          {/* Revenue */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
            <p style={{ textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Total Estimated Bookings</p>
            <h2 style={{ fontSize: "2rem", color: "#ffffff", fontWeight: 800 }}>{formatPrice(totalRevenue)}</h2>
            <p style={{ color: "#D4AF37", fontSize: "0.78rem", marginTop: "0.25rem" }}>From completed quote requests</p>
          </div>

          {/* Quote count */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
            <p style={{ textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Active Quote Requests</p>
            <h2 style={{ fontSize: "2rem", color: "#ffffff", fontWeight: 800 }}>{totalQuotes}</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginTop: "0.25rem" }}>Ready for callback reviews</p>
          </div>

          {/* Low Stock Warn */}
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
            <p style={{ textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: "0.5rem" }}>Low Stock items</p>
            <h2 style={{ fontSize: "2rem", color: lowStockCount > 0 ? "#ef4444" : "#ffffff", fontWeight: 800 }}>{lowStockCount}</h2>
            <p style={{ color: lowStockCount > 0 ? "#ef4444" : "rgba(255,255,255,0.45)", fontSize: "0.78rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              {lowStockCount > 0 ? <AlertTriangle size={13} /> : null} Stock level of 3 units or less
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
          <button
            onClick={() => { setActiveTab("inventory"); setEditingItem(null); setIsCreating(false); }}
            style={{ padding: "1rem 1.5rem", background: "transparent", border: "none", borderBottom: activeTab === "inventory" ? "2px solid #D4AF37" : "none", color: activeTab === "inventory" ? "#D4AF37" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            <Database size={15} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
            Inventory List
          </button>
          <button
            onClick={() => { setActiveTab("bookings"); setEditingItem(null); setIsCreating(false); }}
            style={{ padding: "1rem 1.5rem", background: "transparent", border: "none", borderBottom: activeTab === "bookings" ? "2px solid #D4AF37" : "none", color: activeTab === "bookings" ? "#D4AF37" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            <Calendar size={15} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
            Bookings &amp; Quotes ({bookings.length})
          </button>
          <button
            onClick={() => { setActiveTab("settings"); setEditingItem(null); setIsCreating(false); }}
            style={{ padding: "1rem 1.5rem", background: "transparent", border: "none", borderBottom: activeTab === "settings" ? "2px solid #D4AF37" : "none", color: activeTab === "settings" ? "#D4AF37" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            <Settings size={15} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
            System Settings
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", fontSize: "0.88rem" }}>{errorMsg}</div>}
        {successMsg && <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", padding: "1rem", borderRadius: "0.75rem", marginBottom: "1.5rem", fontSize: "0.88rem" }}>{successMsg}</div>}

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === "inventory" && (
          <div style={{ display: "grid", gridTemplateColumns: (editingItem || isCreating) ? "1fr 400px" : "1fr", gap: "2rem", alignItems: "flex-start" }}>
            
            {/* List Table */}
            <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem", overflowX: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff" }}>Rental Equipment Catalog</h3>
                <button onClick={startCreate} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000000", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Plus size={15} /> Add New Rental
                </button>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>ID</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Item Title</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Category</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>Daily Price</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Stock</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "10px", fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 10px", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>#{item.id}</td>
                      <td style={{ padding: "12px 10px", fontSize: "0.88rem", fontWeight: 600, color: "#ffffff" }}>{item.title}</td>
                      <td style={{ padding: "12px 10px", fontSize: "0.85rem" }}>
                        <span style={{ padding: "0.2rem 0.5rem", borderRadius: "0.3rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.78rem" }}>{item.category}</span>
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: "0.88rem", textAlign: "right", fontWeight: 700, color: "#D4AF37" }}>{formatPrice(item.price)}</td>
                      <td style={{ padding: "12px 10px", fontSize: "0.88rem", textAlign: "center" }}>{getItemStock(item)}</td>
                      <td style={{ padding: "12px 10px", fontSize: "0.85rem", textAlign: "center" }}>
                        {item.availability ? (
                          <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Check size={12} /> Active</span>
                        ) : (
                          <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><AlertTriangle size={12} /> Suspended</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", alignItems: "center" }}>
                          <button onClick={() => startEdit(item)} style={{ background: "transparent", border: "none", color: "#D4AF37", cursor: "pointer", padding: "0.25rem" }} title="Edit Item">
                            <Edit size={16} />
                          </button>
                          <label style={{ cursor: "pointer", color: "#D4AF37", padding: "0.25rem", display: "inline-flex", alignItems: "center" }} title="Upload Picture">
                            <Upload size={16} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleUploadImage(item.id, e)} 
                              style={{ display: "none" }} 
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Editor Sidebar */}
            {(editingItem || isCreating) && (
              <div style={{ background: "#111111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "1rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                    {isCreating ? "Create New Item" : `Edit Item #${editingItem?.id}`}
                  </h3>
                  <button onClick={() => { setEditingItem(null); setIsCreating(false); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</button>
                </div>

                <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Title</label>
                    <input required type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Category</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", appearance: "auto" }}>
                        {["Tents", "Bounce Houses", "Water Slides", "Tables", "Chairs", "Cotton Candy Machines", "Popcorn Machines", "Photo Booths"].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Daily Price ($)</label>
                      <input required type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Max Stock</label>
                      <input required type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Status</label>
                      <select value={formAvailability ? "true" : "false"} onChange={(e) => setFormAvailability(e.target.value === "true")} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", appearance: "auto" }}>
                        <option value="true">Active (Rentable)</option>
                        <option value="false">Suspended (Offline)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Description</label>
                    <textarea rows={3} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "0.85rem", resize: "none" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Dimensions</label>
                      <input type="text" value={formDimensions} onChange={(e) => setFormDimensions(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.3rem" }}>Capacity Limit</label>
                      <input type="text" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", borderRadius: "0.5rem", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.35rem" }}>Picture Image</label>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "#181818", border: "1px solid rgba(255,255,255,0.1)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                      <img 
                        src={editingItem?.image || "/images/canopy-tent.png"} 
                        alt="Preview" 
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "0.35rem", background: "#111111" }} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/canopy-tent.png"; }}
                      />
                      {editingItem ? (
                        <label style={{ padding: "0.4rem 0.875rem", borderRadius: "0.35rem", border: "1px solid rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.06)", color: "#D4AF37", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                          Upload New File
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleUploadImage(editingItem.id, e)} 
                            style={{ display: "none" }} 
                          />
                        </label>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Save item first to upload picture</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "#D4AF37", border: "none", color: "#000000", fontWeight: 750, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOKINGS LIST */}
        {activeTab === "bookings" && (
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.5rem" }}>Customer Quote Requests &amp; Orders</h3>

            {bookings.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>No bookings found in the database.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {bookings.map((booking) => (
                  <div key={booking.id} style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.75rem", background: "#161616", padding: "1.5rem" }}>
                    
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "#D4AF37", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Booking Reference</span>
                        <span style={{ fontSize: "1.1rem", color: "#ffffff", fontWeight: 800 }}>{booking.id}</span>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "0.25rem" }}>Submitted On</span>
                        <span style={{ fontSize: "0.82rem", color: "#ffffff" }}>{new Date(booking.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Columns */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
                      
                      {/* Client */}
                      <div>
                        <h4 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 700, marginBottom: "0.5rem" }}>Customer</h4>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ffffff", marginBottom: "0.2rem" }}>{booking.customer.name}</p>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)" }}><a href={`mailto:${booking.customer.email}`} style={{ color: "inherit", textDecoration: "none" }}>{booking.customer.email}</a></p>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)" }}><a href={`tel:${booking.customer.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{booking.customer.phone}</a></p>
                      </div>

                      {/* Event */}
                      <div>
                        <h4 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 700, marginBottom: "0.5rem" }}>Event Details</h4>
                        <p style={{ fontSize: "0.9rem", color: "#ffffff", fontWeight: 600, marginBottom: "0.25rem" }}>{booking.event.type}</p>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>Date: <strong style={{ color: "#ffffff" }}>{booking.event.date}</strong></p>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>Guests: {booking.event.guestCount}</p>
                        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>Setup: {booking.event.location}</p>
                      </div>

                      {/* Delivery */}
                      <div>
                        <h4 style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "#D4AF37", fontWeight: 700, marginBottom: "0.5rem" }}>Delivery Address</h4>
                        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                          {booking.delivery.address}<br />
                          {booking.delivery.city}, VA {booking.delivery.zipCode}
                        </p>
                      </div>

                      {/* Financials & Action */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", display: "block" }}>Estimated Rental Total</span>
                          <span style={{ fontSize: "1.35rem", color: "#D4AF37", fontWeight: 900 }}>{formatPrice(booking.estimatedTotal)}</span>
                          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", display: "block", marginTop: "0.15rem" }}>Via {booking.paymentMethod}</span>
                        </div>
                        
                        <Link
                          href={`/portal/invoice/${booking.id}`}
                          target="_blank"
                          style={{ padding: "0.45rem 1rem", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "0.5rem", background: "rgba(212,175,55,0.06)", color: "#D4AF37", fontSize: "0.8rem", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <Eye size={13} /> View Invoice
                        </Link>
                      </div>
                    </div>

                    {/* Booked Items list */}
                    <div style={{ marginTop: "1rem", background: "#111111", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "0.5rem", padding: "0.75rem 1rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Booked Items</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                        {Object.entries(booking.items).map(([itemId, qty]) => {
                          const item = inventory.find((i) => i.id === itemId);
                          return (
                            <div key={itemId} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)" }}>
                              <strong style={{ color: "#ffffff" }}>{item ? item.title : `Item #${itemId}`}</strong> × {qty}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", borderLeft: "2px solid #D4AF37", paddingLeft: "0.75rem" }}>
                        <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Client Notes:</span> {booking.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "2rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.5rem" }}>System Configuration</h3>
            
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "600px" }}>
              <div style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.25rem" }}>Tent Layout &amp; Spacing Simulator</h4>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                      Toggle this switch to enable or disable the interactive planner widget on the main website and landing pages.
                    </p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "48px", height: "24px", cursor: "pointer", flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={tentPlannerEnabled}
                      onChange={(e) => setTentPlannerEnabled(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: tentPlannerEnabled ? "#D4AF37" : "#333333",
                        transition: "0.3s",
                        borderRadius: "24px",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        content: '""',
                        height: "18px", width: "18px",
                        left: tentPlannerEnabled ? "26px" : "4px",
                        bottom: "3px",
                        backgroundColor: "#ffffff",
                        transition: "0.3s",
                        borderRadius: "50%",
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  alignSelf: "flex-start",
                  padding: "0.75rem 2rem",
                  borderRadius: "0.5rem",
                  background: "#D4AF37",
                  border: "none",
                  color: "#000000",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: savingSettings ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 12px rgba(212,175,55,0.2)",
                  opacity: savingSettings ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {savingSettings ? "Saving Settings..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
