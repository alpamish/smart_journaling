'use client';

import { useState } from 'react';
import CreateGridForm from './create-grid-form';
import { Account } from '@prisma/client';

export default function CreateGridButton({ accountId, account }: { accountId: string, account: Account }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
            >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Strategy
            </button>
            {isOpen && <CreateGridForm accountId={accountId} balance={account.currentBalance} close={() => setIsOpen(false)} />}
        </>
    );
}
