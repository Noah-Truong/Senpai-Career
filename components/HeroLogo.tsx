"use client";

export default function HeroLogo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-block">
        {/* Main logo text */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            color: '#0F2A44',
            letterSpacing: '-0.02em',
            lineHeight: '1.1',
          }}
        >
          Senpai Career
        </h1>
        
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
