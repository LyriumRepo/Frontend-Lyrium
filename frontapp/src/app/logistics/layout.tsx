import { LogisticsLayoutClient } from './LogisticsLayoutClient';

export default function LogisticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LogisticsLayoutClient>{children}</LogisticsLayoutClient>;
}
