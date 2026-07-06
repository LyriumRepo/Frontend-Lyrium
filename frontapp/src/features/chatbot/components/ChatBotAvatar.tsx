'use client';

import LogoLyrium from '@/components/LogoLyrium';

interface Props {
    size?: 'sm' | 'md';
}

export default function ChatBotAvatar({ size = 'sm' }: Props) {
    return (
        <LogoLyrium
            size="sm"
            showText={false}
            frontImg="/img/iconologo.png"
        />
    );
}
