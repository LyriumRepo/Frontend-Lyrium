import Image from 'next/image';

interface TopBannerProps {
  lightSrc?: string;
  darkSrc?: string;
}

export default function TopBanner({
  lightSrc = '/img/BANNER_SUPERIOR.png',
}: TopBannerProps) {
  return (
    <div className="hidden md:block w-full">
      <Image
        src={lightSrc}
        alt="Banner Superior"
        width={1600}
        height={270}
        className="w-full h-auto object-cover min-h-[80px]"
        priority
      />
    </div>
  );
}