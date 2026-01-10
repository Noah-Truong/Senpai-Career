"use client";

import Image from "next/image";

export default function HeroLogo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-block">
        <Image
          src="/assets/image (2).png"
          alt="Senpai Career"
          width={800}
          height={150}
          priority
          className="h-32 md:h-40 lg:h-48 w-auto"
        />

        {/* Subtle accent underline */}
        <div className="mt-4 flex justify-center">
          <div
            className="h-1 rounded-full"
            style={{
              width: '120px',
              backgroundColor: '#2563EB',
            }}
          />
        </div>
      </div>
    </div>
  );
}
