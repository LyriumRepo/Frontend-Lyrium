import { SellerLayoutClient } from './SellerLayoutClient';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SellerLayoutClient>{children}</SellerLayoutClient>;
}
