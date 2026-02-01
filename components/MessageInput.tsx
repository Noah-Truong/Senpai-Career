"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  placeholder,
  disabled = false,
}: MessageInputProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sending || disabled) {
      return;
    }

    setSending(true);
    try {
      await onSend(message);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-3 sm:p-4 bg-white border rounded"
      style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder || t("messages.thread.placeholder")}
          rows={3}
          disabled={disabled || sending}
          className="flex-1 min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
        />
        <button
          type="submit"
          disabled={sending || !message.trim() || disabled}
          className="w-full sm:w-auto min-h-[44px] btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-2 text-sm sm:text-base"
        >
          {sending ? t("common.loading") : t("messages.thread.send")}
        </button>
      </div>
    </form>
  );
}
