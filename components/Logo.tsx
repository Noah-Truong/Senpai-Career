"use client";

export default function Logo() {
  return (
    <div className="flex items-center cursor-pointer group hover:opacity-90 transition-opacity duration-200">
      <span 
        className="text-xl md:text-2xl font-bold tracking-tight"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          color: '#0F2A44',
          letterSpacing: '-0.02em',
        }}
      >
        Senpai Career
      </span>
    </div>
  );
}
