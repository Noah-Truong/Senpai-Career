"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import SidebarLayout from "@/components/SidebarLayout";

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
}

function PaymentMethodForm() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div 
        className="p-4 border rounded"
        style={{ 
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB', 
          borderRadius: '6px' 
        }}
      >
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {t("corporateOb.paymentMethod.setupNote") || "To add a payment method, please contact an admin or use the Stripe Dashboard. Payment methods can be added via Stripe's secure payment form."}
        </p>
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "corporate_ob") {
        router.push("/");
        return;
      }
      loadPaymentMethods();
    }
  }, [status, router, session]);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch("/api/stripe/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to load payment methods");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm(t("corporateOb.paymentMethod.confirmDelete") || "Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      const response = await fetch(`/api/stripe/payment-method?id=${paymentMethodId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete payment method");
      }

      loadPaymentMethods();
    } catch (err: any) {
      alert(err.message || "Failed to delete payment method");
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch("/api/stripe/payment-method", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set default payment method");
      }

      loadPaymentMethods();
    } catch (err: any) {
      alert(err.message || "Failed to set default payment method");
    }
  };

  if (status === "loading" || loading) {
    return (
      <SidebarLayout role="corporate_ob">
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="corporate_ob">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>
          {t("corporateOb.paymentMethods")}
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {t("corporateOb.paymentMethod.subtitle") || "Manage your payment methods for sending messages"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Add Payment Method */}
      <div className="card-gradient p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t("corporateOb.paymentMethod.addNew") || "Add New Payment Method"}
        </h2>
        <PaymentMethodForm />
      </div>

      {/* Existing Payment Methods */}
      <div className="card-gradient p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t("corporateOb.paymentMethod.existing") || "Existing Payment Methods"}
        </h2>
        {paymentMethods.length === 0 ? (
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {t("corporateOb.paymentMethod.noMethods") || "No payment methods added yet"}
          </p>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="p-4 border rounded flex items-center justify-between"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
              >
                <div className="flex items-center gap-4">
                  {pm.card && (
                    <>
                      <div className="text-2xl">
                        {pm.card.brand === "visa" && "💳"}
                        {pm.card.brand === "mastercard" && "💳"}
                        {pm.card.brand === "amex" && "💳"}
                        {!["visa", "mastercard", "amex"].includes(pm.card.brand) && "💳"}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#111827' }}>
                          •••• •••• •••• {pm.card.last4}
                        </p>
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          {pm.card.brand.toUpperCase()} • Expires {pm.card.expMonth}/{pm.card.expYear}
                        </p>
                      </div>
                    </>
                  )}
                  {pm.isDefault && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {t("corporateOb.paymentMethod.default") || "Default"}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!pm.isDefault && (
                    <button
                      onClick={() => handleSetDefault(pm.id)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                    >
                      {t("corporateOb.paymentMethod.setDefault") || "Set as Default"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(pm.id)}
                    className="px-3 py-1 text-sm border rounded hover:bg-red-50 text-red-600 min-h-[44px]"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                  >
                    {t("button.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
