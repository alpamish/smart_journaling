'use client';

import { useState } from 'react';
import AddHoldingForm from './add-holding-form';

export default function AddHoldingButton({ accountId }: { accountId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground shadow-sm transition-all hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 active:scale-95"
            >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Asset
            </button>
            {isOpen && <AddHoldingForm accountId={accountId} close={() => setIsOpen(false)} />}
        </>
    );
}
