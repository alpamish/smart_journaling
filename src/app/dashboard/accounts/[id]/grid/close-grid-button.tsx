'use client';

import { useState } from 'react';
import CloseGridForm from './close-grid-form';

export default function CloseGridButton({
    accountId,
    strategyId,
    symbol
}: {
    accountId: string,
    strategyId: string,
    symbol: string
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-md font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
                Close Grid
            </button>

            {isOpen && (
                <CloseGridForm
                    accountId={accountId}
                    strategyId={strategyId}
                    symbol={symbol}
                    close={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
