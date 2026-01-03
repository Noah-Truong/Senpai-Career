"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
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
      
      // Check for success/cancel from Stripe
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      
      if (success) {
        // Reload credits after successful payment
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

  // Calculate JPY price from credits
  // Companies: 20 credits = 300 JPY (15 JPY per credit)
  // Others: 20 credits = 600 JPY (30 JPY per credit)
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
          credits, // Send the credits amount
          isRecurring,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
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
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const creditsValue = customCredits ? parseInt(customCredits) || 0 : 0;
  const priceJPY = creditsValue > 0 ? calculatePrice(creditsValue) : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#000000' }}>{"Pricing"}</h1>

        {/* Current Credits Display */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000'}}>{"Current Credits"}</h2>
          <p className="text-3xl font-bold text-gray-900 mb-4" style={{ color: 'green' }}>
            {userCredits !== null ? userCredits.toLocaleString() : 0}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            {"Credits are deducted when sending messages:"}
          </p>
          <p className="text-sm font-semibold" style={{ color: 'red'}}>
            {"-10 credits per message (all account types)"}
          </p>
        </div>

        {/* Pricing Information */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000'}}>{"Pricing"}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-bold" style={{ color: '#000000'}}>{"Rate"}:</span>
              <span className="text-lg font-semibold" style={{ color: '#000000'}}>
                {userRole === "company" 
                  ? "20 credits = ¥300"
                  : "20 credits = ¥600"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {userRole === "company"
                ? "Companies receive credits at a discounted rate"
                : "Standard rate for students and OB/OG"}
            </p>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000'}}>{"Purchase Credits"}</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                {"Number of Credits"}
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
                placeholder={"Enter amount (minimum 20)"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                style={{ color: '#000000' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {"Minimum: 20 credits"}
              </p>
            </div>

            {customCredits && creditsValue >= 20 && priceJPY > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {"Total Price"}:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ¥{priceJPY.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {"Credits"}: {creditsValue.toLocaleString()}
                </p>
              </div>
            )}

            {/* Recurring Payment Option */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="ml-3 text-sm font-medium text-gray-700">
                {"Enable recurring monthly payments"}
              </label>
            </div>
            {isRecurring && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  {"You will be charged monthly for the selected amount of credits. You can cancel anytime."}
                </p>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={!customCredits || creditsValue < 20 || processing}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing 
                ? ("Processing...")
                : isRecurring
                ? ("Subscribe")
                : ("Purchase Credits")}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {searchParams.get("success") && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {"Payment successful! Your credits have been added."}
          </div>
        )}

        {/* Cancel Message */}
        {searchParams.get("canceled") && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            {"Payment was canceled."}
          </div>
        )}
      </div>
    </div>
  );
}

