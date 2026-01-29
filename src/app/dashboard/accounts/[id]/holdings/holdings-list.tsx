'use client';

import { Holding } from '@/app/lib/types';
import { Coins } from 'lucide-react';
import HoldingsTable from './holdings-table';

export default function HoldingsList({ accountId, holdings }: { accountId: string, holdings: Holding[] }) {
    if (holdings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                    <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No assets found</h3>
                <p className="max-w-[200px] text-sm text-muted-foreground mt-1">
                    Your portfolio is empty. Add assets to start tracking.
                </p>
            </div>
        );
    }

    return <HoldingsTable holdings={holdings} accountId={accountId} />;
}

