"use client";

import React, { useState, useMemo } from "react";
import {
  Book, Search, ChevronDown, ChevronRight, BarChart3, Package,
  Tag, Camera, Zap, Calendar, Truck, Globe, Settings, CheckCircle,
  AlertTriangle, Info, Lightbulb, ArrowRight, Star, Shield, Layers,
  Map, Users, DollarSign, Clock, RefreshCw, FileText, ToggleLeft,
  HelpCircle,
} from "lucide-react";

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  summary: string;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  content: React.ReactNode;
}

const Note = ({ type = "info", children }: { type?: "info" | "tip" | "warning" | "important"; children: React.ReactNode }) => {
  const map: Record<string, { bg: string; border: string; color: string; icon: React.ReactNode; label: string }> = {
    info:      { bg: "rgba(96,165,250,0.06)",  border: "rgba(96,165,250,0.25)",  color: "#60a5fa", icon: <Info style={{ width: 14 }} />,          label: "Note" },
    tip:       { bg: "rgba(212,175,55,0.07)",  border: "rgba(212,175,55,0.3)",   color: "#D4AF37", icon: <Lightbulb style={{ width: 14 }} />,      label: "Tip" },
    warning:   { bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.3)",   color: "#f59e0b", icon: <AlertTriangle style={{ width: 14 }} />,  label: "Warning" },
    important: { bg: "rgba(239,68,68,0.07)",   border: "rgba(239,68,68,0.25)",   color: "#ef4444", icon: <Shield style={{ width: 14 }} />,         label: "Important" },
  };
  const s = map[type];
  return (
    <div style={{ background: s.bg, border: "1px solid " + s.border, borderRadius: "8px", padding: "0.7rem 0.9rem", display: "flex", gap: "0.6rem", alignItems: "flex-start", marginTop: "0.75rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
      <span style={{ color: s.color, marginTop: "0.05rem" }}>{s.icon}</span>
      <span><strong style={{ color: s.color }}>{s.label}:</strong> {children}</span>
    </div>
  );
};

const Step = ({ num, children }: { num: number; children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginTop: "0.6rem" }}>
    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37", fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</span>
    <span style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>{children}</span>
  </div>
);

const Pill = ({ label, color = "#D4AF37" }: { label: string; color?: string }) => (
  <span style={{ display: "inline-block", padding: "0.1rem 0.5rem", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, border: "1px solid " + color + "44", color, background: color + "15", letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{label}</span>
);

const Row = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <span style={{ color: "#D4AF37", marginTop: "0.1rem", flexShrink: 0 }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.85rem" }}>{title}</div>
      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: "0.1rem", lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
);

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "overview", icon: <BarChart3 style={{ width: 18 }} />, title: "Dashboard & Overview", color: "#60a5fa",
    summary: "Your command centre — live stats, quick actions, and recent bookings at a glance.",
    articles: [
      { id: "overview-1", title: "What is the Overview Tab?", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The <strong style={{ color: "#fff" }}>Overview</strong> tab is your real-time business dashboard. It shows the most important metrics and recent activity without needing to dig through each section.</p>
          <Row icon={<DollarSign style={{ width: 15 }} />} title="Revenue Stats" desc="Total revenue, bookings this week, and average order value updated live." />
          <Row icon={<Calendar style={{ width: 15 }} />} title="Recent Bookings" desc="A live feed of the last 5 bookings with status badges and quick-action links." />
          <Row icon={<Package style={{ width: 15 }} />} title="Inventory Snapshot" desc="How many items are in your catalog, available vs. unavailable." />
          <Row icon={<Zap style={{ width: 15 }} />} title="Quick Actions" desc="One-click shortcuts: Add a Rental Item, Add a Category, Edit Hero Text, Manage Settings." />
          <Note type="tip">Bookmark the Overview as your starting point every morning — it gives a full picture of performance in seconds.</Note>
        </div>
      )},
    ],
  },
  {
    id: "inventory", icon: <Package style={{ width: 18 }} />, title: "Rentals & Equipment", color: "#D4AF37",
    summary: "Manage your complete rental catalog — add items, set prices, stock levels, and availability.",
    articles: [
      { id: "inv-1", title: "Adding a New Rental Item", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Everything in your rental catalog is managed here. Adding an item makes it immediately visible on your public website and available in the quote builder.</p>
          <Step num={1}>Click the <Pill label="+ Add Item" /> button at the top right of the Rentals &amp; Equipment panel.</Step>
          <Step num={2}>Fill in: <strong>Title</strong>, <strong>Category</strong>, <strong>Price Per Day</strong>, <strong>Deposit Amount</strong>, and a <strong>Description</strong>.</Step>
          <Step num={3}>Upload an <strong>image</strong> (recommended 800x600px or larger, 4:3 ratio).</Step>
          <Step num={4}>Set <strong>Availability</strong> to Active, then click <Pill label="Save Item" color="#22c55e" />.</Step>
          <Note type="tip">The Delivery Fee field is optional. If left at $0 the Delivery Pricing Engine will calculate it automatically based on location and order size.</Note>
        </div>
      )},
      { id: "inv-2", title: "Editing, Archiving & Deleting Items", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>You can edit any item at any time. Changes are saved instantly and reflected live on the public website.</p>
          <Row icon={<Star style={{ width: 15 }} />} title="Toggle Availability" desc="Click the toggle switch on any item card to mark it Available or Unavailable without opening the editor." />
          <Row icon={<FileText style={{ width: 15 }} />} title="Edit All Fields" desc="Click the pencil icon to open the full editor and change title, price, description, image, or category." />
          <Row icon={<RefreshCw style={{ width: 15 }} />} title="Duplicate Item" desc="Use the duplicate icon to clone an item as a starting point for a similar product." />
          <Note type="warning">Deleting an item is <strong>permanent</strong>. Toggle it to Unavailable instead of deleting if you want to temporarily hide it.</Note>
        </div>
      )},
      { id: "inv-3", title: "Stock Levels & Item Ratings", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Optionally set a <strong>Stock Level</strong> and a public <strong>Rating</strong> for each item. These appear as trust signals on the product card.</p>
          <Row icon={<Package style={{ width: 15 }} />} title="Stock" desc="How many units you own. Displayed as X available on the product card." />
          <Row icon={<Star style={{ width: 15 }} />} title="Rating & Reviews" desc="Set a star rating (1-5) and review count to display social proof on the rental listing." />
          <Note type="info">Stock levels are display-only. The system does not block bookings when stock reaches zero — that is by design for flexibility.</Note>
        </div>
      )},
    ],
  },
  {
    id: "categories", icon: <Tag style={{ width: 18 }} />, title: "Categories", color: "#a78bfa",
    summary: "Organise your rental catalog into labelled groups with icons, ordering, and featured flags.",
    articles: [
      { id: "cat-1", title: "Creating & Managing Categories", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Categories are the navigation groups customers use to filter the rental catalog (e.g., Bounce Houses, Water Slides, Tables &amp; Chairs, Photo Booths).</p>
          <Step num={1}>Click <Pill label="+ New Category" />.</Step>
          <Step num={2}>Enter a <strong>Category Name</strong> (shown to customers).</Step>
          <Step num={3}>Select an <strong>Icon</strong> from the icon picker.</Step>
          <Step num={4}>Set a <strong>Display Order</strong> — lower numbers appear first in the filter bar.</Step>
          <Step num={5}>Toggle <strong>Featured</strong> to highlight this category on the homepage.</Step>
          <Note type="tip">Category names automatically sync to all items assigned to them — renaming a category updates every product instantly.</Note>
        </div>
      )},
    ],
  },
  {
    id: "packages", icon: <Camera style={{ width: 18 }} />, title: "Packages & Add-ons", color: "#f472b6",
    summary: "Manage Photo Booth rental packages, hourly rate add-ons, and bundle extras.",
    articles: [
      { id: "pkg-1", title: "How Packages Work", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Packages let you create <strong>all-inclusive bundles</strong> — most commonly used for Photo Booth rentals. A package has a base price for a set number of hours with optional extras.</p>
          <Row icon={<DollarSign style={{ width: 15 }} />} title="Base Price & Hours" desc="Starting price for the package and how many hours it includes (e.g., $399 for 2 hours)." />
          <Row icon={<Clock style={{ width: 15 }} />} title="Extra Hours Rate" desc="Additional flat fee per extra hour beyond the base (e.g., +$65/hr)." />
          <Row icon={<Zap style={{ width: 15 }} />} title="Package Add-ons" desc="Optional extras customers check off during checkout: Prints (+$250), Glam Filter (+$100), Guest Book (+$100)." />
          <Note type="info">In the Quote Builder, packages appear as a separate booking mode when a Photo Booth is in the cart.</Note>
        </div>
      )},
    ],
  },
  {
    id: "specials", icon: <Zap style={{ width: 18 }} />, title: "Specials & Deals", color: "#fb923c",
    summary: "Create time-limited promotional deals, discount banners, and promo codes for the website.",
    articles: [
      { id: "spec-1", title: "Creating a Special Deal", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Specials are promotional listings on your Specials page. Create flash sales, holiday deals, or bundle promotions with optional promo codes.</p>
          <Step num={1}>Click <Pill label="+ Add Special Deal" />.</Step>
          <Step num={2}>Enter a <strong>Title</strong>, <strong>Description</strong>, the <strong>Original Price</strong>, and the <strong>Special Price</strong>.</Step>
          <Step num={3}>Optionally add a <strong>Badge</strong> text (e.g. Limited Time) and a <strong>Promo Code</strong> (e.g. SAVE20).</Step>
          <Step num={4}>Upload an image, toggle to <Pill label="Active" color="#22c55e" />, and optionally mark it <Pill label="Featured" color="#a78bfa" /> to pin to top.</Step>
          <Note type="tip">Promo codes entered here also work in the Quote Builder — customers type the code and the discount is applied automatically.</Note>
        </div>
      )},
    ],
  },
  {
    id: "bookings", icon: <Calendar style={{ width: 18 }} />, title: "Bookings", color: "#34d399",
    summary: "View, manage, and process all customer booking requests with full payment tracking.",
    articles: [
      { id: "book-1", title: "Booking Lifecycle & Statuses", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Every booking request submitted from your website flows into the Bookings tab. Track each booking from initial request through to completion.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {[{label:"Pending",color:"#f59e0b"},{label:"Confirmed",color:"#60a5fa"},{label:"Preparing",color:"#a78bfa"},{label:"Delivered",color:"#22c55e"},{label:"Cancelled",color:"#ef4444"}].map(s=><Pill key={s.label} label={s.label} color={s.color} />)}
          </div>
          <Row icon={<ArrowRight style={{ width: 15 }} />} title="Pending" desc="New submission from the quote builder — needs review and confirmation." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Confirmed" desc="You have reviewed and locked in the booking. Customer has been notified." />
          <Row icon={<RefreshCw style={{ width: 15 }} />} title="Preparing" desc="Equipment is being prepped, loaded, or is en route." />
          <Row icon={<Star style={{ width: 15 }} />} title="Delivered" desc="Equipment has been delivered and setup is complete." />
          <Row icon={<AlertTriangle style={{ width: 15 }} />} title="Cancelled" desc="Booking was cancelled. Full history is kept for reference." />
        </div>
      )},
      { id: "book-2", title: "Payment Tracking & Deposits", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Each booking has a payment section that tracks partial payments, deposits, and final balances.</p>
          <Row icon={<DollarSign style={{ width: 15 }} />} title="Log a Payment" desc="Click Record Payment to log a cash, card, or transfer payment — each is timestamped and stored." />
          <Row icon={<FileText style={{ width: 15 }} />} title="Payment Status" desc="Unpaid to Deposit Paid to Fully Paid. Badge updates automatically based on totals logged." />
          <Row icon={<Users style={{ width: 15 }} />} title="Customer Details" desc="View name, email, phone, event date, event type, guest count, and full delivery address." />
          <Note type="tip">Use the <strong>Notes</strong> field to log internal reminders about special setup instructions, access codes, or customer requests.</Note>
        </div>
      )},
    ],
  },
  {
    id: "delivery", icon: <Truck style={{ width: 18 }} />, title: "Delivery Pricing Engine", color: "#D4AF37",
    summary: "The full Smart Delivery Pricing & Rules Engine — pricing modes, zone maps, fleet vehicles, and labor costs.",
    articles: [
      { id: "del-0", title: "What is the Delivery Pricing Engine?", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The <strong style={{ color: "#D4AF37" }}>Smart Delivery Pricing &amp; Rules Engine</strong> is a fully automated system that calculates exactly what each customer should pay for delivery — based on <strong>where they live, what they are renting, how big your truck needs to be, how long setup takes, and any special venue conditions</strong>.</p>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>It runs automatically in the Quote Builder checkout. Customers never see a call for a price — they see a real, itemised delivery fee calculated in real time.</p>
          <Note type="info">The engine has two operating modes: <strong>Fixed Price Mode</strong> (every customer pays one flat rate) and <strong>Smart Rules Engine</strong> (rates are calculated dynamically based on your custom rules).</Note>
        </div>
      )},
      { id: "del-1", title: "Pricing Mode: Fixed Rate vs Smart Engine", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>At the very top of the Delivery Pricing tab, you choose which mode controls pricing for all orders.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "0.75rem 0" }}>
            {[
              { icon: <DollarSign style={{ width: 16 }} />, mode: "Fixed Price Mode", desc: "Every order pays the same flat delivery rate you set (e.g. $45). Venue handling add-ons still apply on top. Best for simple local delivery.", color: "#60a5fa" },
              { icon: <Zap style={{ width: 16 }} />, mode: "Smart Rules Engine", desc: "Rules evaluate in priority order. Each rule triggers a strategy: Free, Fixed, Distance-Based, Zone Map, or Full Dynamic Engine. Best for multi-zone pricing.", color: "#D4AF37" },
            ].map(m => (
              <div key={m.mode} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid " + m.color + "33", borderRadius: "10px", padding: "0.9rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: m.color, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.4rem" }}>{m.icon}{m.mode}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{m.desc}</div>
              </div>
            ))}
          </div>
          <Note type="tip">Start with <strong>Fixed Price Mode</strong> to get up and running immediately. Switch to <strong>Smart Rules Engine</strong> once you have configured your rules, zones, and fleet.</Note>
        </div>
      )},
      { id: "del-2", title: "Delivery Rules (How Conditions Work)", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Rules are the heart of the Smart Engine. They evaluate one by one in <strong>Priority Order</strong> — the first matching rule wins and its strategy is applied.</p>
          <Row icon={<ArrowRight style={{ width: 15 }} />} title="Priority Order" desc="Rule #1 is checked first. If it matches the engine stops. If not it tries Rule #2, and so on." />
          <Row icon={<Layers style={{ width: 15 }} />} title="Condition Fields" desc="Each rule can evaluate: Order Total, Item Count, Delivery Distance (miles), Customer ZIP Code, or Item Category." />
          <Row icon={<ToggleLeft style={{ width: 15 }} />} title="AND / OR Logic" desc="Combine multiple conditions using AND (all must match) or OR (any can match) logic." />
          <Row icon={<Zap style={{ width: 15 }} />} title="Strategy Types" desc="Free Delivery, Fixed Fee, Distance-Based, Delivery Zone Map, Dynamic Engine, or Manual Quote." />
          <div style={{ marginTop: "0.75rem", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px", padding: "0.85rem" }}>
            <div style={{ fontWeight: 700, color: "#D4AF37", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Example Rule Setup</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              <strong style={{ color: "#fff" }}>Rule 1 (Priority 0 — runs first):</strong> If Distance &gt; 60 mi then Manual Staff Quote<br />
              <strong style={{ color: "#fff" }}>Rule 2 (Priority 1):</strong> If Order Total &gt; $2,000 AND Distance &lt; 15 mi then Free Delivery<br />
              <strong style={{ color: "#fff" }}>Rule 3 (Priority 2):</strong> If Item Count &lt; 10 then Fixed Fee ($45)<br />
              <strong style={{ color: "#fff" }}>Rule 4 (Priority 3):</strong> All other orders then Dynamic Engine
            </div>
          </div>
          <Note type="tip">Use <strong>Priority 0</strong> for override rules that should always run first — like blocking orders outside your service area.</Note>
        </div>
      )},
      { id: "del-3", title: "Pricing Strategies Explained", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Each rule triggers one of these pricing strategies when its conditions are met:</p>
          {[
            { s: "Free Delivery", d: "Customer pays $0 for delivery. Venue handling add-ons still apply on top of $0.", color: "#22c55e" },
            { s: "Fixed Fee", d: "A flat dollar amount you set. E.g., always charge $45 regardless of distance.", color: "#60a5fa" },
            { s: "Distance Based", d: "Base Fee + (Miles x Rate Per Mile) + (Drive Time x Rate Per Minute). Configured in Pricing Strategies.", color: "#a78bfa" },
            { s: "Delivery Zones", d: "Matches the customer ZIP to a Zone you defined, then charges that zone flat rate.", color: "#f472b6" },
            { s: "Dynamic Engine", d: "Full cost-of-service model: Vehicle + Travel + Labor and Crew Time + Venue Handling Add-ons. Most precise.", color: "#D4AF37" },
            { s: "Manual Quote", d: "Tells the customer that a staff member will reach out with a custom delivery price.", color: "#f87171" },
          ].map(({ s, d, color }) => (
            <div key={s} style={{ display: "flex", gap: "0.75rem", padding: "0.55rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start" }}>
              <Pill label={s} color={color} />
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{d}</span>
            </div>
          ))}
        </div>
      )},
      { id: "del-4", title: "Fleet Vehicles Configuration", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The <strong>Dynamic Engine</strong> automatically selects the smallest (cheapest) vehicle that can fit the entire order. You configure your fleet here.</p>
          <Row icon={<Truck style={{ width: 15 }} />} title="Vehicle Base Cost" desc="The starting delivery fee for using that vehicle, e.g., Cargo Van = $45, 16ft Box Truck = $95, 24ft Flatbed = $160." />
          <Row icon={<Package style={{ width: 15 }} />} title="Capacity Limits" desc="Max Weight (lbs), Max Volume (cubic feet), Max Delivery Points, Max Item Count, Max Chair Count, Max Table Count." />
          <Row icon={<Star style={{ width: 15 }} />} title="Priority" desc="Lower priority number = preferred vehicle. Engine tries lowest priority first and upgrades if the order does not fit." />
          <Note type="info">If no vehicle fits the order, the engine uses the largest vehicle you have. Always add your biggest truck to ensure all orders get a price.</Note>
        </div>
      )},
      { id: "del-5", title: "Labor & Crew Module", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The Labor Module calculates crew time based on how long it takes to load, set up, and break down each rental item. Included automatically in the Dynamic Engine strategy.</p>
          <Row icon={<Clock style={{ width: 15 }} />} title="Hourly Rate" desc="Your crew hourly cost rate, e.g., $25/hr. Sets the floor for Dynamic delivery pricing." />
          <Row icon={<Users style={{ width: 15 }} />} title="Min Hours Charge" desc="Minimum labor time billed per delivery, even for small orders." />
          <Row icon={<Star style={{ width: 15 }} />} title="Weekend Multiplier" desc="Automatically applies a rate multiplier for Saturday/Sunday deliveries — e.g., 1.2x for weekend premium." />
          <Row icon={<AlertTriangle style={{ width: 15 }} />} title="Holiday & Emergency Multipliers" desc="Holiday rate (e.g., 1.5x) and short-notice rate (e.g., 1.5x) can be applied to qualifying bookings." />
        </div>
      )},
      { id: "del-6", title: "Travel & Mileage Module", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The Travel Module calculates the vehicle round-trip fuel and drive time cost. Used by the Dynamic Engine and Distance-Based strategies.</p>
          <Row icon={<Map style={{ width: 15 }} />} title="Base Travel Fee" desc="A flat starting fee every delivery incurs regardless of distance, e.g., $15.00." />
          <Row icon={<ArrowRight style={{ width: 15 }} />} title="Cost Per Mile" desc="How much you charge per mile driven to the venue, e.g., $1.50/mi." />
          <Row icon={<Clock style={{ width: 15 }} />} title="Cost Per Minute" desc="Drive time cost factored on top of mileage, e.g., $0.40/min." />
          <Row icon={<DollarSign style={{ width: 15 }} />} title="Fuel Surcharge" desc="A flat fuel surcharge added per delivery, e.g., $5.00. Update this as fuel prices change." />
          <Note type="tip">Distance and travel time are automatically calculated from the customer delivery address. No manual entry needed.</Note>
        </div>
      )},
      { id: "del-7", title: "Handling Fees (Site Logistics Add-ons)", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Handling fees are <strong>optional add-ons charged on top of any base delivery fee</strong> when customers select special venue conditions during checkout. They apply to ALL pricing modes.</p>
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Stair Carry" desc="Customer checks Stairs Required — adds a stair carry surcharge, e.g., +$25.00." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Elevator Access" desc="Customer checks Elevator Access — adds elevator time surcharge, e.g., +$15.00." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Long Walk over 100ft" desc="Customer selects far from truck distance — adds long-walk surcharge, e.g., +$30.00." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Concrete / Hard Surface" desc="Customer selects Concrete as Setup Surface — adds sandbag weight surcharge, e.g., +$25.00." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Sand / Beach Setup" desc="Customer selects Sand or Beach — adds sand anchor surcharge, e.g., +$50.00." />
          <Note type="info">Manage handling fees from the <strong>Handling Fees</strong> sub-tab. Each fee shows as a gold badge in the customer order total breakdown.</Note>
        </div>
      )},
      { id: "del-8", title: "Product Logistics (Per-Item Setup Data)", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The <strong>Product Logistics</strong> sub-tab lets you assign delivery metadata to each rental item. The Dynamic Engine uses this data to select the right vehicle and estimate crew time automatically.</p>
          <Row icon={<Package style={{ width: 15 }} />} title="Delivery Points" desc="An abstract weight/complexity score per item used to match it to the right vehicle tier." />
          <Row icon={<Truck style={{ width: 15 }} />} title="Weight & Volume" desc="Physical dimensions in lbs and cubic feet used to verify the item fits in the selected vehicle." />
          <Row icon={<Clock style={{ width: 15 }} />} title="Setup Time (Minutes)" desc="How long it takes to set up and break down this item. Added to total crew labor hours." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Special Flags" desc="Stackable, Fragile, Requires Dolly, Requires Liftgate, Requires 2 Workers, Requires 3 Workers, Installation Required." />
          <Note type="tip">Items without logistics data use sensible defaults. Fill this in for your highest-volume items first such as inflatables, water slides, and large tents.</Note>
        </div>
      )},
      { id: "del-9", title: "Delivery Zones (ZIP Code Pricing)", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Delivery Zones define geographic pricing tiers based on ZIP codes. A customer delivery ZIP is matched against your zones — the first matching zone flat rate is charged.</p>
          <Step num={1}>Click <Pill label="+ Add Zone" /> and give the zone a name, e.g., Local Metro.</Step>
          <Step num={2}>Enter the zone flat price, e.g., $35.</Step>
          <Step num={3}>Paste all ZIP codes for this zone, comma-separated, e.g., 23451, 23452, 23453.</Step>
          <Step num={4}>Set a <strong>Priority</strong> number — lower = checked first. Make your closest/cheapest zone the highest priority.</Step>
          <Step num={5}>Save the zone. The Delivery Zones strategy must be active in a Rule for zones to be used.</Step>
          <Note type="info">If a customer ZIP does not match any zone, the engine falls back to the first enabled zone, or a default rate of $50.</Note>
        </div>
      )},
      { id: "del-10", title: "Delivery Profiles & Audit / Rollback", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}><strong>Delivery Profiles</strong> let you save named snapshots of your entire delivery configuration — useful for seasonal pricing such as Summer Rush, Wedding Season, or Off-Peak Winter.</p>
          <Row icon={<Layers style={{ width: 15 }} />} title="Create a Profile" desc="Name it, add notes, optionally restrict it to specific rules, and optionally set a scheduled start/end date." />
          <Row icon={<CheckCircle style={{ width: 15 }} />} title="Set Active" desc="Click Set Active on any profile to switch the delivery engine to that configuration immediately." />
          <Row icon={<RefreshCw style={{ width: 15 }} />} title="Audit History & Rollback" desc="Every time you save delivery settings a timestamped audit snapshot is created. Click Rollback to restore that exact configuration." />
          <Note type="important">The <strong>Rollback</strong> feature is a safety net — if you accidentally break your pricing rules you can restore working settings in one click from the Audit tab.</Note>
        </div>
      )},
    ],
  },
  {
    id: "content", icon: <Globe style={{ width: 18 }} />, title: "Site Content", color: "#22d3ee",
    summary: "Edit your homepage hero text, stats, footer contact info, and about section — no code required.",
    articles: [
      { id: "con-1", title: "Editing Your Website Content", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The Site Content tab gives you direct control over all text and contact information that appears on your public website.</p>
          <Row icon={<Star style={{ width: 15 }} />} title="Hero Section" desc="Edit the headline, sub-headline, badge text, and the 3 trust pillars shown on the homepage." />
          <Row icon={<BarChart3 style={{ width: 15 }} />} title="Stats Bar" desc="The 4 animated stats in the Why Choose Us section. Update the numbers as you grow." />
          <Row icon={<FileText style={{ width: 15 }} />} title="About Section" desc="Your company story shown on the About page. Edit the title and two paragraphs freely." />
          <Row icon={<Globe style={{ width: 15 }} />} title="Footer & Contact Info" desc="Phone number, email, physical address, Instagram URL, and Facebook URL — these update in the footer and contact page instantly." />
          <Note type="tip">Always click <strong>Save All Settings</strong> at the bottom of the form — changes only apply after saving.</Note>
        </div>
      )},
    ],
  },
  {
    id: "settings", icon: <Settings style={{ width: 18 }} />, title: "Settings", color: "#94a3b8",
    summary: "Control admin access passwords, promo codes, and other system-level configuration.",
    articles: [
      { id: "set-1", title: "Changing the Admin Password", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>The Settings tab lets you update the admin CMS login password and configure other system-level options.</p>
          <Step num={1}>Go to <strong>Settings and Admin Access</strong>.</Step>
          <Step num={2}>Enter a new password in the password field.</Step>
          <Step num={3}>Click <Pill label="Save Settings" color="#22c55e" /> to apply.</Step>
          <Note type="important">There is no password recovery mechanism. If you forget the admin password it must be reset in the server environment variables. Keep your password stored safely.</Note>
        </div>
      )},
      { id: "set-2", title: "Promo Codes Management", content: (
        <div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "0.75rem" }}>Create and manage discount promo codes that customers enter during checkout in the Quote Builder.</p>
          <Row icon={<Zap style={{ width: 15 }} />} title="Percentage Discount" desc="e.g., Code: SUMMER20 gives 20% off the rental subtotal." />
          <Row icon={<DollarSign style={{ width: 15 }} />} title="Flat Dollar Discount" desc="e.g., Code: SAVE50 gives $50 off the rental subtotal." />
          <Note type="info">Promo codes created here and promo codes attached to Special Deals both work in the Quote Builder. They are validated automatically when a customer types them.</Note>
        </div>
      )},
    ],
  },
];

export default function AdminHelpGuide() {
  const [search, setSearch] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("delivery");
  const [openArticle, setOpenArticle] = useState<string | null>("del-0");

  const filtered = useMemo(() => {
    if (!search.trim()) return GUIDE_SECTIONS;
    const q = search.toLowerCase();
    return GUIDE_SECTIONS
      .map(sec => ({ ...sec, articles: sec.articles.filter(a => a.title.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q)) }))
      .filter(sec => sec.articles.length > 0 || sec.title.toLowerCase().includes(q));
  }, [search]);

  const handleSectionClick = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
    setOpenArticle(null);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(212,175,55,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37" }}>
          <Book style={{ width: 20 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.25rem", color: "#fff" }}>Admin CMS Help &amp; Guide</h2>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>Everything you need to know to manage your Pinstripes website.</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <Search style={{ width: 16, height: 16, position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search guides, features, and how-to articles..."
          style={{ width: "100%", padding: "0.7rem 0.9rem 0.7rem 2.5rem", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {filtered.map(section => {
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} style={{ background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid " + (isOpen ? section.color + "44" : "rgba(255,255,255,0.07)"), borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
              <button onClick={() => handleSectionClick(section.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.9rem", padding: "1rem 1.1rem", background: "transparent", border: "none", cursor: "pointer", color: "#fff", textAlign: "left" }}>
                <span style={{ width: 34, height: 34, borderRadius: "8px", background: section.color + "18", display: "flex", alignItems: "center", justifyContent: "center", color: section.color, flexShrink: 0 }}>{section.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff" }}>{section.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.1rem" }}>{section.summary}</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{isOpen ? <ChevronDown style={{ width: 16 }} /> : <ChevronRight style={{ width: 16 }} />}</span>
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex" }}>
                  <div style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "0.5rem" }}>
                    {section.articles.map(article => (
                      <button key={article.id} onClick={() => setOpenArticle(prev => prev === article.id ? null : article.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 0.6rem", background: openArticle === article.id ? section.color + "18" : "transparent", border: "none", cursor: "pointer", color: openArticle === article.id ? section.color : "rgba(255,255,255,0.65)", fontSize: "0.78rem", fontWeight: openArticle === article.id ? 700 : 500, borderRadius: "7px", textAlign: "left", transition: "all 0.15s" }}>
                        <HelpCircle style={{ width: 12, flexShrink: 0, opacity: 0.7 }} />
                        {article.title}
                      </button>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: "1.1rem 1.25rem", minHeight: "200px" }}>
                    {openArticle && section.articles.find(a => a.id === openArticle) ? (
                      <div>
                        <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.97rem", fontWeight: 800, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.65rem" }}>{section.articles.find(a => a.id === openArticle)?.title}</h4>
                        {section.articles.find(a => a.id === openArticle)?.content}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "180px", color: "rgba(255,255,255,0.3)", gap: "0.5rem" }}>
                        <HelpCircle style={{ width: 28, opacity: 0.4 }} />
                        <span style={{ fontSize: "0.8rem" }}>Select an article from the left to read it.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.35)" }}>
          <Search style={{ width: 32, opacity: 0.3, display: "block", margin: "0 auto 0.75rem" }} />
          <div style={{ fontSize: "0.88rem" }}>No results for that search — try a different keyword.</div>
        </div>
      )}

      <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
        Pinstripes Admin CMS &middot; Built for your business &middot; All changes save instantly and reflect live on your website.
      </div>
    </div>
  );
}
