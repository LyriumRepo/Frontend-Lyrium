'use client';

import { useState, useEffect, useCallback } from 'react';
import Keyboard from 'react-simple-keyboard';
import { Volume2, VolumeX } from 'lucide-react';
import 'react-simple-keyboard/build/css/index.css';
import './VirtualKeyboard.css';
import { useKeySound } from './hooks/useKeySound';

interface VirtualKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  visible: boolean;
}

const layouts = {
  default: [
    '1 2 3 4 5 6 7 8 9 0',
    'q w e r t y u i o p',
    'a s d f g h j k l ñ',
    '{shift} z x c v b n m {bksp}',
    'á é í ó ú , . {space} {hide}',
  ],
  shift: [
    '1 2 3 4 5 6 7 8 9 0',
    'Q W E R T Y U I O P',
    'A S D F G H J K L Ñ',
    '{shift} Z X C V B N M {bksp}',
    'Á É Í Ó Ú , . {space} {hide}',
  ],
};

const display = {
  '{shift}': '⇧',
  '{bksp}': '⌫',
  '{space}': ' ',
  '{hide}': '✕',
};

export default function VirtualKeyboard({
  value,
  onChange,
  onClose,
  visible,
}: VirtualKeyboardProps) {
  const [layoutName, setLayoutName] = useState('default');
  const { play, enabled, toggle } = useKeySound();

  useEffect(() => {
    if (!visible) {
      setLayoutName('default');
    }
  }, [visible]);

  const handleKeyPress = useCallback(
    (button: string) => {
      play();
      if (button === '{shift}') {
        setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
      } else if (button === '{hide}') {
        onClose();
      }
    },
    [onClose, play],
  );

  if (!visible) return null;

  return (
    <div className="w-full shadow-2xl rounded-b-2xl overflow-hidden relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={enabled ? 'Silenciar teclado' : 'Activar sonido'}
        className="absolute top-1 right-1 z-10 p-1.5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--celeste-100)] dark:hover:bg-[rgba(42,90,77,0.35)] transition-colors"
      >
        {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <Keyboard
        input={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        layoutName={layoutName}
        layout={layouts}
        display={display}
        theme="hg-theme-lyrium"
        physicalKeyboard={true}
        physicalKeyboardHighlight={false}
        autoUseTouchEvents={false}
        buttonTheme={[
          {
            class: 'hg-functionBtn',
            buttons: '{shift} {bksp} {hide}',
          },
        ]}
      />
    </div>
  );
}
