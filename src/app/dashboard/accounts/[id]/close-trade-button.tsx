'use client';

import { useState } from 'react';
import CloseTradeForm from './close-trade-form';

export default function CloseTradeButton({ trade }: { trade: any }) {
    const [isOpen, setIsOpen] = useState(false);

    if (trade.status === 'CLOSED') {
        return <span className="text-gray-500 text-sm">Closed</span>;
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
            >
                Close
            </button>

            {isOpen && (
                <CloseTradeForm
                    tradeId={trade.id}
                    accountId={trade.accountId}
                    symbol={trade.symbol}
                    side={trade.side}
                    quantity={trade.quantity}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
