'use client';

import { useState } from 'react';
import BalanceModal from './balance-modal';

interface BalanceButtonsProps {
    accountId: string;
    currentBalance: number;
    currency: string;
}

export default function BalanceButtons({ accountId, currentBalance, currency }: BalanceButtonsProps) {
    const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);

    return (
        <>
            <div className="flex gap-3">
                {/* Deposit Button */}
                <button
                    onClick={() => setModalType('deposit')}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Deposit</span>
                </button>

                {/* Withdraw Button */}
                <button
                    onClick={() => setModalType('withdraw')}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                    <span className="hidden sm:inline">Withdraw</span>
                </button>
            </div>

            {/* Modal */}
            {modalType && (
                <BalanceModal
                    accountId={accountId}
                    currentBalance={currentBalance}
                    currency={currency}
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}
        </>
    );
}
