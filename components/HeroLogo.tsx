"use client";

export default function HeroLogo() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Enhanced Logo with more detail */}
      <div className="relative inline-block">
        {/* Decorative corner accents */}
        <div className="absolute -top-4 -left-4 w-4 h-4 rounded-full opacity-70 animate-pulse" style={{
          background: 'linear-gradient(135deg, #f26aa3 0%, #f59fc1 100%)',
          boxShadow: '0 0 12px rgba(242, 106, 163, 0.6)',
        }} />
        <div className="absolute -top-4 -right-4 w-4 h-4 rounded-full opacity-70 animate-pulse" style={{
          background: 'linear-gradient(135deg, #f59fc1 0%, #6fd3ee 100%)',
          boxShadow: '0 0 12px rgba(245, 159, 193, 0.6)',
        }} />
        <div className="absolute -bottom-4 -left-4 w-4 h-4 rounded-full opacity-70 animate-pulse" style={{
          background: 'linear-gradient(135deg, #6fd3ee 0%, #4cc3e6 100%)',
          boxShadow: '0 0 12px rgba(111, 211, 238, 0.6)',
        }} />
        <div className="absolute -bottom-4 -right-4 w-4 h-4 rounded-full opacity-70 animate-pulse" style={{
          background: 'linear-gradient(135deg, #4cc3e6 0%, #6fd3ee 100%)',
          boxShadow: '0 0 12px rgba(76, 195, 230, 0.6)',
        }} />
        
        {/* Main logo text */}
        <div className="relative">
          <span 
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight block"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transform: 'perspective(500px) rotateX(8deg) translateY(-2px)',
              display: 'inline-block',
              background: 'linear-gradient(90deg, #f26aa3 0%, #f59fc1 20%, #6fd3ee 40%, #4cc3e6 60%, #6fd3ee 80%, #f59fc1 100%)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 4px 8px rgba(242, 106, 163, 0.4)) drop-shadow(0 8px 12px rgba(79, 195, 230, 0.3)) drop-shadow(0 2px 4px rgba(111, 211, 238, 0.2))',
              transition: 'all 0.3s ease',
              letterSpacing: '0.05em',
              color: 'transparent',
              fontWeight: '900',
              textTransform: 'uppercase',
              lineHeight: '1.1',
              animation: 'gradient-flow 15s ease infinite',
            }}
          >
            Senpai Career
          </span>
          
          {/* Decorative underline with gradient and glow */}
          <div className="relative mt-6">
            <div 
              className="mx-auto h-1.5 rounded-full"
              style={{
                width: '70%',
                background: 'linear-gradient(90deg, #f26aa3 0%, #f59fc1 20%, #6fd3ee 40%, #4cc3e6 60%, #6fd3ee 80%, #f59fc1 100%)',
                backgroundSize: '300% 100%',
                boxShadow: '0 2px 8px rgba(242, 106, 163, 0.4), 0 4px 12px rgba(79, 195, 230, 0.3), 0 0 20px rgba(111, 211, 238, 0.2)',
                animation: 'gradient-flow 15s ease infinite',
              }}
            />
            {/* Glow effect underneath */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 h-2 rounded-full blur-md opacity-50"
              style={{
                width: '50%',
                background: 'linear-gradient(90deg, #f26aa3 0%, #f59fc1 20%, #6fd3ee 40%, #4cc3e6 60%, #6fd3ee 80%, #f59fc1 100%)',
                backgroundSize: '300% 100%',
                animation: 'gradient-flow 15s ease infinite',
              }}
            />
          </div>
          
          {/* Decorative sparkles/accents around text */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full opacity-40" style={{
              background: 'radial-gradient(circle, #f26aa3 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full opacity-40" style={{
              background: 'radial-gradient(circle, #6fd3ee 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite 0.5s',
            }} />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full opacity-40" style={{
              background: 'radial-gradient(circle, #f59fc1 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite 1s',
            }} />
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full opacity-40" style={{
              background: 'radial-gradient(circle, #4cc3e6 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite 1.5s',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

