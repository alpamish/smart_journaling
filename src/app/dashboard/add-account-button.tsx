'use client';

import { useState } from 'react';
import CreateAccountForm from './create-account-form';
import { Plus } from 'lucide-react';

export default function AddAccountButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative h-full min-h-[280px] w-full rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-blue-500/50 transition-all duration-500 overflow-hidden"
            >
                {/* Animated Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500 transition-all duration-300 shadow-sm">
                            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                    <span className="text-lg font-bold text-foreground transition-colors mb-1">Add Account</span>
                    <span className="text-xs text-muted-foreground transition-colors">Start tracking a new portfolio</span>
                </div>
            </button>
            {isOpen && <CreateAccountForm close={() => setIsOpen(false)} />}
        </>
    );
}
