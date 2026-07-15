import React from 'react';

// Inferences based on percentage coordinate layout
const inferPart = (type, x, y) => {
  const t = type?.toLowerCase() || 'car';
  
  if (t === 'car' || t === 'suv' || t === 'taxi') {
    // Wheels first to avoid overlapping with side panel regions
    if (x < 25 && y >= 20 && y < 35) return 'Left Front Wheel';
    if (x > 75 && y >= 20 && y < 35) return 'Right Front Wheel';
    if (x < 25 && y >= 65 && y < 80) return 'Left Rear Wheel';
    if (x > 75 && y >= 65 && y < 80) return 'Right Rear Wheel';

    if (y < 15) return 'Front Bumper';
    if (y >= 85) return 'Rear Bumper';
    
    if (y >= 15 && y < 30) {
      if (x >= 25 && x <= 75) return 'Hood';
      return x < 25 ? 'Left Front Fender' : 'Right Front Fender';
    }
    if (y >= 30 && y < 45) {
      if (x >= 25 && x <= 75) return 'Windshield';
      return x < 25 ? 'Left Side Mirror' : 'Right Side Mirror';
    }
    if (y >= 45 && y < 62) {
      if (x >= 25 && x <= 75) return 'Front Roof Section';
      return x < 25 ? 'Driver Side Door' : 'Passenger Side Door';
    }
    if (y >= 62 && y < 78) {
      if (x >= 25 && x <= 75) return 'Rear Roof Section';
      return x < 25 ? 'Left Rear Door' : 'Right Rear Door';
    }
    if (y >= 78 && y < 85) {
      if (x >= 25 && x <= 75) return 'Trunk / Rear Windshield';
      return x < 25 ? 'Left Rear Quarter Panel' : 'Right Rear Quarter Panel';
    }
    return 'Main Frame';
  }
  
  if (t === 'bike') {
    if (x < 28 && y > 60) return 'Front Wheel';
    if (x > 72 && y > 60) return 'Rear Wheel';
    if (x >= 15 && x < 35 && y <= 55) return 'Handlebars & Controls';
    if (x >= 20 && x < 35 && y > 35 && y <= 65) return 'Front Fork & Suspension';
    if (x >= 35 && x < 55 && y < 50) return 'Fuel Tank';
    if (x >= 52 && x < 75 && y < 50) return 'Seat';
    if (x >= 35 && x < 68 && y >= 50 && y <= 72) return 'Engine & Gearbox';
    if (x >= 55 && x < 85 && y >= 65) return 'Exhaust system';
    if (x >= 65 && x < 85 && y >= 50 && y < 65) return 'Chain & Swingarm';
    return 'Main Frame';
  }
  
  if (t === 'activa' || t === 'scooter') {
    if (x < 28 && y > 60) return 'Front Wheel';
    if (x > 72 && y > 60) return 'Rear Wheel';
    if (x >= 20 && x < 40 && y < 35) return 'Handlebars & Headlight';
    if (x >= 22 && x < 42 && y >= 35 && y <= 62) return 'Front Apron / Shield';
    if (x >= 35 && x < 58 && y >= 60) return 'Floorboard / Step';
    if (x >= 50 && x < 78 && y < 52) return 'Seat';
    if (x >= 55 && x < 82 && y >= 52 && y <= 72) return 'Side Cover Panel / Engine';
    if (x >= 70 && y >= 62) return 'Exhaust Muffler';
    return 'Body Shield';
  }

  return 'Vehicle Body';
};

// Colors based on damage type
const getPinColor = (type, isSelected) => {
  const colors = {
    scratch: {
      bg: 'bg-amber-500',
      border: 'border-amber-400',
      ring: 'ring-amber-500/40',
      glow: 'shadow-[0_0_12px_#f59e0b]'
    },
    dent: {
      bg: 'bg-red-500',
      border: 'border-red-400',
      ring: 'ring-red-500/40',
      glow: 'shadow-[0_0_12px_#ef4444]'
    },
    crack: {
      bg: 'bg-indigo-500',
      border: 'border-indigo-400',
      ring: 'ring-indigo-500/40',
      glow: 'shadow-[0_0_12px_#6366f1]'
    },
    other: {
      bg: 'bg-cyan-500',
      border: 'border-cyan-400',
      ring: 'ring-cyan-500/40',
      glow: 'shadow-[0_0_12px_#06b6d4]'
    }
  };
  return colors[type] || colors.scratch;
};

export default function VehicleDamageVector({ type, pins = [], onAddPin, onSelectPin, selectedPinId }) {
  const normalizedType = ['suv', 'bike', 'activa', 'scooter'].includes(type?.toLowerCase()) 
    ? type.toLowerCase() 
    : 'car';

  const handleContainerClick = (e) => {
    // Prevent adding pin if clicking on existing pin marker
    if (e.target.closest('.damage-pin-marker')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
    const part = inferPart(normalizedType, x, y);
    
    if (onAddPin) {
      onAddPin(x, y, part);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#0d0d15]/50 border border-white/[0.04] rounded-2xl relative select-none">
      <div className="absolute top-3 left-3 flex flex-wrap gap-3 z-10 text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Scratch</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Dent</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> Crack</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" /> Other</span>
      </div>

      <div className="w-full text-center mt-6 mb-2 text-xs text-slate-400 font-semibold">
        Tap anywhere on the schematic below to report cosmetic damage
      </div>

      {/* SVG Canvas Container */}
      <div 
        onClick={handleContainerClick}
        className="w-full max-w-sm aspect-[4/5] bg-black/30 border border-white/[0.05] rounded-xl relative cursor-crosshair overflow-hidden flex items-center justify-center p-6 hover:border-orange-500/20 transition-all duration-300"
      >
        {/* Render vehicle outline based on type */}
        {normalizedType === 'car' && (
          <svg className="w-full h-full text-slate-600 hover:text-slate-500 transition-colors" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Mirrors */}
            <path d="M16 48 C 12 48, 12 43, 17 43 Z" fill="rgba(255,255,255,0.01)" />
            <path d="M84 48 C 88 48, 88 43, 83 43 Z" fill="rgba(255,255,255,0.01)" />
            
            {/* Wheels */}
            <rect x="14" y="24" width="6" height="15" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.2" />
            <rect x="80" y="24" width="6" height="15" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.2" />
            <rect x="14" y="78" width="6" height="15" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.2" />
            <rect x="80" y="78" width="6" height="15" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.2" />

            {/* Main Body */}
            <path d="M 24 16 
                     C 24 12, 35 10, 50 10 
                     C 65 10, 76 12, 76 16 
                     L 78 40
                     C 78 50, 76 90, 75 102
                     C 74 108, 65 110, 50 110
                     C 35 110, 26 108, 25 102
                     C 24 90, 22 50, 22 40
                     Z" 
                  fill="rgba(255,255,255,0.02)" 
                  strokeWidth="1.5"
            />
            
            {/* Windshield */}
            <path d="M 28 42 C 30 36, 70 36, 72 42 Z" fill="rgba(255,255,255,0.05)" />
            
            {/* Rear Glass */}
            <path d="M 30 84 C 32 88, 68 88, 70 84 Z" fill="rgba(255,255,255,0.05)" />
            
            {/* Hood Line */}
            <path d="M 24 30 L 76 30" />
            <path d="M 32 10 L 32 30" strokeDasharray="2,2" />
            <path d="M 68 10 L 68 30" strokeDasharray="2,2" />

            {/* Roof Outline */}
            <path d="M 28 42 L 28 84" />
            <path d="M 72 42 L 72 84" />
            
            {/* Door separations */}
            <path d="M 22 62 L 28 62" />
            <path d="M 72 62 L 78 62" />
            <path d="M 22 42 L 28 42" />
            <path d="M 72 42 L 78 42" />

            {/* Trunk Line */}
            <path d="M 25 94 L 75 94" />
            
            {/* Bumpers */}
            <path d="M 30 11 L 70 11" strokeWidth="2" />
            <path d="M 28 109 L 72 109" strokeWidth="2" />
          </svg>
        )}

        {normalizedType === 'suv' && (
          <svg className="w-full h-full text-slate-600 hover:text-slate-500 transition-colors" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Aggressive Mirrors */}
            <path d="M14 47 C 9 47, 9 41, 16 41 Z" fill="rgba(255,255,255,0.01)" />
            <path d="M86 47 C 91 47, 91 41, 84 41 Z" fill="rgba(255,255,255,0.01)" />
            
            {/* Heavy wheels */}
            <rect x="11" y="22" width="8" height="18" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.5" />
            <rect x="81" y="22" width="8" height="18" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.5" />
            <rect x="11" y="80" width="8" height="18" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.5" />
            <rect x="81" y="80" width="8" height="18" rx="2" fill="#181824" stroke="currentColor" strokeWidth="1.5" />

            {/* Boxy SUV Body */}
            <path d="M 22 14 
                     L 78 14 
                     L 80 38
                     L 80 100
                     C 80 107, 72 108, 50 108
                     C 28 108, 20 107, 20 100
                     L 20 38
                     Z" 
                  fill="rgba(255,255,255,0.02)" 
                  strokeWidth="1.6"
            />
            
            {/* Boxy Windshield */}
            <path d="M 24 38 L 76 38" />
            <path d="M 26 38 L 30 46 L 70 46 L 74 38 Z" fill="rgba(255,255,255,0.05)" />
            
            {/* Rear Window */}
            <path d="M 25 90 L 75 90 Z" />
            <path d="M 26 90 L 28 96 L 72 96 L 74 90 Z" fill="rgba(255,255,255,0.05)" />
            
            {/* Hood lines */}
            <path d="M 20 28 L 80 28" />
            <path d="M 34 14 L 34 28" />
            <path d="M 66 14 L 66 28" />
            
            {/* Roof Rails */}
            <path d="M 27 46 L 27 90" strokeWidth="1.5" />
            <path d="M 73 46 L 73 90" strokeWidth="1.5" />

            {/* Door separations */}
            <path d="M 20 46 L 26 46" />
            <path d="M 74 46 L 80 46" />
            <path d="M 20 66 L 26 66" />
            <path d="M 74 66 L 80 66" />
            
            {/* Spare tire holder outline */}
            <circle cx="50" cy="102" r="9" fill="rgba(255,255,255,0.02)" strokeDasharray="1,1" />

            {/* Front & Rear Bumpers */}
            <path d="M 24 14 L 76 14" strokeWidth="2.5" />
            <path d="M 22 108 L 78 108" strokeWidth="2.5" />
          </svg>
        )}

        {normalizedType === 'bike' && (
          <svg className="w-full h-full text-slate-600 hover:text-slate-500 transition-colors" viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Wheels */}
            <circle cx="24" cy="72" r="16" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
            <circle cx="24" cy="72" r="6" stroke="currentColor" strokeDasharray="2,2" />
            <circle cx="96" cy="72" r="16" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
            <circle cx="96" cy="72" r="6" stroke="currentColor" strokeDasharray="2,2" />
            
            {/* Forks & Suspension */}
            <path d="M 24 72 L 38 28" strokeWidth="2" />
            
            {/* Handlebars */}
            <path d="M 38 28 L 36 20 M 38 28 L 44 24" strokeWidth="1.8" />
            <circle cx="36" cy="20" r="1.5" fill="currentColor" />
            
            {/* Fuel Tank */}
            <path d="M 38 28 
                     C 48 24, 60 22, 66 36 
                     L 52 46 Z" 
                  fill="rgba(255,255,255,0.02)" 
                  strokeWidth="1.5"
            />
            
            {/* Seat */}
            <path d="M 66 36 
                     C 70 34, 76 34, 86 38 
                     C 92 41, 94 48, 92 52 
                     L 74 52
                     Z" 
                  fill="rgba(255,255,255,0.03)" 
                  strokeWidth="1.5"
            />
            
            {/* Engine & Frame */}
            <rect x="46" y="48" width="22" height="18" rx="3" fill="rgba(0,0,0,0.2)" strokeWidth="1.5" />
            <path d="M 46 54 L 68 54 M 46 60 L 68 60" />
            <path d="M 38 28 L 52 48 L 74 52 L 96 72" strokeWidth="1.5" />
            
            {/* Swingarm */}
            <path d="M 62 64 L 96 72" strokeWidth="2" />
            
            {/* Exhaust */}
            <path d="M 54 66 C 70 66, 82 66, 102 58" strokeWidth="2.2" />
          </svg>
        )}

        {normalizedType === 'activa' && (
          <svg className="w-full h-full text-slate-600 hover:text-slate-500 transition-colors" viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Scooter Wheels */}
            <circle cx="24" cy="74" r="13" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
            <circle cx="24" cy="74" r="4" stroke="currentColor" />
            <circle cx="94" cy="74" r="13" strokeWidth="2" fill="rgba(255,255,255,0.01)" />
            <circle cx="94" cy="74" r="4" stroke="currentColor" />
            
            {/* Front Mudguard & Forks */}
            <path d="M 20 62 C 20 62, 24 58, 28 62 L 24 74" />
            <path d="M 24 74 L 34 42" strokeWidth="1.8" />
            
            {/* Front Apron (Shield) */}
            <path d="M 34 42 
                     C 30 36, 32 26, 37 26 
                     C 42 26, 44 42, 42 54 
                     L 34 54 Z" 
                  fill="rgba(255,255,255,0.02)" 
                  strokeWidth="1.5"
            />
            <path d="M 38 32 L 38 48" strokeWidth="1.2" strokeDasharray="1,1" />

            {/* Handlebars & Headlight */}
            <path d="M 36 26 L 38 20 L 40 26 M 34 22 L 42 22" strokeWidth="1.8" />
            <circle cx="38" cy="20" r="2.5" fill="rgba(255,255,255,0.1)" />

            {/* Floorboard */}
            <path d="M 40 54 L 40 68 C 40 72, 60 72, 62 68 L 62 58" strokeWidth="1.8" />
            
            {/* Rear Panel / Engine Cover */}
            <path d="M 62 58 
                     C 62 48, 70 38, 86 38 
                     C 96 38, 102 46, 102 58 
                     C 102 68, 96 74, 88 74 
                     L 62 74 
                     Z" 
                  fill="rgba(255,255,255,0.03)" 
                  strokeWidth="1.5"
            />
            
            {/* Seat */}
            <path d="M 44 48 
                     C 50 44, 70 42, 82 48 
                     L 82 54 L 54 54 Z" 
                  fill="rgba(255,255,255,0.05)" 
                  strokeWidth="1.5"
            />
            
            {/* Exhaust Muffler */}
            <path d="M 74 70 L 98 64" strokeWidth="2.5" />
          </svg>
        )}

        {/* Render Glowing Pins */}
        {pins.map((pin) => {
          const isSelected = pin.id === selectedPinId;
          const styles = getPinColor(pin.type, isSelected);
          
          return (
            <button
              key={pin.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectPin) onSelectPin(pin);
              }}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className={`damage-pin-marker absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center border-2 text-[8px] font-black text-white hover:scale-125 z-20 transition-all duration-200 ${
                styles.bg
              } ${styles.border} ${styles.glow} ${
                isSelected ? 'scale-125 ring-4 ' + styles.ring : ''
              }`}
            >
              {pin.reportedBy === 'owner' ? 'O' : 'C'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
