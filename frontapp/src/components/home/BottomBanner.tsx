import Image from 'next/image';

export default function BottomBanner() {
    return (
        <div className="hidden md:block w-full">
            <Image
                src="/img/BANNER_INFERIOR.png"
                alt="Banner Inferior"
                width={1600}
                height={270}
                className="w-full h-auto object-cover min-h-[80px]"
            />
        </div>
    );
}
