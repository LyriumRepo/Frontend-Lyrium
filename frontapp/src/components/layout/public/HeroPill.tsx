'use client';

import Icon from '@/components/ui/Icon';

interface HeroPillProps {
  icon: string;
  text: string;
}

export default function HeroPill({ icon, text }: HeroPillProps) {
  return (
    <div className="flex justify-center">
      <div 
        className="flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 w-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white shadow-lg shadow-[0_10px_25px_rgba(14,165,233,0.2)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.25)] font-black tracking-tight"
        style={{ fontSize: 'clamp(20px, 2.6vw, 34px)' }}
      >
        <Icon 
          name={icon} 
          className="w-[17px] md:w-[26px] h-[17px] md:h-[26px]" 
        />
        <span>{text}</span>
      </div>
    </div>
  );
}
