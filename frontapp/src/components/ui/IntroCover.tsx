'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface IntroCoverProps {
  title: string;
  subtitle: string;
  icon?: string;
  buttonText?: string;
  buttonIcon?: string;
  onEnter: () => void;
  autoHideAfter?: number;
  backgroundImage?: string;
  iconSize?: string;
}

export default function IntroCover({
  title,
  subtitle,
  icon = 'ShoppingBag',
  buttonText = 'Entrar',
  buttonIcon,
  onEnter,
  autoHideAfter = 0,
  backgroundImage,
}: IntroCoverProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (autoHideAfter && autoHideAfter > 0) {
      const timer = setTimeout(() => {
        handleEnter();
      }, autoHideAfter);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoHideAfter]);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onEnter();
    }, 500);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        transition-all duration-500
        ${exiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
      `}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {icon && (
          <div className="w-24 h-24 rounded-[3rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl animate-bounce-subtle">
            <Icon name={icon} className="w-12 h-12 text-white" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
          {title}
        </h1>

        <p className="text-lg text-white/70 font-medium mb-10 max-w-sm">
          {subtitle}
        </p>

        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.97]"
        >
          {buttonIcon ? (
            <Icon name={buttonIcon} className="w-5 h-5" />
          ) : null}
          {buttonText}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
