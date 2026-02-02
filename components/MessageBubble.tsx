"use client";

import { useTranslated } from "@/lib/translation-helpers";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: string;
    fromUserId: string;
    sender?: {
      name?: string;
      email?: string;
      role?: string;
    };
  };
  isOwn: boolean;
  isAdminView?: boolean;
  unknownUserLabel?: string;
}

export default function MessageBubble({
  message,
  isOwn,
  isAdminView = false,
  unknownUserLabel = "Unknown User",
}: MessageBubbleProps) {
  const { translate } = useTranslated();
  const senderName = message.sender?.name || message.sender?.email || unknownUserLabel;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded break-words"
        style={{
          backgroundColor: isOwn ? '#0F2A44' : '#D7FFEF',
          color: isOwn ? '#FFFFFF' : '#111827',
          borderRadius: '6px'
        }}
      >
        {isAdminView && (
          <p 
            className="text-xs font-medium mb-1"
            style={{ 
              color: isOwn ? '#FFFFFFE6' : 'var(--text-muted)',
              opacity: 0.8
            }}
          >
            {senderName} {message.sender?.role && `(${message.sender.role})`}
          </p>
        )}
        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
          {translate(message.content)}
        </p>
        <p 
          className="text-xs mt-1"
          style={{ color: isOwn ? '#FFFFFFB3' : 'var(--text-muted)' }}
        >
          {new Date(message.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
