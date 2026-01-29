'use client';

import { useState } from 'react';
import LogTradeForm from './log-trade-form';

export default function LogTradeButton({ accountId, balance }: { accountId: string, balance: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Log Trade
            </button>
            {isOpen && <LogTradeForm accountId={accountId} balance={balance} close={() => setIsOpen(false)} />}
        </>
    );
}
