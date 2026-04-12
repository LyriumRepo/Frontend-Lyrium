'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface HeaderContextType {
  isOverDesktopNav: boolean;
  setIsOverDesktopNav: (value: boolean) => void;
  closeSearchDropdowns: () => void;
  closeSearchDropdownsTrigger: number;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [isOverDesktopNav, setIsOverDesktopNav] = useState(false);
  const [closeSearchDropdownsTrigger, setCloseSearchDropdownsTrigger] = useState(0);

  const closeSearchDropdowns = useCallback(() => {
    setCloseSearchDropdownsTrigger(prev => prev + 1);
  }, []);

  return (
    <HeaderContext.Provider value={{ isOverDesktopNav, setIsOverDesktopNav, closeSearchDropdowns, closeSearchDropdownsTrigger }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
}
