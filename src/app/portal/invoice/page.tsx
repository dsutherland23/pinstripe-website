"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InvoicePageClient from "@/components/InvoicePageClient";

function InvoiceConsumer() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";
  return <InvoicePageClient id={id} />;
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>Loading Invoice...</p>
      </div>
    }>
      <InvoiceConsumer />
    </Suspense>
  );
}
