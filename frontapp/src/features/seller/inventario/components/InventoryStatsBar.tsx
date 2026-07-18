import { InventoryStats } from '../types';
import BaseStatCard from '@/components/ui/BaseStatCard';

const CARDS: { key: keyof InventoryStats; label: string; icon: string; color: string }[] = [
    { key: 'total',    label: 'Total',       icon: 'Package',   color: 'lima' },
    { key: 'ok',       label: 'Disponibles', icon: 'Check',     color: 'verde' },
    { key: 'low',      label: 'Stock bajo',  icon: 'AlertTriangle', color: 'turquesaClaro' },
    { key: 'critical', label: 'Críticos',    icon: 'AlertCircle', color: 'turquesa' },
    { key: 'out',      label: 'Agotados',    icon: 'XCircle',   color: 'turquesa' },
];

export function InventoryStatsBar({ stats }: { stats: InventoryStats }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 [&>*]:min-w-0">
            {CARDS.map(({ key, label, icon, color }) => (
                <BaseStatCard
                    key={key}
                    label={label}
                    value={stats[key]}
                    icon={icon}
                    color={color}
                    suffix="uds."
                />
            ))}
        </div>
    );
}
