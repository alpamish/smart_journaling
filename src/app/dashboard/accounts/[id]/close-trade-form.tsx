'use client';

import { useState, useEffect } from 'react';
import { closeTrade, getTradeConditions } from '@/app/lib/actions';
import { X } from 'lucide-react';
import './log-trade-form.css';

export default function CloseTradeForm({
    tradeId,
    accountId,
    symbol,
    side,
    quantity,
    onClose
}: {
    tradeId: string,
    accountId: string,
    symbol: string,
    side: string,
    quantity: number,
    onClose: () => void
}) {
    const [error, setError] = useState('');
    const [exitConditions, setExitConditions] = useState<{ id: string, name: string }[]>([]);

    const DEFAULT_EXIT_REASONS = ['Target Hit', 'Stop Loss Hit', 'Manual Exit', 'Trailing Stop'];

    useEffect(() => {
        const fetchConditions = async () => {
            const exit = await getTradeConditions('EXIT');
            setExitConditions(exit);
        };
        fetchConditions();
    }, []);

    async function handleSubmit(formData: FormData) {
        const result = await closeTrade(tradeId, accountId, null, formData);
        if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-3xl bg-[#0B0F1A] p-8 shadow-2xl border border-white/[0.08] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-rose-500/5 pointer-events-none" />

                <div className="relative z-10">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${side === 'LONG' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                    {side}
                                </span>
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">{symbol}</h2>
                            </div>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">Finalize your exit to realize PnL.</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Price</label>
                                <input
                                    name="exitPrice"
                                    type="number"
                                    step="any"
                                    required
                                    placeholder="0.00"
                                    className="form-input font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Quantity</label>
                                <input
                                    name="exitQuantity"
                                    type="number"
                                    step="any"
                                    required
                                    defaultValue={quantity}
                                    placeholder="0.00"
                                    className="form-input font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Date / Time</label>
                            <input
                                type="datetime-local"
                                name="exitDate"
                                defaultValue={new Date().toISOString().slice(0, 16)}
                                className="form-input text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Condition</label>
                            <select
                                name="exitCondition"
                                required
                                className="form-select w-full"
                            >
                                <option value="">Select reason...</option>
                                {exitConditions.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                                {DEFAULT_EXIT_REASONS.filter(reason => !exitConditions.some(c => c.name === reason)).map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center animate-in shake-in-1">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                Close Trade
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
