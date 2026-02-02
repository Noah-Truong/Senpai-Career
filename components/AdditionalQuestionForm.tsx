"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { modalVariants, modalContentVariants } from "@/lib/animations";

interface AdditionalQuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function AdditionalQuestionForm({
  isOpen,
  onClose,
  onSubmit,
}: AdditionalQuestionFormProps) {
  const { t } = useLanguage();
  const [offered, setOffered] = useState<boolean | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [evidenceScreenshot, setEvidenceScreenshot] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const opportunityTypes = [
    "offered_contact_info",
    "guided_internship",
    "guided_new_grad",
    "guided_external",
    "other",
  ];

  const handleTypeToggle = (type: string) => {
    if (type === "other") {
      // Other is handled separately
      return;
    }
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEvidenceScreenshot(data.url);
      }
    } catch (error) {
      console.error("Error uploading screenshot:", error);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (offered === null) {
      alert(t("meeting.additionalQuestion.answerRequired") || "Please answer the question");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        offered,
        types: offered ? selectedTypes : [],
        other: offered && selectedTypes.includes("other") ? otherText : null,
        evidenceScreenshot: offered ? evidenceScreenshot : null,
        evidenceDescription: offered ? evidenceDescription : null,
      });
      // Reset form
      setOffered(null);
      setSelectedTypes([]);
      setOtherText("");
      setEvidenceScreenshot("");
      setEvidenceDescription("");
    } catch (error) {
      console.error("Error submitting additional question:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        variants={modalContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
              {t("meeting.additionalQuestion.title") || "Additional Question"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Main Question */}
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#374151' }}>
                {t("meeting.additionalQuestion.question") || 
                 "During the meeting, were you offered to apply, interview, exchange contact info, or scouted outside the platform?"}
              </p>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="offered"
                    value="yes"
                    checked={offered === true}
                    onChange={() => setOffered(true)}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#374151' }}>
                    {t("button.yes") || "Yes"}
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="offered"
                    value="no"
                    checked={offered === false}
                    onChange={() => setOffered(false)}
                    className="mr-2"
                  />
                  <span className="text-sm" style={{ color: '#374151' }}>
                    {t("button.no") || "No"}
                  </span>
                </label>
              </div>
            </div>

            {/* If Yes - Show additional options */}
            {offered === true && (
              <div className="space-y-4 p-4 bg-yellow-50 border rounded" style={{ borderColor: '#FCD34D' }}>
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#92400E' }}>
                    {t("meeting.additionalQuestion.selectTypes") || "Select all that apply:"}
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("offered_contact_info")}
                        onChange={() => handleTypeToggle("offered_contact_info")}
                        className="mr-2"
                      />
                      <span className="text-sm" style={{ color: '#78350F' }}>
                        {t("meeting.additionalQuestion.contactInfo") || "Offered to exchange contact information"}
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("guided_internship")}
                        onChange={() => handleTypeToggle("guided_internship")}
                        className="mr-2"
                      />
                      <span className="text-sm" style={{ color: '#78350F' }}>
                        {t("meeting.additionalQuestion.guidedInternship") || "Guided to internship / new grad position"}
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("guided_external")}
                        onChange={() => handleTypeToggle("guided_external")}
                        className="mr-2"
                      />
                      <span className="text-sm" style={{ color: '#78350F' }}>
                        {t("meeting.additionalQuestion.guidedExternal") || "Guided to external channels (company site / LINE / WeChat)"}
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("other")}
                        onChange={() => handleTypeToggle("other")}
                        className="mr-2"
                      />
                      <span className="text-sm" style={{ color: '#78350F' }}>
                        {t("meeting.additionalQuestion.other") || "Other"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Other Text Input */}
                {selectedTypes.includes("other") && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#92400E' }}>
                      {t("meeting.additionalQuestion.otherDetails") || "Please specify:"}
                    </label>
                    <textarea
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded text-sm"
                      style={{ borderColor: '#FCD34D', borderRadius: '4px' }}
                      placeholder={t("meeting.additionalQuestion.otherPlaceholder") || "Describe..."}
                    />
                  </div>
                )}

                {/* Evidence Upload */}
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#92400E' }}>
                    {t("meeting.additionalQuestion.evidence") || "Evidence (Optional)"}
                  </p>
                  
                  {/* Screenshot Upload */}
                  <div className="mb-2">
                    <label className="block text-xs mb-1" style={{ color: '#78350F' }}>
                      {t("meeting.additionalQuestion.screenshot") || "Screenshot"}
                    </label>
                    <input
                      type="file"
                      id="screenshot-upload"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={uploadingScreenshot}
                      className="hidden"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-md cursor-pointer transition-colors ${uploadingScreenshot ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: '#E5E7EB', color: '#374151' }}
                      onMouseEnter={(e) => !uploadingScreenshot && (e.currentTarget.style.backgroundColor = '#D1D5DB')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E5E7EB')}
                    >
                      {t("button.chooseFile")}
                    </label>
                    {uploadingScreenshot && (
                      <p className="text-xs mt-1" style={{ color: '#78350F' }}>
                        {t("common.uploading")}
                      </p>
                    )}
                    {evidenceScreenshot && (
                      <p className="text-xs mt-1 text-green-700">
                        ✓ {t("meeting.additionalQuestion.uploaded")}
                      </p>
                    )}
                  </div>

                  {/* Text Description */}
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#78350F' }}>
                      {t("meeting.additionalQuestion.description") || "Text Description"}
                    </label>
                    <textarea
                      value={evidenceDescription}
                      onChange={(e) => setEvidenceDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded text-sm"
                      style={{ borderColor: '#FCD34D', borderRadius: '4px' }}
                      placeholder={t("meeting.additionalQuestion.descriptionPlaceholder") || "Describe the situation..."}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {t("button.cancel") || "Cancel"}
              </button>
              <button
                type="submit"
                disabled={offered === null || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? t("common.loading") : t("button.submit") || "Submit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
