import { SecurityLayoutClient } from './SecurityLayoutClient';

export default function SecurityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SecurityLayoutClient>{children}</SecurityLayoutClient>;
}
