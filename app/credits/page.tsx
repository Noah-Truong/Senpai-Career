"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CreditsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [customCredits, setCustomCredits] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"company" | "student" | "obog" | undefined>(undefined);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadUserCredits();
      
      const success = searchParams.get("success");
      
      if (success) {
        setTimeout(() => {
          loadUserCredits();
          router.replace("/credits");
        }, 1000);
      }
    }
  }, [status, router, searchParams]);

  const loadUserCredits = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.user?.credits ?? 0);
        setUserRole(data.user?.role);
      }
    } catch (error) {
      console.error("Error loading user credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (credits: number): number => {
    if (!credits || credits <= 0) return 0;
    const pricePerCredit = userRole === "company" ? 15 : 30;
    return Math.round(credits * pricePerCredit);
  };

  const handlePurchase = async () => {
    setError("");
    const credits = parseInt(customCredits);
    
    if (!credits || credits <= 0) {
      setError("Please enter a valid number of credits");
      return;
    }

    if (credits < 20) {
      setError("Minimum purchase is 20 credits");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits,
          isRecurring,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const creditsValue = customCredits ? parseInt(customCredits) || 0 : 0;
  const priceJPY = creditsValue > 0 ? calculatePrice(creditsValue) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>Pricing</h1>

        {/* Current Credits Display */}
        <div 
          className="p-6 mb-8 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Current Credits</h2>
          <p className="text-3xl font-bold mb-4" style={{ color: '#059669' }}>
            {userCredits !== null ? userCredits.toLocaleString() : 0}
          </p>
          <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
            Credits are deducted when sending messages:
          </p>
          <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
            -10 credits per message (all account types)
          </p>
        </div>

        {/* Pricing Information */}
        <div 
          className="p-6 mb-8 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Pricing</h2>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: '#D7FFEF' }}
            >
              <span className="font-bold" style={{ color: '#111827' }}>Rate:</span>
              <span className="text-lg font-semibold" style={{ color: '#111827' }}>
                {userRole === "company" 
                  ? "20 credits = ¥300"
                  : "20 credits = ¥600"}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {userRole === "company"
                ? "Companies receive credits at a discounted rate"
                : "Standard rate for students and OB/OG"}
            </p>
          </div>
        </div>

        {/* Purchase Form */}
        <div 
          className="p-6 mb-8 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Purchase Credits</h2>
          
          {error && (
            <div 
              className="mb-4 px-4 py-3 rounded border"
              style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="credits" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Number of Credits
              </label>
              <input
                type="number"
                id="credits"
                min="20"
                step="20"
                value={customCredits}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (!isNaN(parseInt(value)) && parseInt(value) >= 0)) {
                    setCustomCredits(value);
                    setError("");
                  }
                }}
                placeholder="Enter amount (minimum 20)"
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 text-lg"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
              />
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Minimum: 20 credits
              </p>
            </div>

            {customCredits && creditsValue >= 20 && priceJPY > 0 && (
              <div 
                className="p-4 rounded border"
                style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold" style={{ color: '#111827' }}>
                    Total Price:
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#2563EB' }}>
                    ¥{priceJPY.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Credits: {creditsValue.toLocaleString()}
                </p>
              </div>
            )}

            {/* Recurring Payment Option */}
            <div 
              className="flex items-center p-4 rounded"
              style={{ backgroundColor: '#D7FFEF' }}
            >
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 border-gray-300 rounded"
                style={{ accentColor: '#2563EB' }}
              />
              <label htmlFor="recurring" className="ml-3 text-sm font-medium" style={{ color: '#374151' }}>
                Enable recurring monthly payments
              </label>
            </div>
            {isRecurring && (
              <div 
                className="p-3 rounded border"
                style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}
              >
                <p className="text-sm" style={{ color: '#92400E' }}>
                  You will be charged monthly for the selected amount of credits. You can cancel anytime.
                </p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={!customCredits || creditsValue < 20 || processing}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing 
                ? "Processing..."
                : isRecurring
                ? "Subscribe"
                : "Purchase Credits"}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {searchParams.get("success") && (
          <div 
            className="mb-4 px-4 py-3 rounded border"
            style={{ backgroundColor: '#D1FAE5', borderColor: '#A7F3D0', color: '#059669' }}
          >
            Payment successful! Your credits have been added.
          </div>
        )}

        {/* Cancel Message */}
        {searchParams.get("canceled") && (
          <div 
            className="mb-4 px-4 py-3 rounded border"
            style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D', color: '#D97706' }}
          >
            Payment was canceled.
          </div>
        )}
      </div>
    </div>
  );
}
