interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon - Updated SVG to match your design */}
      <div className={`${sizes[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 120 120" 
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main rounded rectangle background */}
          <rect 
            x="8" 
            y="8" 
            width="104" 
            height="104" 
            rx="16" 
            ry="16" 
            fill="#1e3a5f"
            stroke="#1e3a5f"
            strokeWidth="2"
          />
          
          {/* Inner white/light area */}
          <rect 
            x="18" 
            y="18" 
            width="84" 
            height="84" 
            rx="8" 
            ry="8" 
            fill="#ffffff"
          />
          
          {/* Photo/image icon - circle (sun/moon) */}
          <circle 
            cx="42" 
            cy="42" 
            r="8" 
            fill="#1e3a5f"
          />
          
          {/* Mountain/landscape silhouette - more accurate to your design */}
          <path 
            d="M22 78 L35 58 L48 68 L62 52 L75 62 L88 48 L98 78 Z" 
            fill="#1e3a5f"
          />
          
          {/* Additional mountain layer for depth */}
          <path 
            d="M22 78 L32 68 L42 75 L52 65 L62 72 L72 62 L82 70 L98 78 Z" 
            fill="#1e3a5f"
            opacity="0.6"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizes[size]} text-white leading-tight`}>
            peek
          </span>
          <span className={`text-white/70 text-xs font-medium tracking-wide uppercase`}>
            Photobooth
          </span>
        </div>
      )}
    </div>
  );
}
