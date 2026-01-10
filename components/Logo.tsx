"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center cursor-pointer group hover:opacity-90 transition-opacity duration-200">
      <Image
        src="/assets/image (2).png"
        alt="Senpai Career"
        width={240}
        height={60}
        priority
        className="h-16 w-auto"
      />
    </div>
  );
}
