'use client';

import { useRef } from 'react';

interface Props {
    size?: 'sm' | 'md';
}

const STYLES = `
@keyframes chatBounce {
    0%, 100% { transform: translateY(0px) rotate(-1deg); }
    50% { transform: translateY(-3px) rotate(1deg); }
}
.chatbot-avatar-img {
    animation: chatBounce 3s ease-in-out infinite;
}
.chatbot-avatar-wrap:hover .chatbot-avatar-img {
    animation: none;
    transform: scale(1.08);
    transition: transform 0.2s ease;
}
.chatbot-avatar-wrap:hover {
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.4), 0 0 12px rgba(52, 211, 153, 0.3);
}
`;

export default function ChatBotAvatar({ size = 'sm' }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const dim = size === 'md' ? 'w-9 h-9' : 'w-8 h-8';

    const handleClick = () => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('span');
            const angle = (i / 6) * 2 * Math.PI;
            const dist = 20 + Math.random() * 10;
            particle.style.cssText = `
                position:fixed;left:${cx}px;top:${cy}px;width:5px;height:5px;
                border-radius:50%;background:${['#34d399','#6ee7b7','#bef264'][i % 3]};
                pointer-events:none;z-index:9999;transform:translate(-50%,-50%);
                transition:all 0.5s ease-out;opacity:1;
            `;
            document.body.appendChild(particle);
            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px))`;
                particle.style.opacity = '0';
            });
            setTimeout(() => particle.remove(), 550);
        }
    };

    return (
        <>
            <style>{STYLES}</style>
            <div
                ref={wrapRef}
                onClick={handleClick}
                className={`chatbot-avatar-wrap flex-shrink-0 ${dim} rounded-full bg-gradient-to-br from-emerald-700 to-teal-600 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] flex items-center justify-center shadow-sm overflow-hidden transition-all duration-200 cursor-pointer`}
            >
                <img
                    src="/img/iconologo.png"
                    alt="Lyrio"
                    className="chatbot-avatar-img w-[70%] h-[70%] object-contain select-none"
                    draggable={false}
                />
            </div>
        </>
    );
}
