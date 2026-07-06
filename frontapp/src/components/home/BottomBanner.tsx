import Image from 'next/image';

export default function BottomBanner() {
    return (
        <div className="block w-full overflow-hidden">
            <Image
                src="/img/BANNER_INFERIOR.png"
                alt="Banner Inferior"
                width={1600}
                height={270}
                className="w-full h-auto object-cover aspect-[17/5] md:aspect-auto md:min-h-[80px]"
            />
        </div>
    );
}
