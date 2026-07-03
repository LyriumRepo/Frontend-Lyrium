'use client';

import { useState, useEffect, useCallback } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './VirtualKeyboard.css';

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

  useEffect(() => {
    if (!visible) {
      setLayoutName('default');
    }
  }, [visible]);

  const handleKeyPress = useCallback(
    (button: string) => {
      if (button === '{shift}') {
        setLayoutName((prev) => (prev === 'default' ? 'shift' : 'default'));
      } else if (button === '{hide}') {
        onClose();
      }
    },
    [onClose],
  );

  if (!visible) return null;

  return (
    <div className="w-full shadow-2xl rounded-b-2xl overflow-hidden">
      <Keyboard
        input={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        layoutName={layoutName}
        layout={layouts}
        display={display}
        theme="hg-theme-lyrium"
        physicalKeyboard={true}
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
