"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
if (!stripePublishableKey) {
  console.warn("⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured.");
}
const stripePromise = loadStripe(stripePublishableKey);

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  bookingId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  bookingId,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#D4AF37", // Gold
        colorBackground: "#1a1a1a",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        fontFamily: "Outfit, Inter, sans-serif",
        borderRadius: "0.75rem",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "none",
        },
        ".Input:focus": {
          border: "1px solid #D4AF37",
          boxShadow: "0 0 0 1px #D4AF37",
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          amount={amount}
          bookingId={bookingId}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}

interface CheckoutFormProps {
  amount: number;
  bookingId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, bookingId, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/portal?bookingId=${bookingId}&payment_success=true&payment_amount=${amount}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        // Payment failed or was canceled
        setErrorMessage(result.error.message || "An error occurred during payment processing.");
        setLoading(false);
      } else {
        // Payment succeeded client-side immediately
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 0", gap: "0.75rem", textAlign: "center" }}>
        <CheckCircle2 size={48} color="#10b981" />
        <h4 style={{ color: "#ffffff", margin: 0, fontWeight: 800 }}>Payment Successful!</h4>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0 }}>
          Your payment of ${amount.toFixed(2)} has been processed. Updating booking...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <PaymentElement />

      {errorMessage && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "0.5rem", color: "#ef4444", fontSize: "0.78rem" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: "0.75rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.5rem",
            color: "rgba(255,255,255,0.7)",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            flex: 2,
            padding: "0.75rem",
            background: "#D4AF37",
            border: "none",
            borderRadius: "0.5rem",
            color: "#000000",
            fontSize: "0.8rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
        <ShieldAlert size={11} color="#D4AF37" />
        Secured by Stripe. Card details are processed directly and never stored.
      </p>
    </form>
  );
}