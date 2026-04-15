export const SarahAvatar = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Face */}
    <circle cx="100" cy="90" r="50" fill="#FFD7BA"/>
    
    {/* Hair */}
    <path d="M100 40 C130 40, 150 60, 150 90 L150 70 C150 55, 135 40, 100 40 Z" fill="#5D4037"/>
    <path d="M100 40 C70 40, 50 60, 50 90 L50 70 C50 55, 65 40, 100 40 Z" fill="#5D4037"/>
    <ellipse cx="100" cy="55" rx="55" ry="35" fill="#5D4037"/>
    
    {/* Eyes */}
    <ellipse cx="85" cy="85" rx="5" ry="7" fill="#2C1810"/>
    <ellipse cx="115" cy="85" rx="5" ry="7" fill="#2C1810"/>
    <circle cx="86" cy="84" r="2" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="116" cy="84" r="2" fill="#FFFFFF" opacity="0.8"/>
    
    {/* Eyebrows */}
    <path d="M78 75 Q85 73, 92 75" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M108 75 Q115 73, 122 75" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" fill="none"/>
    
    {/* Smile */}
    <path d="M85 100 Q100 108, 115 100" stroke="#D4756B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    
    {/* Blush */}
    <ellipse cx="75" cy="95" rx="8" ry="5" fill="#FFB6A3" opacity="0.6"/>
    <ellipse cx="125" cy="95" rx="8" ry="5" fill="#FFB6A3" opacity="0.6"/>
    
    {/* Neck */}
    <rect x="85" y="130" width="30" height="20" fill="#FFD7BA" rx="5"/>
    
    {/* Professional Attire - Collar */}
    <path d="M70 150 L85 140 L100 150 L115 140 L130 150" fill="#EF6E2D" stroke="#EF6E2D" strokeWidth="2"/>
    <circle cx="100" cy="150" r="4" fill="#FDC22C"/>
  </svg>
);

export const WaveHandEmoji = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Waving Hand */}
    <g className="wave-animation">
      <path d="M30 50 Q35 30, 50 35 L48 50 Z" fill="#FFD7BA"/>
      <path d="M50 35 Q65 30, 60 50 L48 50 Z" fill="#FFD7BA"/>
      <path d="M48 50 L50 70 Q55 75, 45 75 Q40 75, 45 70 L48 50 Z" fill="#FFD7BA"/>
      <circle cx="42" cy="73" r="12" fill="#FFD7BA"/>
      <circle cx="52" cy="73" r="12" fill="#FFD7BA"/>
    </g>
  </svg>
);
