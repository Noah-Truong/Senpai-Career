"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "./Avatar";

interface Thread {
  id: string;
  otherUser?: {
    name?: string;
    profilePhoto?: string;
  };
  lastMessage?: {
    content?: string;
    createdAt?: string;
  };
}

interface ConversationListProps {
  threads: Thread[];
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export default function ConversationList({
  threads,
  emptyMessage,
  emptyAction,
}: ConversationListProps) {
  const { t } = useLanguage();
  const { translate } = useTranslated();

  if (threads.length === 0) {
    return (
      <div 
        className="p-6 sm:p-8 text-center border rounded"
        style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <p className="text-base sm:text-lg mb-4" style={{ color: '#374151' }}>
          {emptyMessage || t("messages.empty")}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {threads.map((thread) => (
        <ConversationItem key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  thread: Thread;
}

function ConversationItem({ thread }: ConversationItemProps) {
  const { t } = useLanguage();
  const { translate } = useTranslated();

  return (
    <Link
      href={`/messages/${thread.id}`}
      className="p-3 sm:p-4 bg-white border rounded hover:shadow-md transition-shadow block"
      style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <Avatar
          src={thread.otherUser?.profilePhoto}
          alt={thread.otherUser?.name || t("label.unknownUser")}
          size="md"
          fallbackText={thread.otherUser?.name}
          className="shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold truncate" style={{ color: '#111827' }}>
            {thread.otherUser?.name || t("label.unknownUser")}
          </h3>
          <p className="text-xs sm:text-sm truncate" style={{ color: '#6B7280' }}>
            {thread.lastMessage?.content ? translate(thread.lastMessage.content) : t("label.noMessagesYet")}
          </p>
        </div>
        <div className="text-xs sm:text-sm shrink-0" style={{ color: '#9CA3AF' }}>
          {thread.lastMessage?.createdAt 
            ? new Date(thread.lastMessage.createdAt).toLocaleDateString()
            : ""}
        </div>
      </div>
    </Link>
  );
}

export { ConversationItem };
