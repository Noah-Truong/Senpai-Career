"use client";

export default function Logo() {
  return (
    <div className="flex flex-col items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300">
      {/* Senpai - Top line */}
      <div className="relative">
        <span 
          className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight group-hover:scale-110"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: 'perspective(500px) rotateX(8deg) translateY(-2px)',
            display: 'inline-block',
            background: 'linear-gradient(135deg, #f26aa3 0%, #f59fc1 35%, #6fd3ee 70%, #4cc3e6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(242, 106, 163, 0.3)) drop-shadow(0 4px 6px rgba(79, 195, 230, 0.2))',
            transition: 'all 0.3s ease',
            letterSpacing: '0.02em',
            color: 'transparent',
            fontSize: '24px',
            fontWeight: 'bold'
          }}
        >
          Senpai Career
        </span>
      </div>
    </div>
  );
}
