'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useInventory } from '../hooks/useInventory';

interface InventoryAlertsContextValue {
    alertCount: number;
}

const InventoryAlertsContext = createContext<InventoryAlertsContextValue>({ alertCount: 0 });

export function InventoryAlertsProvider({ children }: { children: ReactNode }) {
    const { alerts } = useInventory();
    return (
        <InventoryAlertsContext.Provider value={{ alertCount: alerts.length }}>
            {children}
        </InventoryAlertsContext.Provider>
    );
}

export const useInventoryAlerts = () => useContext(InventoryAlertsContext);