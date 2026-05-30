import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function AiLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-xl', icon: 'w-4.5 h-4.5', blur: 'w-4 h-4 -top-1 -right-1', innerRadius: 'rounded-[11px]' },
    md: { container: 'w-11 h-11 rounded-[14px]', icon: 'w-6 h-6', blur: 'w-6 h-6 -top-2 -right-2', innerRadius: 'rounded-[13px]' },
    lg: { container: 'w-16 h-16 rounded-2xl', icon: 'w-9 h-9', blur: 'w-8 h-8 -top-2 -right-2', innerRadius: 'rounded-[15px]' },
    xl: { container: 'w-24 h-24 rounded-[2rem]', icon: 'w-14 h-14', blur: 'w-14 h-14 -top-4 -right-4', innerRadius: 'rounded-[31px]' },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative ${s.container} bg-gradient-to-br from-cyan-400 via-primary-500 to-emerald-400 p-[1.5px] shadow-lg shadow-primary-500/20 overflow-hidden group shrink-0 ${className}`}>
      {/* Outer subtle gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50"></div>
      
      {/* Inner glowing orb */}
      <div className={`absolute ${s.blur} bg-primary-400/20 blur-md rounded-full transition-transform duration-700 group-hover:scale-150`}></div>
      
      {/* Main body */}
      <div className={`w-full h-full bg-slate-900 dark:bg-slate-950 flex items-center justify-center backdrop-blur-md relative z-10 ${s.innerRadius}`}>
         <BrainCircuit className={`${s.icon} text-primary-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]`} strokeWidth={2.2} />
      </div>
    </div>
  );
}
