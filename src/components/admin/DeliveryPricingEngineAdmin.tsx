"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Sliders,
  DollarSign,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  Calculator,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Package,
  Wrench,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Save,
  Zap,
  Info
} from "lucide-react";
import {
  DeliveryEngineConfig,
  DeliveryRule,
  DeliveryStrategy,
  Vehicle,
  LaborConfig,
  TravelConfig,
  HandlingFee,
  DeliveryZone,
  DeliveryProfile,
  DeliveryAuditLog,
  RuleConditionGroup,
  RuleCondition,
  ConditionField,
  ConditionOperator,
  StrategyType
} from "@/types/delivery";

interface Props {
  inventoryItems?: any[];
  onSaveInventoryLogistics?: (itemId: string, logistics: any) => Promise<void>;
}

type SubTab =
  | "strategies"
  | "rules"
  | "vehicles"
  | "labor"
  | "travel"
  | "handling"
  | "product_logistics"
  | "zones"
  | "profiles"
  | "calculator"
  | "audit";

export default function DeliveryPricingEngineAdmin({ inventoryItems = [], onSaveInventoryLogistics }: Props) {
  const [activeTab, setActiveTab] = useState<SubTab>("strategies");
  const [config, setConfig] = useState<DeliveryEngineConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<DeliveryAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveReason, setSaveReason] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editor states
  const [editingRule, setEditingRule] = useState<DeliveryRule | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [editingHandling, setEditingHandling] = useState<HandlingFee | null>(null);
  const [editingProfile, setEditingProfile] = useState<DeliveryProfile | null>(null);
  const [editingLogisticsItem, setEditingLogisticsItem] = useState<any | null>(null);

  // Delivery Simulator state
  const [simInput, setSimInput] = useState({
    orderTotal: 1250,
    deliveryDistanceMiles: 18,
    travelTimeMinutes: 35,
    zipCode: "23456",
    city: "Virginia Beach",
    customerType: "standard" as "standard" | "vip" | "corporate" | "repeat",
    eventDate: new Date().toISOString().split("T")[0],
    handlingOptions: [] as string[],
    itemCounts: {} as Record<string, number>
  });
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchDeliveryConfig();
  }, []);

  async function fetchDeliveryConfig() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/delivery");
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setAuditLogs(data.auditLogs || []);
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to load delivery settings." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error loading delivery settings." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig(updatedConfig: DeliveryEngineConfig, reasonText: string) {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: updatedConfig, reason: reasonText || "Updated via Delivery CMS" })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setAuditLogs(data.auditLogs || []);
        setFeedback({ type: "success", text: "Delivery Pricing & Rules Engine settings saved successfully!" });
        setShowSaveModal(false);
        setSaveReason("");
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to save configuration." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  }

  async function handleRollback(auditId: string) {
    if (!confirm("Are you sure you want to roll back delivery engine settings to this previous snapshot?")) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/delivery/audit/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, reason: "Manual rollback triggered by admin" })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        setAuditLogs(data.auditLogs || []);
        setFeedback({ type: "success", text: "Successfully rolled back delivery configuration!" });
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to rollback configuration." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Rollback network error." });
    } finally {
      setSaving(false);
    }
  }

  async function runSimulation() {
    if (!config) return;
    try {
      setSimulating(true);
      const itemsPayload = Object.entries(simInput.itemCounts)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const inv = inventoryItems.find(i => i.id === id);
          return {
            id,
            quantity: qty,
            title: inv?.title || "Item",
            category: inv?.category || "Rentals",
            price: inv?.price || 100,
            logistics: inv?.logistics
          };
        });

      const payload = {
        items: itemsPayload.length > 0 ? itemsPayload : [
          { id: "demo-1", quantity: 1, title: "Standard Bounce House", category: "Bounce Houses", price: 250 },
          { id: "demo-2", quantity: 2, title: "6ft Folding Table", category: "Tables", price: 15 },
          { id: "demo-3", quantity: 12, title: "White Folding Chair", category: "Chairs", price: 3 }
        ],
        orderTotal: simInput.orderTotal,
        deliveryDistanceMiles: simInput.deliveryDistanceMiles,
        travelTimeMinutes: simInput.travelTimeMinutes,
        zipCode: simInput.zipCode,
        city: simInput.city,
        customerType: simInput.customerType,
        eventDate: simInput.eventDate,
        handlingOptions: simInput.handlingOptions
      };

      const res = await fetch("/api/delivery/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Simulation error." });
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
        <div style={{ display: "inline-block", width: "2rem", height: "2rem", border: "3px solid #D4AF37", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "1rem" }}>Loading Smart Delivery Engine CMS...</p>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div style={{ background: "rgba(18, 18, 22, 0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "16px", padding: "1.5rem", color: "#fff" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Truck style={{ color: "#D4AF37", width: "28px", height: "28px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, color: "#fff" }}>
              Smart Delivery Pricing & Rules Engine <span style={{ fontSize: "0.85rem", background: "rgba(212,175,55,0.2)", color: "#D4AF37", padding: "0.2rem 0.6rem", borderRadius: "20px", marginLeft: "0.5rem" }}>v2.0</span>
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", margin: "0.3rem 0 0 0" }}>
            Configure delivery rules, pricing strategies, labor & travel math, fleet capacities, and simulate live checkout rates.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            Active Profile: <strong style={{ color: "#D4AF37" }}>{config.profiles.find(p => p.id === config.activeProfileId)?.name || "Standard"}</strong> (v{config.versionNumber})
          </span>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)", color: "#000", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)" }}
          >
            <Save style={{ width: "16px", height: "16px" }} /> Save Changes
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "8px", background: feedback.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", border: `1px solid ${feedback.type === "success" ? "#22c55e" : "#ef4444"}`, color: feedback.type === "success" ? "#4ade80" : "#f87171", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}><X style={{ width: "16px" }} /></button>
        </div>
      )}

      {/* ─── PRICING MODE SWITCHER ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem", background: "rgba(0,0,0,0.35)", border: "2px solid rgba(212,175,55,0.3)", borderRadius: "12px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Zap style={{ color: "#D4AF37", width: "20px", height: "20px" }} />
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "0.02em" }}>Delivery Pricing Mode</span>
          <span style={{ fontSize: "0.72rem", background: "rgba(212,175,55,0.15)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "20px", padding: "0.15rem 0.6rem", fontWeight: 700 }}>Live Setting</span>
        </div>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
          Choose how delivery fees are calculated for all customer bookings. <strong style={{ color: "#fff" }}>Fixed Price</strong> charges a single flat rate. <strong style={{ color: "#fff" }}>Smart Engine</strong> evaluates rules, vehicles, labor, travel distance, and venue logistics automatically.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {/* Fixed Price Card */}
          <button
            type="button"
            onClick={() => setConfig(prev => prev ? { ...prev, pricingMode: "fixed" } : prev)}
            style={{
              display: "flex", flexDirection: "column", gap: "0.5rem",
              padding: "1rem 1.1rem",
              background: config.pricingMode === "fixed" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: config.pricingMode === "fixed" ? "2px solid #D4AF37" : "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <DollarSign style={{ color: config.pricingMode === "fixed" ? "#D4AF37" : "rgba(255,255,255,0.5)", width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 800, color: config.pricingMode === "fixed" ? "#D4AF37" : "#fff", fontSize: "0.9rem" }}>Fixed Price Mode</span>
              {config.pricingMode === "fixed" && <span style={{ marginLeft: "auto", background: "#D4AF37", color: "#000", fontSize: "0.65rem", fontWeight: 800, borderRadius: "20px", padding: "0.1rem 0.5rem", letterSpacing: "0.05em" }}>ACTIVE</span>}
            </div>
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 500, lineHeight: 1.4 }}>
              Every order pays the same flat delivery rate. Venue handling add-ons (stairs, sand anchors, etc.) are still added on top.
            </span>
          </button>

          {/* Smart Engine Card */}
          <button
            type="button"
            onClick={() => setConfig(prev => prev ? { ...prev, pricingMode: "smart" } : prev)}
            style={{
              display: "flex", flexDirection: "column", gap: "0.5rem",
              padding: "1rem 1.1rem",
              background: config.pricingMode === "smart" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: config.pricingMode === "smart" ? "2px solid #D4AF37" : "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Zap style={{ color: config.pricingMode === "smart" ? "#D4AF37" : "rgba(255,255,255,0.5)", width: "18px", height: "18px" }} />
              <span style={{ fontWeight: 800, color: config.pricingMode === "smart" ? "#D4AF37" : "#fff", fontSize: "0.9rem" }}>Smart Rules Engine</span>
              {config.pricingMode === "smart" && <span style={{ marginLeft: "auto", background: "#D4AF37", color: "#000", fontSize: "0.65rem", fontWeight: 800, borderRadius: "20px", padding: "0.1rem 0.5rem", letterSpacing: "0.05em" }}>ACTIVE</span>}
            </div>
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", fontWeight: 500, lineHeight: 1.4 }}>
              Evaluates rules, strategies, vehicle type, labor time, travel distance, and zone pricing automatically per order.
            </span>
          </button>
        </div>

        {/* Fixed Price Amount Input — only shown when mode is fixed */}
        {config.pricingMode === "fixed" && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "8px", padding: "0.85rem 1rem" }}>
            <DollarSign style={{ color: "#D4AF37", flexShrink: 0, width: "18px", height: "18px" }} />
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
                Fixed Delivery Price (applies to all orders)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={config.fixedDeliveryPrice ?? 45}
                onChange={e => setConfig(prev => prev ? { ...prev, fixedDeliveryPrice: parseFloat(e.target.value) || 0 } : prev)}
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "6px", color: "#fff", fontSize: "1.1rem", fontWeight: 800, padding: "0.4rem 0.75rem", width: "140px", outline: "none" }}
              />
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
              Handling add-ons<br />(stairs, sand, etc.) still apply
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => handleSaveConfig(config, `Pricing mode changed to: ${config.pricingMode}${config.pricingMode === "fixed" ? ` (Fixed: $${config.fixedDeliveryPrice})` : ""}`)}
            disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)", color: "#000", border: "none", borderRadius: "8px", padding: "0.55rem 1.1rem", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", letterSpacing: "0.04em" }}
          >
            <Save style={{ width: "14px", height: "14px" }} />
            {saving ? "Saving…" : "Save Pricing Mode"}
          </button>
        </div>
      </div>
      {/* ─────────────────────────────────────────────────────────────────────────── */}


      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { id: "strategies", label: "Pricing Strategies", icon: Sliders },
          { id: "rules", label: "Delivery Rules", icon: ShieldCheck },
          { id: "vehicles", label: "Vehicles", icon: Truck },
          { id: "labor", label: "Labor", icon: Wrench },
          { id: "travel", label: "Travel", icon: Clock },
          { id: "handling", label: "Handling", icon: Layers },
          { id: "product_logistics", label: "Product Logistics", icon: Package },
          { id: "zones", label: "Delivery Zones", icon: MapPin },
          { id: "profiles", label: "Delivery Profiles", icon: UserCheck },
          { id: "calculator", label: "Delivery Calculator", icon: Calculator },
          { id: "audit", label: "Audit Log", icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: isActive ? "700" : "500",
                background: isActive ? "rgba(212, 175, 55, 0.18)" : "rgba(255,255,255,0.04)",
                color: isActive ? "#D4AF37" : "rgba(255,255,255,0.7)",
                border: isActive ? "1px solid rgba(212, 175, 55, 0.5)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Icon style={{ width: "15px", height: "15px" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: PRICING STRATEGIES */}
      {activeTab === "strategies" && (
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#fff" }}>Delivery Strategy Library</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {config.strategies.map(strat => (
              <div key={strat.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#D4AF37" }}>{strat.name}</h4>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Type: {strat.type}</span>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "0.4rem" }}>
                    <input
                      type="checkbox"
                      checked={strat.enabled}
                      onChange={e => {
                        const updated = config.strategies.map(s => s.id === strat.id ? { ...s, enabled: e.target.checked } : s);
                        setConfig({ ...config, strategies: updated });
                      }}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    <span style={{ fontSize: "0.8rem", color: strat.enabled ? "#4ade80" : "#94a3b8" }}>{strat.enabled ? "Active" : "Disabled"}</span>
                  </label>
                </div>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>{strat.description}</p>

                {/* Strategy Config Fields */}
                {strat.type === "fixed" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <label>Fixed Delivery Price ($):
                      <input
                        type="number"
                        value={(strat.config as any)?.deliveryPrice ?? 45}
                        onChange={e => {
                          const updated = config.strategies.map(s => s.id === strat.id ? { ...s, config: { ...s.config, deliveryPrice: Number(e.target.value) } } : s);
                          setConfig({ ...config, strategies: updated });
                        }}
                        style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                      />
                    </label>
                  </div>
                )}

                {strat.type === "free" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <label>Min Order Amount ($):
                      <input
                        type="number"
                        value={(strat.config as any)?.minOrderAmount ?? 2000}
                        onChange={e => {
                          const updated = config.strategies.map(s => s.id === strat.id ? { ...s, config: { ...s.config, minOrderAmount: Number(e.target.value) } } : s);
                          setConfig({ ...config, strategies: updated });
                        }}
                        style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                      />
                    </label>
                    <label>Max Free Distance (Miles):
                      <input
                        type="number"
                        value={(strat.config as any)?.maxDistance ?? 15}
                        onChange={e => {
                          const updated = config.strategies.map(s => s.id === strat.id ? { ...s, config: { ...s.config, maxDistance: Number(e.target.value) } } : s);
                          setConfig({ ...config, strategies: updated });
                        }}
                        style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: DELIVERY RULES */}
      {activeTab === "rules" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Delivery Rules Engine (Sequential Priority)</h3>
            <button
              onClick={() => setEditingRule({
                id: `rule-${Date.now()}`,
                name: "New Custom Delivery Rule",
                priority: config.rules.length + 1,
                enabled: true,
                strategyType: "fixed",
                conditions: { logic: "AND", conditions: [{ field: "orderTotal", operator: "greater_than", value: 1000 }] }
              })}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(212,175,55,0.2)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}
            >
              <Plus style={{ width: "14px" }} /> Add Rule
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {config.rules.map((rule, idx) => (
              <div key={rule.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(212,175,55,0.15)", color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" }}>
                    #{rule.priority}
                  </span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#fff" }}>{rule.name}</h4>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Strategy: <strong style={{ color: "#D4AF37" }}>{rule.strategyType.toUpperCase()}</strong></span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "12px", background: rule.enabled ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: rule.enabled ? "#4ade80" : "#f87171" }}>
                    {rule.enabled ? "Active" : "Disabled"}
                  </span>
                  <button
                    onClick={() => setEditingRule(rule)}
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <Edit2 style={{ width: "14px" }} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete rule "${rule.name}"?`)) {
                        setConfig({ ...config, rules: config.rules.filter(r => r.id !== rule.id) });
                      }
                    }}
                    style={{ background: "rgba(239,68,68,0.15)", border: "none", color: "#f87171", borderRadius: "6px", padding: "0.4rem 0.6rem", cursor: "pointer" }}
                  >
                    <Trash2 style={{ width: "14px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Rule Editor Modal */}
          {editingRule && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
              <div style={{ background: "#18181c", border: "1px solid #D4AF37", borderRadius: "14px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#D4AF37", fontSize: "1.2rem" }}>Edit Delivery Rule</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                  <label>Rule Name:
                    <input
                      type="text"
                      value={editingRule.name}
                      onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                    />
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <label>Priority Order:
                      <input
                        type="number"
                        value={editingRule.priority}
                        onChange={e => setEditingRule({ ...editingRule, priority: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                      />
                    </label>
                    <label>Assigned Strategy:
                      <select
                        value={editingRule.strategyType}
                        onChange={e => setEditingRule({ ...editingRule, strategyType: e.target.value as StrategyType })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                      >
                        <option value="fixed">Fixed Delivery</option>
                        <option value="free">Free Delivery</option>
                        <option value="distance">Distance Pricing</option>
                        <option value="zones">Delivery Zones</option>
                        <option value="dynamic">Dynamic Delivery Engine</option>
                        <option value="manual">Manual Quote Required</option>
                      </select>
                    </label>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <input
                      type="checkbox"
                      checked={editingRule.enabled}
                      onChange={e => setEditingRule({ ...editingRule, enabled: e.target.checked })}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    Enable Rule
                  </label>

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <h5 style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>Conditions (Logic: AND)</h5>
                    {(editingRule.conditions.conditions as RuleCondition[]).map((cond, cIdx) => (
                      <div key={cIdx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.4rem", marginBottom: "0.5rem" }}>
                        <select
                          value={cond.field}
                          onChange={e => {
                            const newConds = [...editingRule.conditions.conditions];
                            (newConds[cIdx] as RuleCondition).field = e.target.value as ConditionField;
                            setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, conditions: newConds } });
                          }}
                          style={{ padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                        >
                          <option value="orderTotal">Order Total ($)</option>
                          <option value="itemCount">Total Item Count</option>
                          <option value="deliveryDistance">Delivery Distance (mi)</option>
                          <option value="travelTime">Travel Time (mins)</option>
                          <option value="customerType">Customer Type</option>
                          <option value="zipCode">ZIP Code</option>
                        </select>
                        <select
                          value={cond.operator}
                          onChange={e => {
                            const newConds = [...editingRule.conditions.conditions];
                            (newConds[cIdx] as RuleCondition).operator = e.target.value as ConditionOperator;
                            setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, conditions: newConds } });
                          }}
                          style={{ padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                        >
                          <option value="equals">Equals (=)</option>
                          <option value="greater_than">Greater Than (&gt;)</option>
                          <option value="less_than">Less Than (&lt;)</option>
                          <option value="contains">Contains</option>
                        </select>
                        <input
                          type="text"
                          value={cond.value}
                          onChange={e => {
                            const newConds = [...editingRule.conditions.conditions];
                            (newConds[cIdx] as RuleCondition).value = e.target.value;
                            setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, conditions: newConds } });
                          }}
                          style={{ padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                        />
                        <button
                          onClick={() => {
                            const newConds = editingRule.conditions.conditions.filter((_, i) => i !== cIdx);
                            setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, conditions: newConds } });
                          }}
                          style={{ background: "rgba(239,68,68,0.2)", border: "none", color: "#f87171", borderRadius: "6px", padding: "0.4rem" }}
                        >
                          <Trash2 style={{ width: "14px" }} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newConds = [...editingRule.conditions.conditions, { field: "orderTotal" as ConditionField, operator: "greater_than" as ConditionOperator, value: 500 }];
                        setEditingRule({ ...editingRule, conditions: { ...editingRule.conditions, conditions: newConds } });
                      }}
                      style={{ fontSize: "0.8rem", color: "#D4AF37", background: "none", border: "1px dashed #D4AF37", borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer", marginTop: "0.4rem" }}
                    >
                      + Add Condition
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                    <button onClick={() => setEditingRule(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>Cancel</button>
                    <button
                      onClick={() => {
                        const exists = config.rules.some(r => r.id === editingRule.id);
                        const updatedRules = exists ? config.rules.map(r => r.id === editingRule.id ? editingRule : r) : [...config.rules, editingRule];
                        setConfig({ ...config, rules: updatedRules });
                        setEditingRule(null);
                      }}
                      style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", fontWeight: "700", cursor: "pointer" }}
                    >
                      Save Rule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: VEHICLES */}
      {activeTab === "vehicles" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Delivery Fleet Vehicles</h3>
            <button
              onClick={() => setEditingVehicle({
                id: `veh-${Date.now()}`,
                name: "New Delivery Vehicle",
                enabled: true,
                priority: config.vehicles.length + 1,
                baseCost: 50,
                maxPoints: 100,
                maxWeight: 2000,
                maxCubicFeet: 300,
                maxItemCount: 60,
                maxTentSize: 400,
                maxChairCount: 150,
                maxTableCount: 20,
                requiresCDL: false
              })}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(212,175,55,0.2)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}
            >
              <Plus style={{ width: "14px" }} /> Add Vehicle
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {config.vehicles.map(v => (
              <div key={v.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ margin: 0, color: "#D4AF37", fontSize: "1.05rem" }}>{v.name}</h4>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#fff" }}>${v.baseCost} Base</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem", margin: "0.75rem 0" }}>
                  <div>Points Cap: <strong>{v.maxPoints}</strong></div>
                  <div>Max Weight: <strong>{v.maxWeight} lbs</strong></div>
                  <div>Volume Cap: <strong>{v.maxCubicFeet} cu ft</strong></div>
                  <div>Chair Cap: <strong>{v.maxChairCount}</strong></div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button onClick={() => setEditingVehicle(v)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.4rem 0.6rem", fontSize: "0.8rem", cursor: "pointer" }}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 4: LABOR */}
      {activeTab === "labor" && (
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Labor Cost Module</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", fontSize: "0.85rem" }}>
            <label>Hourly Rate ($):
              <input
                type="number"
                value={config.labor.hourlyRate}
                onChange={e => setConfig({ ...config, labor: { ...config.labor, hourlyRate: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Min Labor Charge ($):
              <input
                type="number"
                value={config.labor.minCharge}
                onChange={e => setConfig({ ...config, labor: { ...config.labor, minCharge: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Weekend Multiplier:
              <input
                type="number"
                step="0.05"
                value={config.labor.weekendMultiplier}
                onChange={e => setConfig({ ...config, labor: { ...config.labor, weekendMultiplier: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Holiday Multiplier:
              <input
                type="number"
                step="0.05"
                value={config.labor.holidayMultiplier}
                onChange={e => setConfig({ ...config, labor: { ...config.labor, holidayMultiplier: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
          </div>
        </div>
      )}

      {/* SUB TAB 5: TRAVEL */}
      {activeTab === "travel" && (
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Travel & Mileage Module</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", fontSize: "0.85rem" }}>
            <label>Base Travel Fee ($):
              <input
                type="number"
                value={config.travel.baseFee}
                onChange={e => setConfig({ ...config, travel: { ...config.travel, baseFee: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Cost Per Mile ($):
              <input
                type="number"
                step="0.10"
                value={config.travel.costPerMile}
                onChange={e => setConfig({ ...config, travel: { ...config.travel, costPerMile: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Cost Per Minute ($):
              <input
                type="number"
                step="0.05"
                value={config.travel.costPerMinute}
                onChange={e => setConfig({ ...config, travel: { ...config.travel, costPerMinute: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
            <label>Fuel Surcharge ($):
              <input
                type="number"
                value={config.travel.fuelSurcharge}
                onChange={e => setConfig({ ...config, travel: { ...config.travel, fuelSurcharge: Number(e.target.value) } })}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
              />
            </label>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════
          SUB TAB 6: HANDLING FEES
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "handling" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem 0" }}>Handling Fees</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                Venue logistics add-ons charged on top of the base delivery fee when customers select them in checkout.
              </p>
            </div>
            <button
              onClick={() => setEditingHandling({
                id: `hand-${Date.now()}`,
                name: "New Handling Fee",
                feeType: "flat",
                amount: 25,
                enabled: true
              })}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(212,175,55,0.2)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.45rem 0.9rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              <Plus style={{ width: "14px" }} /> Add Fee
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "0.75rem" }}>
            {config.handling.map(fee => (
              <div key={fee.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${fee.enabled ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: fee.enabled ? "#fff" : "rgba(255,255,255,0.45)" }}>{fee.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", marginTop: "0.15rem" }}>ID: {fee.id}</div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: fee.enabled ? "#D4AF37" : "rgba(255,255,255,0.3)" }}>
                    {fee.feeType === "percentage" ? `${fee.amount}%` : `$${fee.amount}`}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem" }}>
                  <span style={{ padding: "0.15rem 0.5rem", borderRadius: "20px", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                    {fee.feeType}
                  </span>
                  <span style={{ padding: "0.15rem 0.5rem", borderRadius: "20px", background: fee.enabled ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)", color: fee.enabled ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                    {fee.enabled ? "Active" : "Disabled"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <button
                    onClick={() => {
                      const updated = config.handling.map(h => h.id === fee.id ? { ...h, enabled: !h.enabled } : h);
                      setConfig({ ...config, handling: updated });
                    }}
                    style={{ flex: 1, background: fee.enabled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${fee.enabled ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, color: fee.enabled ? "#f87171" : "#4ade80", borderRadius: "6px", padding: "0.35rem", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}
                  >
                    {fee.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => setEditingHandling({ ...fee })}
                    style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "6px", padding: "0.35rem", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}
                  >
                    <Edit2 style={{ width: "12px" }} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete handling fee "${fee.name}"?`)) {
                        setConfig({ ...config, handling: config.handling.filter(h => h.id !== fee.id) });
                      }
                    }}
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer" }}
                  >
                    <Trash2 style={{ width: "13px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Handling Fee Editor Modal */}
          {editingHandling && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
              <div style={{ background: "#18181c", border: "1px solid #D4AF37", borderRadius: "14px", width: "100%", maxWidth: "480px", padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1.25rem 0", color: "#D4AF37", fontSize: "1.1rem" }}>
                  {config.handling.some(h => h.id === editingHandling.id) ? "Edit" : "New"} Handling Fee
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                  <label>Fee Name:
                    <input type="text" value={editingHandling.name}
                      onChange={e => setEditingHandling({ ...editingHandling, name: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                    />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <label>Fee Type:
                      <select value={editingHandling.feeType}
                        onChange={e => setEditingHandling({ ...editingHandling, feeType: e.target.value as "flat" | "percentage" | "per_item" | "per_point" })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      >
                        <option value="flat">Flat ($)</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="per_item">Per Item</option>
                        <option value="per_point">Per Delivery Point</option>
                      </select>
                    </label>
                    <label>Amount ({editingHandling.feeType === "percentage" ? "%" : "$"}):
                      <input type="number" min={0} step={0.5} value={editingHandling.amount}
                        onChange={e => setEditingHandling({ ...editingHandling, amount: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" checked={editingHandling.enabled}
                      onChange={e => setEditingHandling({ ...editingHandling, enabled: e.target.checked })}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    Enabled (shown during checkout)
                  </label>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button onClick={() => setEditingHandling(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>Cancel</button>
                    <button
                      onClick={() => {
                        const exists = config.handling.some(h => h.id === editingHandling.id);
                        const updated = exists
                          ? config.handling.map(h => h.id === editingHandling.id ? editingHandling : h)
                          : [...config.handling, editingHandling];
                        setConfig({ ...config, handling: updated });
                        setEditingHandling(null);
                      }}
                      style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.5rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Fee
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowSaveModal(true)} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#D4AF37,#AA7C11)", color: "#000", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
            >
              <Save style={{ width: "15px" }} /> Save Handling Fees
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SUB TAB 7: PRODUCT LOGISTICS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "product_logistics" && (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.3rem 0" }}>Product Logistics Profiles</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Set per-item delivery metadata: weight, volume, delivery points, setup time, and special handling flags.
              These values drive automatic vehicle selection and labor cost calculation in the Smart Delivery Engine.
            </p>
          </div>

          {inventoryItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.4)", fontSize: "0.88rem" }}>
              <Package style={{ width: "28px", height: "28px", marginBottom: "0.75rem", opacity: 0.4 }} />
              <div>No inventory items found. Add items to your inventory first, then configure their logistics here.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {inventoryItems.map(item => {
                const logistics = item.logistics || {};
                const isEditing = editingLogisticsItem?.id === item.id;
                return (
                  <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isEditing ? "#D4AF37" : "rgba(255,255,255,0.07)"}`, borderRadius: "10px", padding: "0.9rem 1rem", transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.92rem" }}>{item.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.15rem" }}>
                          {item.category} · ${item.price} · ID: {item.id}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textAlign: "right" }}>
                          <div>{logistics.deliveryPoints ?? 5} pts · {logistics.weight ?? 25} lbs</div>
                          <div>{logistics.volume ?? 10} cu ft · {logistics.avgSetupMinutes ?? 10} min setup</div>
                        </div>
                        <button
                          onClick={() => setEditingLogisticsItem(isEditing ? null : { ...item, logistics: { deliveryPoints: 5, weight: 25, volume: 10, avgLoadingMinutes: 5, avgUnloadingMinutes: 5, avgSetupMinutes: 10, avgBreakdownMinutes: 10, stackable: true, fragile: false, installationRequired: false, requiresDolly: false, requiresLiftGate: false, requiresTwoWorkers: false, requiresThreeWorkers: false, ...logistics } })}
                          style={{ background: isEditing ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.07)", border: isEditing ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.1)", color: isEditing ? "#D4AF37" : "#fff", borderRadius: "6px", padding: "0.35rem 0.75rem", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                        >
                          <Edit2 style={{ width: "12px" }} /> {isEditing ? "Close" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", fontSize: "0.82rem" }}>
                          {[
                            { key: "deliveryPoints", label: "Delivery Points", step: 1 },
                            { key: "weight", label: "Weight (lbs)", step: 1 },
                            { key: "volume", label: "Volume (cu ft)", step: 1 },
                            { key: "avgLoadingMinutes", label: "Loading Time (min)", step: 1 },
                            { key: "avgUnloadingMinutes", label: "Unloading Time (min)", step: 1 },
                            { key: "avgSetupMinutes", label: "Setup Time (min)", step: 1 },
                            { key: "avgBreakdownMinutes", label: "Breakdown Time (min)", step: 1 },
                          ].map(({ key, label, step }) => (
                            <label key={key}>{label}:
                              <input type="number" min={0} step={step}
                                value={(editingLogisticsItem.logistics as any)[key] ?? 0}
                                onChange={e => setEditingLogisticsItem({ ...editingLogisticsItem, logistics: { ...editingLogisticsItem.logistics, [key]: Number(e.target.value) } })}
                                style={{ width: "100%", padding: "0.4rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", marginTop: "0.2rem" }}
                              />
                            </label>
                          ))}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.75rem", fontSize: "0.82rem" }}>
                          {[
                            { key: "stackable", label: "Stackable" },
                            { key: "fragile", label: "Fragile" },
                            { key: "requiresDolly", label: "Requires Dolly" },
                            { key: "requiresLiftGate", label: "Requires Liftgate" },
                            { key: "requiresTwoWorkers", label: "Requires 2 Workers" },
                            { key: "requiresThreeWorkers", label: "Requires 3 Workers" },
                            { key: "installationRequired", label: "Installation Required" },
                          ].map(({ key, label }) => (
                            <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>
                              <input type="checkbox"
                                checked={(editingLogisticsItem.logistics as any)[key] ?? false}
                                onChange={e => setEditingLogisticsItem({ ...editingLogisticsItem, logistics: { ...editingLogisticsItem.logistics, [key]: e.target.checked } })}
                                style={{ accentColor: "#D4AF37" }}
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                          <button onClick={() => setEditingLogisticsItem(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.45rem 0.9rem", cursor: "pointer", fontSize: "0.82rem" }}>Cancel</button>
                          <button
                            onClick={async () => {
                              if (onSaveInventoryLogistics) {
                                await onSaveInventoryLogistics(editingLogisticsItem.id, editingLogisticsItem.logistics);
                              }
                              setEditingLogisticsItem(null);
                              setFeedback({ type: "success", text: `Logistics saved for "${editingLogisticsItem.title}"` });
                            }}
                            style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.45rem 1.1rem", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
                          >
                            <Save style={{ width: "13px", display: "inline", marginRight: "4px" }} />
                            Save Logistics
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SUB TAB 8: DELIVERY ZONES
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "zones" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem 0" }}>Delivery Zones</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
                Define ZIP-code based pricing tiers. Matched by customer ZIP at checkout when the "Zones" strategy is active.
              </p>
            </div>
            <button
              onClick={() => setEditingZone({
                id: `zone-${Date.now()}`,
                name: "New Zone",
                zipCodes: [],
                price: 55,
                enabled: true,
                priority: config.zones.length + 1
              })}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(212,175,55,0.2)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.45rem 0.9rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              <Plus style={{ width: "14px" }} /> Add Zone
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {config.zones
              .slice()
              .sort((a, b) => a.priority - b.priority)
              .map(zone => (
                <div key={zone.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${zone.enabled ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "1rem 1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(212,175,55,0.15)", color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.85rem", flexShrink: 0 }}>
                        #{zone.priority}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: zone.enabled ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>{zone.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.1rem" }}>
                          {zone.zipCodes.length} ZIP codes · ${zone.price} flat rate
                          {zone.radius ? ` · ${zone.radius} mi radius` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: zone.enabled ? "#D4AF37" : "rgba(255,255,255,0.3)" }}>
                        ${zone.price}
                      </span>
                      <span style={{ padding: "0.2rem 0.55rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700, background: zone.enabled ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)", color: zone.enabled ? "#4ade80" : "#f87171" }}>
                        {zone.enabled ? "Active" : "Off"}
                      </span>
                      <button
                        onClick={() => {
                          const updated = config.zones.map(z => z.id === zone.id ? { ...z, enabled: !z.enabled } : z);
                          setConfig({ ...config, zones: updated });
                        }}
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "6px", padding: "0.35rem 0.65rem", fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        Toggle
                      </button>
                      <button onClick={() => setEditingZone({ ...zone })} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
                        <Edit2 style={{ width: "12px" }} /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete zone "${zone.name}"?`)) setConfig({ ...config, zones: config.zones.filter(z => z.id !== zone.id) }); }}
                        style={{ background: "rgba(239,68,68,0.12)", border: "none", color: "#f87171", borderRadius: "6px", padding: "0.35rem 0.6rem", cursor: "pointer" }}
                      >
                        <Trash2 style={{ width: "13px" }} />
                      </button>
                    </div>
                  </div>

                  {zone.zipCodes.length > 0 && (
                    <div style={{ marginTop: "0.65rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {zone.zipCodes.map(z => (
                        <span key={z} style={{ fontSize: "0.7rem", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "4px", padding: "0.1rem 0.4rem", color: "#D4AF37", fontWeight: 600 }}>{z}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Zone Editor Modal */}
          {editingZone && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
              <div style={{ background: "#18181c", border: "1px solid #D4AF37", borderRadius: "14px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1.25rem 0", color: "#D4AF37", fontSize: "1.1rem" }}>
                  {config.zones.some(z => z.id === editingZone.id) ? "Edit" : "New"} Delivery Zone
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.75rem" }}>
                    <label>Zone Name:
                      <input type="text" value={editingZone.name}
                        onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                    <label>Flat Price ($):
                      <input type="number" min={0} step={5} value={editingZone.price}
                        onChange={e => setEditingZone({ ...editingZone, price: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                    <label>Priority (#):
                      <input type="number" min={1} value={editingZone.priority}
                        onChange={e => setEditingZone({ ...editingZone, priority: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                  </div>
                  <label>Radius Override (miles, optional — leave 0 to use ZIP codes only):
                    <input type="number" min={0} step={5} value={editingZone.radius ?? 0}
                      onChange={e => setEditingZone({ ...editingZone, radius: Number(e.target.value) || undefined })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                    />
                  </label>
                  <label>ZIP Codes (comma-separated):
                    <textarea
                      value={editingZone.zipCodes.join(", ")}
                      onChange={e => setEditingZone({ ...editingZone, zipCodes: e.target.value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean) })}
                      rows={3}
                      placeholder="e.g. 23451, 23452, 23453"
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem", resize: "vertical", fontFamily: "monospace", fontSize: "0.82rem" }}
                    />
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{editingZone.zipCodes.length} ZIP codes entered</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" checked={editingZone.enabled}
                      onChange={e => setEditingZone({ ...editingZone, enabled: e.target.checked })}
                      style={{ accentColor: "#D4AF37" }}
                    />
                    Zone Active
                  </label>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button onClick={() => setEditingZone(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>Cancel</button>
                    <button
                      onClick={() => {
                        const exists = config.zones.some(z => z.id === editingZone.id);
                        const updated = exists
                          ? config.zones.map(z => z.id === editingZone.id ? editingZone : z)
                          : [...config.zones, editingZone];
                        setConfig({ ...config, zones: updated });
                        setEditingZone(null);
                      }}
                      style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.5rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Zone
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowSaveModal(true)} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#D4AF37,#AA7C11)", color: "#000", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
            >
              <Save style={{ width: "15px" }} /> Save Delivery Zones
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SUB TAB 9: DELIVERY PROFILES
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "profiles" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem 0" }}>Delivery Profiles</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                Profiles group delivery rules into named configurations (e.g. Summer Pricing, Wedding Season). Only rules in the active profile are evaluated.
              </p>
            </div>
            <button
              onClick={() => setEditingProfile({
                id: `profile-${Date.now()}`,
                name: "New Profile",
                active: false,
                notes: "",
                ruleIds: []
              })}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(212,175,55,0.2)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.45rem 0.9rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              <Plus style={{ width: "14px" }} /> New Profile
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {config.profiles.map(profile => {
              const isActive = config.activeProfileId === profile.id;
              return (
                <div key={profile.id} style={{ background: isActive ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.03)", border: `${isActive ? "2px" : "1px"} solid ${isActive ? "#D4AF37" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "1rem 1.1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontWeight: 700, color: isActive ? "#D4AF37" : "#fff", fontSize: "1rem" }}>{profile.name}</span>
                        {isActive && (
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "#D4AF37", color: "#000", borderRadius: "20px", padding: "0.1rem 0.55rem", letterSpacing: "0.05em" }}>ACTIVE</span>
                        )}
                      </div>
                      {profile.notes && (
                        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>{profile.notes}</div>
                      )}
                      <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "0.2rem" }}>
                        {profile.ruleIds && profile.ruleIds.length > 0
                          ? `${profile.ruleIds.length} rule(s) assigned`
                          : "All rules included (no filter)"}
                        {profile.scheduledStart && ` · From ${profile.scheduledStart}`}
                        {profile.scheduledEnd && ` to ${profile.scheduledEnd}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {!isActive && (
                        <button
                          onClick={() => {
                            const updated = { ...config, activeProfileId: profile.id };
                            setConfig(updated);
                            setFeedback({ type: "success", text: `"${profile.name}" is now the active delivery profile.` });
                          }}
                          style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.5)", color: "#D4AF37", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}
                        >
                          Set Active
                        </button>
                      )}
                      <button onClick={() => setEditingProfile({ ...profile, ruleIds: profile.ruleIds || [] })} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: "6px", padding: "0.4rem 0.75rem", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Edit2 style={{ width: "12px" }} /> Edit
                      </button>
                      {!isActive && (
                        <button
                          onClick={() => { if (confirm(`Delete profile "${profile.name}"?`)) setConfig({ ...config, profiles: config.profiles.filter(p => p.id !== profile.id) }); }}
                          style={{ background: "rgba(239,68,68,0.12)", border: "none", color: "#f87171", borderRadius: "6px", padding: "0.4rem 0.65rem", cursor: "pointer" }}
                        >
                          <Trash2 style={{ width: "13px" }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Profile Editor Modal */}
          {editingProfile && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
              <div style={{ background: "#18181c", border: "1px solid #D4AF37", borderRadius: "14px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1.25rem 0", color: "#D4AF37", fontSize: "1.1rem" }}>
                  {config.profiles.some(p => p.id === editingProfile.id) ? "Edit" : "New"} Delivery Profile
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                  <label>Profile Name:
                    <input type="text" value={editingProfile.name}
                      onChange={e => setEditingProfile({ ...editingProfile, name: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                    />
                  </label>
                  <label>Notes / Description:
                    <textarea value={editingProfile.notes ?? ""}
                      onChange={e => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                      rows={2}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem", resize: "vertical" }}
                    />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <label>Schedule Start (optional):
                      <input type="date" value={editingProfile.scheduledStart ?? ""}
                        onChange={e => setEditingProfile({ ...editingProfile, scheduledStart: e.target.value || undefined })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                    <label>Schedule End (optional):
                      <input type="date" value={editingProfile.scheduledEnd ?? ""}
                        onChange={e => setEditingProfile({ ...editingProfile, scheduledEnd: e.target.value || undefined })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.25rem" }}
                      />
                    </label>
                  </div>

                  <div>
                    <div style={{ marginBottom: "0.4rem", fontWeight: 600 }}>Assign Rules to this Profile:</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.5rem" }}>
                      Leave all unchecked to include all rules. Check specific rules to restrict this profile.
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                      {config.rules.map(rule => (
                        <label key={rule.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "rgba(255,255,255,0.85)", padding: "0.35rem 0.5rem", borderRadius: "6px", background: editingProfile.ruleIds?.includes(rule.id) ? "rgba(212,175,55,0.08)" : "transparent" }}>
                          <input type="checkbox"
                            checked={editingProfile.ruleIds?.includes(rule.id) ?? false}
                            onChange={e => {
                              const current = editingProfile.ruleIds ?? [];
                              const updated = e.target.checked
                                ? [...current, rule.id]
                                : current.filter(id => id !== rule.id);
                              setEditingProfile({ ...editingProfile, ruleIds: updated });
                            }}
                            style={{ accentColor: "#D4AF37" }}
                          />
                          <span style={{ fontWeight: 600, color: rule.enabled ? "#fff" : "rgba(255,255,255,0.4)" }}>
                            #{rule.priority} {rule.name}
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#D4AF37" }}>{rule.strategyType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button onClick={() => setEditingProfile(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>Cancel</button>
                    <button
                      onClick={() => {
                        const exists = config.profiles.some(p => p.id === editingProfile.id);
                        const updated = exists
                          ? config.profiles.map(p => p.id === editingProfile.id ? editingProfile : p)
                          : [...config.profiles, editingProfile];
                        setConfig({ ...config, profiles: updated });
                        setEditingProfile(null);
                      }}
                      style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.5rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button
              onClick={() => setShowSaveModal(true)} disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#D4AF37,#AA7C11)", color: "#000", border: "none", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer" }}
            >
              <Save style={{ width: "15px" }} /> Save Profiles
            </button>
          </div>
        </div>
      )}


      {activeTab === "calculator" && (
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Delivery Price Simulator</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#D4AF37" }}>Test Order Inputs</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <label>Order Total ($):
                  <input
                    type="number"
                    value={simInput.orderTotal}
                    onChange={e => setSimInput({ ...simInput, orderTotal: Number(e.target.value) })}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <label>Distance (Miles):
                    <input
                      type="number"
                      value={simInput.deliveryDistanceMiles}
                      onChange={e => setSimInput({ ...simInput, deliveryDistanceMiles: Number(e.target.value) })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                    />
                  </label>
                  <label>ZIP Code:
                    <input
                      type="text"
                      value={simInput.zipCode}
                      onChange={e => setSimInput({ ...simInput, zipCode: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", marginTop: "0.2rem" }}
                    />
                  </label>
                </div>
                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  style={{ marginTop: "1rem", background: "#D4AF37", color: "#000", border: "none", borderRadius: "8px", padding: "0.6rem", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.4rem" }}
                >
                  <Zap style={{ width: "16px" }} /> Run Simulation
                </button>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "12px", padding: "1.25rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#D4AF37" }}>Simulation Output</h4>
              {simResult ? (
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#4ade80", marginBottom: "0.5rem" }}>
                    ${simResult.totalDeliveryFee?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}>
                    Matched Rule: <strong style={{ color: "#D4AF37" }}>{simResult.selectedRuleName}</strong> ({simResult.selectedStrategy})
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.4)", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <div>Vehicle: ${simResult.breakdown?.vehicleCost} ({simResult.vehicle?.name || "N/A"})</div>
                    <div>Travel: ${simResult.breakdown?.travelCost}</div>
                    <div>Labor: ${simResult.breakdown?.laborCost}</div>
                    <div>Handling: ${simResult.breakdown?.handlingCost}</div>
                    <div style={{ marginTop: "0.4rem", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                      Latency: {simResult.calculationTimeMs}ms
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Run simulation to inspect matching rule and delivery fee breakdown.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 11: AUDIT LOG */}
      {activeTab === "audit" && (
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Pricing Audit Log & Rollback History</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#D4AF37" }}>
                    Version #{log.versionNumber} – {log.action}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                    By {log.user} ({log.ipAddress}) on {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>
                    Reason: {log.reason}
                  </div>
                </div>
                <button
                  onClick={() => handleRollback(log.id)}
                  style={{ background: "rgba(212,175,55,0.15)", border: "1px solid #D4AF37", color: "#D4AF37", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <RotateCcw style={{ width: "14px" }} /> Rollback
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "#18181c", border: "1px solid #D4AF37", borderRadius: "14px", padding: "1.5rem", width: "100%", maxWidth: "450px" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#D4AF37" }}>Confirm Delivery Engine Changes</h4>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginBottom: "1rem" }}>
              Please state the reason for this pricing rule update to record in the Audit Log.
            </p>
            <input
              type="text"
              placeholder="e.g. Added weekend multiplier for summer rush"
              value={saveReason}
              onChange={e => setSaveReason(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button onClick={() => setShowSaveModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleSaveConfig(config, saveReason)} style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: "6px", padding: "0.5rem 1rem", fontWeight: "700", cursor: "pointer" }}>Save Version #{config.versionNumber + 1}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
