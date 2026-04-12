import Link from 'next/link';

interface LogoProps {
    variant?: 'default' | 'compact';
    className?: string;
}

export default function Logo({ variant = 'default', className = '' }: LogoProps) {
    return (
        <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-xl ${className}`}
        >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">M</span>
            </div>
            {variant === 'default' && (
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lyrium Marketplace
                </span>
            )}
        </Link>
    );
}
