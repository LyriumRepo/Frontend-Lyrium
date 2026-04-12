import { useState, useCallback } from 'react';

interface UseModalOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { defaultOpen = false, onOpen, onClose } = options;
  
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [onOpen, onClose]);

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
  };
}

interface UseDrawerOptions {
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseDrawerReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDrawer(options: UseDrawerOptions = {}): UseDrawerReturn {
  const { defaultOpen = false, onOpen, onClose } = options;
  
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
