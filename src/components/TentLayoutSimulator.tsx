"use client";

import React, { useState, useEffect } from "react";
import { Users, LayoutGrid, Check, Plus, ShoppingCart, HelpCircle } from "lucide-react";
import { mockInventory, type RentalItem } from "./FeaturedRentals";

interface TentLayoutSimulatorProps {
  onOpenQuoteWithItem: (item: RentalItem) => void;
}

export default function TentLayoutSimulator({ onOpenQuoteWithItem }: TentLayoutSimulatorProps) {
  const [guestCount, setGuestCount] = useState(48);
  const [layoutType, setLayoutType] = useState<"banquet" | "ceremony">("banquet");
  const [includeDanceFloor, setIncludeDanceFloor] = useState(false);
  const [includeBuffet, setIncludeBuffet] = useState(false);
  const [includeConcessions, setIncludeConcessions] = useState(false);

  // Tent size recommendations and configurations
  const [tentConfig, setTentConfig] = useState({
    size: "20' x 30'",
    name: "High-Peak Elegance Canopy Tent",
    area: 600,
    maxCapacity: 80,
    price: 450,
    tablesCount: 6,
    chairsCount: 48,
  });

  // Calculate matching tent layout specifications
  useEffect(() => {
    let capacityNeeded = guestCount;
    // Extra items deduct available space, hence requiring a larger tent
    let spaceDeduction = 0;
    if (includeDanceFloor) spaceDeduction += 20; // Needs equivalent of 20 guests space
    if (includeBuffet) spaceDeduction += 15;
    if (includeConcessions) spaceDeduction += 10;

    const totalSpaceIndex = capacityNeeded + spaceDeduction;

    let size = "20' x 20'";
    let name = "High-Peak Frame Tent";
    let area = 400;
    let maxCapacity = 40;
    let price = 350;
    let tablesCount = Math.ceil(guestCount / 8);

    if (totalSpaceIndex > 100) {
      size = "Double 20' x 40'";
      name = "Connected Grand Tent Complex";
      area = 1600;
      maxCapacity = 160;
      price = 1150;
    } else if (totalSpaceIndex > 70) {
      size = "20' x 40'";
      name = "Grand High-Peak Canopy Tent";
      area = 800;
      maxCapacity = 100;
      price = 600;
    } else if (totalSpaceIndex > 35) {
      size = "20' x 30'";
      name = "High-Peak Elegance Canopy Tent";
      area = 600;
      maxCapacity = 80;
      price = 450;
    }

    setTentConfig({
      size,
      name,
      area,
      maxCapacity,
      price,
      tablesCount,
      chairsCount: guestCount,
    });
  }, [guestCount, layoutType, includeDanceFloor, includeBuffet, includeConcessions]);

  // Hook to launch QuoteBuilder with the recommended High-Peak tent
  const handleReserveLayout = () => {
    // Find the tent item from inventory or make a customized mockup item
    const tentItemInInventory = mockInventory.find((item) => item.category === "Tents") || mockInventory[4];
    
    // Customize the items to match the recommended configuration
    const customTentItem: RentalItem = {
      ...tentItemInInventory,
      title: `${tentConfig.size} ${tentConfig.name}`,
      price: tentConfig.price,
      dimensions: tentConfig.size,
      description: `Recommended tent setup based on simulator selections. Custom layout: ${
        layoutType === "banquet"
          ? `${tentConfig.tablesCount} Round Tables & ${tentConfig.chairsCount} Chairs`
          : `Rowed Ceremony seating for ${tentConfig.chairsCount} guests`
      }. Includes: ${[
        includeDanceFloor ? "10x10 Dance Floor" : "",
        includeBuffet ? "Double Buffet Tables" : "",
        includeConcessions ? "Concession Stand Setup" : "",
      ]
        .filter(Boolean)
        .join(", ") || "No additional add-ons"}.`,
    };
    onOpenQuoteWithItem(customTentItem);
  };

  // Generate interactive SVG visual nodes for 2D map
  const renderSVGBlueprint = () => {
    const width = 500;
    const height = 300;
    const padding = 30;

    // Outer tent boundaries mapping
    let tentW = 440;
    let tentH = 240;
    let rx = (width - tentW) / 2;
    let ry = (height - tentH) / 2;
    
    if (tentConfig.size === "20' x 20'") {
      tentW = 280;
      tentH = 240;
      rx = (width - tentW) / 2;
    } else if (tentConfig.size === "20' x 30'") {
      tentW = 380;
      tentH = 240;
      rx = (width - tentW) / 2;
    }

    // Render items inside
    const itemsList: React.ReactNode[] = [];

    // Peaks indicators
    if (tentConfig.size === "20' x 20'") {
      itemsList.push(
        <polygon
          key="peak-1"
          points={`${width / 2},${height / 2 - 6} ${width / 2 + 6},${height / 2} ${width / 2},${height / 2 + 6} ${width / 2 - 6},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />
      );
    } else if (tentConfig.size === "20' x 30'") {
      itemsList.push(
        <polygon
          key="peak-1"
          points={`${width / 2 - 60},${height / 2 - 6} ${width / 2 - 54},${height / 2} ${width / 2 - 60},${height / 2 + 6} ${width / 2 - 66},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />,
        <polygon
          key="peak-2"
          points={`${width / 2 + 60},${height / 2 - 6} ${width / 2 + 66},${height / 2} ${width / 2 + 60},${height / 2 + 6} ${width / 2 + 54},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />
      );
    } else {
      // Larger tents
      itemsList.push(
        <polygon
          key="peak-1"
          points={`${width / 2 - 100},${height / 2 - 6} ${width / 2 - 94},${height / 2} ${width / 2 - 100},${height / 2 + 6} ${width / 2 - 106},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />,
        <polygon
          key="peak-2"
          points={`${width / 2},${height / 2 - 6} ${width / 2 + 6},${height / 2} ${width / 2},${height / 2 + 6} ${width / 2 - 6},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />,
        <polygon
          key="peak-3"
          points={`${width / 2 + 100},${height / 2 - 6} ${width / 2 + 106},${height / 2} ${width / 2 + 100},${height / 2 + 6} ${width / 2 + 94},${height / 2}`}
          fill="#D4AF37"
          opacity="0.6"
        />
      );
    }

    // Dance floor box placement
    if (includeDanceFloor) {
      itemsList.push(
        <g key="dancefloor" transform={`translate(${width / 2 - 35}, ${height / 2 - 35})`}>
          <rect
            width="70"
            height="70"
            rx="4"
            fill="rgba(212, 175, 55, 0.12)"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <line x1="0" y1="35" x2="70" y2="35" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
          <line x1="35" y1="0" x2="35" y2="70" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />
          <text
            x="35"
            y="39"
            textAnchor="middle"
            fill="#D4AF37"
            style={{ fontSize: "7px", fontFamily: "var(--font-heading)", fontWeight: 800, letterSpacing: "0.05em" }}
          >
            DANCE FLOOR
          </text>
        </g>
      );
    }

    // Buffet tables placement
    if (includeBuffet) {
      itemsList.push(
        <g key="buffet" transform={`translate(${rx + 20}, ${ry + 15})`}>
          <rect
            width="75"
            height="18"
            rx="2"
            fill="var(--bg-secondary)"
            stroke="var(--text-secondary)"
            strokeWidth="1"
          />
          <text
            x="37.5"
            y="11.5"
            textAnchor="middle"
            fill="var(--text-secondary)"
            style={{ fontSize: "6px", fontFamily: "var(--font-heading)", fontWeight: 700 }}
          >
            BUFFET TABLE
          </text>
        </g>
      );
    }

    // Concession carts placement
    if (includeConcessions) {
      itemsList.push(
        <g key="concessions" transform={`translate(${rx + tentW - 90}, ${ry + 15})`}>
          <rect
            width="70"
            height="18"
            rx="2"
            fill="var(--bg-secondary)"
            stroke="#E63946"
            strokeWidth="1"
          />
          <text
            x="35"
            y="11.5"
            textAnchor="middle"
            fill="#E63946"
            style={{ fontSize: "6px", fontFamily: "var(--font-heading)", fontWeight: 700 }}
          >
            SWEET CARTS
          </text>
        </g>
      );
    }

    // Banquet Round Tables Layout
    if (layoutType === "banquet") {
      const numTables = tentConfig.tablesCount;
      const tableRadius = 18;
      const chairOffset = 24;

      // Dynamically calculate grid coordinates depending on table count and dance floor size
      const coordinates: { x: number; y: number }[] = [];
      
      if (numTables <= 5) {
        // Simple row
        const spacing = tentW / (numTables + 1);
        for (let i = 0; i < numTables; i++) {
          coordinates.push({ x: rx + spacing * (i + 1), y: height / 2 });
        }
      } else {
        // Multi-row grid layout
        const cols = Math.ceil(numTables / 2);
        const colSpacing = tentW / (cols + 1);
        const rowSpacing = tentH / 3;

        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < cols; c++) {
            if (coordinates.length < numTables) {
              const x = rx + colSpacing * (c + 1);
              const y = ry + rowSpacing * (r + 1);
              
              // Shift away from dance floor if in center
              if (includeDanceFloor && Math.abs(x - width / 2) < 55 && Math.abs(y - height / 2) < 55) {
                coordinates.push({ x: x + (x < width / 2 ? -40 : 40), y: y });
              } else {
                coordinates.push({ x, y });
              }
            }
          }
        }
      }

      // Draw table groups
      coordinates.forEach((coord, idx) => {
        // Table center circle
        itemsList.push(
          <circle
            key={`table-${idx}`}
            cx={coord.x}
            cy={coord.y}
            r={tableRadius}
            fill="var(--card-bg)"
            stroke="#D4AF37"
            strokeWidth="1.5"
          />,
          <text
            key={`table-lbl-${idx}`}
            x={coord.x}
            y={coord.y + 2.5}
            textAnchor="middle"
            fill="var(--text-primary)"
            style={{ fontSize: "7px", fontFamily: "var(--font-heading)", fontWeight: 700 }}
          >
            T{idx + 1}
          </text>
        );

        // Chair dots around table (8 chairs per table)
        for (let c = 0; c < 8; c++) {
          const angle = (c * 2 * Math.PI) / 8;
          const cx = coord.x + Math.cos(angle) * chairOffset;
          const cy = coord.y + Math.sin(angle) * chairOffset;
          itemsList.push(
            <circle
              key={`chair-${idx}-${c}`}
              cx={cx}
              cy={cy}
              r="2.2"
              fill="#D4AF37"
              opacity="0.9"
            />
          );
        }
      });
    } else {
      // Ceremony Rows Layout
      const rowCount = 6;
      const seatsPerRow = Math.ceil(guestCount / rowCount);
      const rowSpacing = 22;
      const seatSpacing = 12;
      const startX = width / 2 - (seatsPerRow * seatSpacing) / 2;
      const startY = ry + 60;

      // Draw ceremony altar/stage indicator at the front of the tent
      itemsList.push(
        <g key="stage" transform={`translate(${width / 2 - 30}, ${ry + 20})`}>
          <rect width="60" height="15" rx="1.5" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
          <text
            x="30"
            y="9.5"
            textAnchor="middle"
            fill="#D4AF37"
            style={{ fontSize: "6px", fontFamily: "var(--font-heading)", fontWeight: 800 }}
          >
            ALTAR / STAGE
          </text>
        </g>
      );

      for (let r = 0; r < rowCount; r++) {
        // Draw left side rows and right side rows with center aisle
        const midPoint = Math.floor(seatsPerRow / 2);
        
        for (let s = 0; s < seatsPerRow; s++) {
          const aisleShift = s >= midPoint ? 15 : 0;
          const x = startX + s * seatSpacing + aisleShift;
          const y = startY + r * rowSpacing;

          if (r * seatsPerRow + s < guestCount) {
            itemsList.push(
              <rect
                key={`chair-row-${r}-${s}`}
                x={x - 3.5}
                y={y - 3.5}
                width="7"
                height="7"
                rx="1"
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="0.75"
                opacity="0.85"
              />
            );
          }
        }
      }
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          height: "auto",
          background: "var(--bg-secondary)",
          borderRadius: "1.25rem",
          transition: "all 0.5s ease",
        }}
      >
        {/* Architectural background Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-secondary)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" rx="20" />

        {/* Tent Dashed Glow Shadow */}
        <rect
          x={rx - 3}
          y={ry - 3}
          width={tentW + 6}
          height={tentH + 6}
          rx="18"
          fill="none"
          stroke="rgba(212, 175, 55, 0.15)"
          strokeWidth="6"
        />

        {/* Tent Main Boundary */}
        <rect
          x={rx}
          y={ry}
          width={tentW}
          height={tentH}
          rx="15"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />

        {/* Tent size indicator banner */}
        <rect
          x={rx + 10}
          y={ry + tentH - 22}
          width="90"
          height="14"
          rx="4"
          fill="#0f0f0f"
          opacity="0.8"
        />
        <text
          x={rx + 55}
          y={ry + tentH - 12}
          textAnchor="middle"
          fill="#D4AF37"
          style={{ fontSize: "6.5px", fontFamily: "var(--font-heading)", fontWeight: 800, letterSpacing: "0.05em" }}
        >
          {tentConfig.size} TENT AREA
        </text>

        {/* Render Layout Contents */}
        {itemsList}
      </svg>
    );
  };

  return (
    <section id="layout-simulator" style={{ padding: "5rem 0", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)", borderBottom: "1px solid var(--border-primary)", transition: "all 0.5s ease" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.25rem" }}>
        
        {/* HEADER SECTION */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="section-label">
            <LayoutGrid size={12} />
            interactive layout planner
          </div>
          <h2 className="section-title text-gradient">Tent Layout & Spacing Simulator</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "600px", margin: "0.75rem auto 0" }}>
            Unsure what size tent fits your layout? Dynamically configure tables, chairs, and custom add-ons to preview the layout instantly.
          </p>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div style={{ gap: "2.5rem", alignItems: "start" }} className="grid grid-cols-1 lg:grid-cols-2 animate-fade-up">
          
          {/* CONTROLS CARD */}
          <div
            style={{
              background: "var(--card-bg)",
              border: "1.5px solid var(--border-primary)",
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow: "0 10px 30px var(--shadow-color)",
              transition: "all 0.4s ease",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Configuration Panel
            </h3>

            {/* Slider */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Users size={14} color="#D4AF37" />
                  Estimated Guests: <span style={{ color: "#D4AF37", fontSize: "0.85rem", fontWeight: 800 }}>{guestCount} Seats</span>
                </label>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="4"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#D4AF37",
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "var(--text-secondary)", marginTop: "0.25rem", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                <span>20 Guests</span>
                <span>60 Guests</span>
                <span>120 Guests</span>
              </div>
            </div>

            {/* Layout Toggle Option Buttons */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Arrangement Style:
              </label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => setLayoutType("banquet")}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    border: layoutType === "banquet" ? "2px solid #D4AF37" : "1.5px solid var(--border-secondary)",
                    background: layoutType === "banquet" ? "rgba(212, 175, 55, 0.08)" : "transparent",
                    color: layoutType === "banquet" ? "#D4AF37" : "var(--text-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Round Banquet tables
                </button>
                <button
                  onClick={() => setLayoutType("ceremony")}
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    border: layoutType === "ceremony" ? "2px solid #D4AF37" : "1.5px solid var(--border-secondary)",
                    background: layoutType === "ceremony" ? "rgba(212, 175, 55, 0.08)" : "transparent",
                    color: layoutType === "ceremony" ? "#D4AF37" : "var(--text-secondary)",
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Rowed Ceremony seats
                </button>
              </div>
            </div>

            {/* Custom Spacing Accessories Options */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)", marginBottom: "0.75rem" }}>
                Include Accessories & Spatial Footprints:
              </label>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* Accessory 1 */}
                <div
                  onClick={() => setIncludeDanceFloor(!includeDanceFloor)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: includeDanceFloor ? "rgba(212, 175, 55, 0.04)" : "var(--bg-secondary)",
                    border: `1px solid ${includeDanceFloor ? "#D4AF37" : "var(--border-secondary)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", background: includeDanceFloor ? "#D4AF37" : "transparent" }}>
                      {includeDanceFloor && <Check size={12} color="#0f0f0f" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>10' × 10' Dance Floor</span>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#D4AF37", letterSpacing: "0.02em", fontFamily: "var(--font-heading)" }}>+20 Guest Spacing Equivalent</span>
                </div>

                {/* Accessory 2 */}
                <div
                  onClick={() => setIncludeBuffet(!includeBuffet)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: includeBuffet ? "rgba(212, 175, 55, 0.04)" : "var(--bg-secondary)",
                    border: `1px solid ${includeBuffet ? "#D4AF37" : "var(--border-secondary)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", background: includeBuffet ? "#D4AF37" : "transparent" }}>
                      {includeBuffet && <Check size={12} color="#0f0f0f" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Double Buffet Catering Tables (8')</span>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#D4AF37", letterSpacing: "0.02em", fontFamily: "var(--font-heading)" }}>+15 Guest Spacing Equivalent</span>
                </div>

                {/* Accessory 3 */}
                <div
                  onClick={() => setIncludeConcessions(!includeConcessions)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    background: includeConcessions ? "rgba(212, 175, 55, 0.04)" : "var(--bg-secondary)",
                    border: `1px solid ${includeConcessions ? "#D4AF37" : "var(--border-secondary)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", background: includeConcessions ? "#D4AF37" : "transparent" }}>
                      {includeConcessions && <Check size={12} color="#0f0f0f" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>Concessions & Treat Carts Zone</span>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#D4AF37", letterSpacing: "0.02em", fontFamily: "var(--font-heading)" }}>+10 Guest Spacing Equivalent</span>
                </div>
              </div>
            </div>

            {/* RESERVATION QUICK HOOK CARD */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: "1.5px solid var(--border-secondary)", paddingTop: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-heading)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                  Recommended Tent Package
                </span>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                  {tentConfig.size} {tentConfig.name}
                </h4>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.2rem" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#D4AF37" }}>${tentConfig.price}</span>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>(Professional Setup Included)</span>
                </div>
              </div>
              <button
                onClick={handleReserveLayout}
                className="btn-primary btn-press"
                style={{ fontSize: "0.65rem", padding: "0.75rem 1.25rem", display: "flex", gap: "0.4rem", alignItems: "center" }}
              >
                <Plus size={14} />
                Reserve Layout
              </button>
            </div>

          </div>

          {/* DYNAMIC MAP BLUEPRINT DISPLAY CARD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* The SVG Canvas Box */}
            <div
              style={{
                background: "var(--card-bg)",
                border: "1.5px solid var(--border-primary)",
                borderRadius: "1.5rem",
                padding: "1.5rem",
                boxShadow: "0 10px 30px var(--shadow-color)",
                transition: "all 0.4s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)" }}>
                  2D Top-Down Spacing Diagram
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.65rem", color: "var(--text-secondary)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#D4AF37" }} />
                  {tentConfig.size} Tent Area ({tentConfig.area} sq.ft)
                </div>
              </div>

              {renderSVGBlueprint()}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6rem", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text-secondary)" }}>
                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "none", border: "1.5px solid #D4AF37" }} />
                  Table
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6rem", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text-secondary)" }}>
                  <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#D4AF37" }} />
                  Chairs
                </div>
                {includeDanceFloor && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6rem", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text-secondary)" }}>
                    <span style={{ display: "inline-block", width: "8px", height: "8px", background: "rgba(212,175,55,0.12)", border: "1px dashed #D4AF37", borderRadius: "1px" }} />
                    Dance Floor
                  </div>
                )}
                {includeBuffet && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.6rem", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text-secondary)" }}>
                    <span style={{ display: "inline-block", width: "12px", height: "6px", background: "var(--bg-secondary)", border: "1px solid var(--text-secondary)" }} />
                    Buffet Table
                  </div>
                )}
              </div>
            </div>

            {/* SPECS & ADVISORY PANEL */}
            <div
              style={{
                background: "rgba(212, 175, 55, 0.05)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
                borderRadius: "1rem",
                padding: "1.25rem",
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
              }}
            >
              <HelpCircle size={18} color="#D4AF37" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
              <div>
                <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: "#bda030", marginBottom: "0.3rem" }}>
                  Spacing Spacing & Logistics Note
                </h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  This layout operates on professional space planning buffers (3-foot aisles between tables and 5-foot clearance margins along the tent walls). Standard setups accommodate up to <strong>{tentConfig.maxCapacity} guests</strong> comfortably, guaranteeing high safety structural standards and absolute comfort for your attendees.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
