"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface BillingWidgetProps {
  total?: number;
  messageCount?: number;
  showPaymentMethodsLink?: boolean;
  paymentMethodsHref?: string;
  className?: string;
}

export default function BillingWidget({
  total = 0,
  messageCount = 0,
  showPaymentMethodsLink = true,
  paymentMethodsHref = "/corporate-ob/billing/payment-methods",
  className = "",
}: BillingWidgetProps) {
  const { t } = useLanguage();

  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      {/* Monthly Total Card */}
      <div className="card-gradient p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t("corporateOb.monthlyTotal")}
        </h2>
        <p className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
          ¥{total.toLocaleString()}
        </p>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {t("corporateOb.messageCount")}: {messageCount}
        </p>
      </div>

      {/* Payment Methods Card */}
      {showPaymentMethodsLink && (
        <div className="card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
            {t("corporateOb.paymentMethods")}
          </h2>
          <Link
            href={paymentMethodsHref}
            className="btn-primary inline-block"
          >
            {t("corporateOb.managePaymentMethods") || "Manage Payment Methods"}
          </Link>
        </div>
      )}
    </div>
  );
}
