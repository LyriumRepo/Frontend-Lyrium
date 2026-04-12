'use client';
import { useEffect, useState } from 'react';

interface Props {
  msg: string; color: string; visible: boolean; onClose: () => void;
}

export default function Notification({ msg, color, visible, onClose }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (visible) { setShow(true); }
    else { setTimeout(() => setShow(false), 500); }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="mini-notification" id="miniNotification"
      style={{ display: 'block', animation: visible ? 'slideIn 0.5s ease-out' : 'slideOut 0.5s ease-out forwards', borderLeftColor: color }}>
      <p id="notificationText">{msg}</p>
      <button className="close-notification" onClick={onClose}>×</button>
    </div>
  );
}
