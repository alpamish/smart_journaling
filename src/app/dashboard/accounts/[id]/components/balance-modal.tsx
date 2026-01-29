'use client';

import { useState, useActionState } from 'react';
import { depositToAccount, withdrawFromAccount } from '@/app/lib/actions';

interface BalanceModalProps {
    accountId: string;
    currentBalance: number;
    currency: string;
    type: 'deposit' | 'withdraw';
    onClose: () => void;
}

export default function BalanceModal({ accountId, currentBalance, currency, type, onClose }: BalanceModalProps) {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    const action = type === 'deposit'
        ? depositToAccount.bind(null, accountId)
        : withdrawFromAccount.bind(null, accountId);

    const [state, formAction] = useActionState(action, undefined);

    const handleSubmit = async (formData: FormData) => {
        await formAction(formData);
        if (!state?.error) {
            onClose();
        }
    };

    const isDeposit = type === 'deposit';
    const title = isDeposit ? 'Deposit Funds' : 'Withdraw Funds';
    const icon = isDeposit ? '💰' : '🏦';
    const gradientClass = isDeposit
        ? 'from-emerald-500 to-green-500'
        : 'from-blue-500 to-indigo-500';
    const buttonClass = isDeposit
        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
        : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md animate-scale-in">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-3xl blur-2xl opacity-30`}></div>

                {/* Modal Content */}
                <div className="relative bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className={`bg-gradient-to-br ${gradientClass} p-6`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                                    {icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                                    <p className="text-sm text-white/80">Update your account balance</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form action={handleSubmit} className="p-6 space-y-6">
                        {/* Current Balance Info */}
                        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4">
                            <p className="text-sm text-slate-400 mb-1">Current Balance</p>
                            <p className="text-2xl font-bold text-white">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: currency,
                                }).format(currentBalance)}
                            </p>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-semibold text-slate-300 mb-2">
                                Amount ({currency})
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 text-lg font-semibold">$</span>
                                </div>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    max={!isDeposit ? currentBalance : undefined}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            {!isDeposit && (
                                <p className="mt-2 text-xs text-slate-400">
                                    Maximum: {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: currency,
                                    }).format(currentBalance)}
                                </p>
                            )}
                        </div>

                        {/* Note Input */}
                        <div>
                            <label htmlFor="note" className="block text-sm font-semibold text-slate-300 mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                id="note"
                                name="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                                placeholder="Add a note about this transaction..."
                            />
                        </div>

                        {/* Error Message */}
                        {state?.error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <p className="text-sm text-red-400 font-medium">{state.error}</p>
                            </div>
                        )}

                        {/* New Balance Preview */}
                        {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                            <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-4">
                                <p className="text-sm text-slate-400 mb-1">New Balance</p>
                                <p className="text-2xl font-bold text-white">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: currency,
                                    }).format(
                                        isDeposit
                                            ? currentBalance + parseFloat(amount)
                                            : currentBalance - parseFloat(amount)
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 px-6 py-3 ${buttonClass} text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
                            >
                                {isDeposit ? 'Deposit' : 'Withdraw'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
