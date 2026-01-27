"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import CorporateOBBadge from "@/components/CorporateOBBadge";

interface CorporateOB {
  id: string;
  user_id: string;
  company_id: string;
  is_verified: boolean;
  created_at: string;
  users?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    description?: string;
    website?: string;
    stripe_customer_id?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export default function AdminCorporateOBPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [corporateOBs, setCorporateOBs] = useState<CorporateOB[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCorporateOB, setSelectedCorporateOB] = useState<CorporateOB | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/");
        return;
      }
      loadCorporateOBs();
      loadCompanies();
    }
  }, [status, router, session]);

  const loadCorporateOBs = async () => {
    try {
      const response = await fetch("/api/admin/corporate-ob");
      if (!response.ok) {
        throw new Error(t("admin.corporateOb.error.loadFailed") || "Failed to load Corporate OBs");
      }
      const data = await response.json();
      setCorporateOBs(data.corporateOBs || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || t("admin.corporateOb.error.loadFailed") || "Failed to load Corporate OBs");
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies/list");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error("Error loading companies:", err);
    }
  };

  const openAssignModal = (corporateOB: CorporateOB) => {
    setSelectedCorporateOB(corporateOB);
    setSelectedCompanyId(corporateOB.company_id || "");
    setIsVerified(corporateOB.is_verified || false);
    setShowEditModal(true);
  };

  const openNewAssignModal = () => {
    // For new assignment, redirect to users page where they can select a user first
    router.push("/admin/users");
  };

  const handleAssign = async () => {
    if (!selectedCorporateOB && !selectedCompanyId) {
      setError(t("corporateOb.error.noCompany") || "Please select a company");
      return;
    }

    // For new assignment, we need a user ID - this would need to be selected from users
    // For now, this handles editing existing Corporate OB
    if (!selectedCorporateOB) {
      setError(t("corporateOb.admin.selectUserFirst") || "Please select a user first from the users page");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/corporate-ob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedCorporateOB.user_id,
          companyId: selectedCompanyId,
          isVerified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("corporateOb.error.assign"));
      }

      setSuccess(data.message || t("corporateOb.assigned"));
      setShowEditModal(false);
      setShowAssignModal(false);
      loadCorporateOBs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || t("corporateOb.error.assign"));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleVerification = async (corporateOB: CorporateOB) => {
    if (!confirm(t("corporateOb.admin.confirmToggle") || `Are you sure you want to ${corporateOB.is_verified ? "unverify" : "verify"} this Corporate OB?`)) {
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/corporate-ob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: corporateOB.user_id,
          companyId: corporateOB.company_id,
          isVerified: !corporateOB.is_verified,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("corporateOb.admin.updateVerificationFailed") || "Failed to update verification");
      }

      setSuccess(data.message || t("corporateOb.admin.verificationUpdated") || "Verification status updated");
      loadCorporateOBs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || t("corporateOb.admin.updateVerificationFailed") || "Failed to update verification");
    } finally {
      setProcessing(false);
    }
  };

  const filteredCorporateOBs = corporateOBs.filter((cob) => {
    if (filter === "pending") return !cob.is_verified;
    if (filter === "verified") return cob.is_verified;
    return true;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#111827' }}>
              {t("admin.corporateOb.title") || "Corporate OB Management"}
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
              {t("admin.corporateOb.subtitle") || "Manage Corporate OB assignments and verifications"}
            </p>
          </div>
          <button
            onClick={openNewAssignModal}
            className="btn-primary min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base"
          >
            {t("admin.corporateOb.assignNew") || "Assign New Corporate OB"}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded text-sm font-medium min-h-[44px] ${
              filter === "all"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("admin.corporateOb.filter.all") || "All"} ({corporateOBs.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded text-sm font-medium min-h-[44px] ${
              filter === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("admin.corporateOb.filter.pending") || "Pending"} ({corporateOBs.filter(c => !c.is_verified).length})
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-4 py-2 rounded text-sm font-medium min-h-[44px] ${
              filter === "verified"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("admin.corporateOb.filter.verified") || "Verified"} ({corporateOBs.filter(c => c.is_verified).length})
          </button>
        </div>
      </div>

      {error && (
        <div 
          className="mb-4 px-4 py-3 rounded border"
          style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
        >
          {error}
        </div>
      )}

      {success && (
        <div 
          className="mb-4 px-4 py-3 rounded border"
          style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7', color: '#059669' }}
        >
          {success}
        </div>
      )}

      {/* Corporate OB List */}
      <div 
        className="bg-white border rounded"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
            {t("admin.corporateOb.list") || "Corporate OB List"} ({filteredCorporateOBs.length})
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
          {filteredCorporateOBs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: '#6B7280' }}>
                {t("admin.corporateOb.empty") || "No Corporate OBs found"}
              </p>
            </div>
          ) : (
            filteredCorporateOBs.map((cob) => (
              <div
                key={cob.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar
                      src={undefined}
                      alt={cob.users?.name || "Corporate OB"}
                      size="md"
                      fallbackText={cob.users?.name}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: '#111827' }}>
                          {cob.users?.name || t("corporateOb.admin.unknownUser") || "Unknown User"}
                        </h3>
                        <CorporateOBBadge
                          companyName={cob.companies?.name}
                          companyLogo={cob.companies?.logo_url}
                          isVerified={cob.is_verified}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm truncate" style={{ color: '#6B7280' }}>
                        {cob.users?.email}
                      </p>
                      {cob.companies && (
                        <p className="text-sm truncate" style={{ color: '#6B7280' }}>
                          {t("admin.corporateOb.company") || "Company"}: {cob.companies.name}
                          {cob.companies.industry && ` • ${cob.companies.industry}`}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                        {t("admin.corporateOb.assigned") || "Assigned"}: {new Date(cob.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleVerification(cob)}
                      className={`px-3 sm:px-4 py-2 text-sm font-medium rounded min-h-[44px] ${
                        cob.is_verified
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                      disabled={processing}
                    >
                      {cob.is_verified
                        ? t("corporateOb.unverify") || "Unverify"
                        : t("corporateOb.verify") || "Verify"}
                    </button>
                    <button
                      onClick={() => openAssignModal(cob)}
                      className="px-3 sm:px-4 py-2 text-sm font-medium rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 min-h-[44px]"
                    >
                      {t("button.edit")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit/Assign Modal */}
      {(showAssignModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="bg-white rounded-t-2xl sm:rounded p-4 sm:p-6 max-w-md w-full pb-[env(safe-area-inset-bottom)]"
            style={{ borderRadius: '6px' }}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="text-base sm:text-lg font-semibold flex-1" style={{ color: '#111827' }}>
                {showEditModal
                  ? `${t("corporateOb.assign")} - ${selectedCorporateOB?.users?.name}`
                  : t("admin.corporateOb.assignNew")}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setShowEditModal(false);
                  setSelectedCompanyId("");
                  setIsVerified(false);
                }}
                className="text-gray-400 hover:text-gray-600 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl sm:text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {showEditModal && selectedCorporateOB && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                  {selectedCorporateOB.users?.name}
                </p>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  {selectedCorporateOB.users?.email}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("corporateOb.selectCompany")}
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border rounded text-base"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
              >
                <option value="">{t("corporateOb.selectCompany")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: '#374151' }}>
                  {t("corporateOb.verify")}
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAssign}
                disabled={!selectedCompanyId || processing || (showAssignModal && !selectedCorporateOB)}
                className="w-full sm:flex-1 min-h-[44px] btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? t("common.loading") : t("corporateOb.assign")}
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setShowEditModal(false);
                  setSelectedCompanyId("");
                  setIsVerified(false);
                }}
                className="w-full sm:flex-1 min-h-[44px] btn-secondary"
              >
                {t("button.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
