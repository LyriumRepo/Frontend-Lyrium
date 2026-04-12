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
        className="flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 w-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-lg shadow-sky-500/20 font-black tracking-tight"
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
