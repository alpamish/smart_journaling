'use client';

import { useActionState, useEffect } from 'react';
import { closeGridStrategy } from '@/app/lib/actions';

export default function CloseGridForm({
    accountId,
    strategyId,
    symbol,
    close
}: {
    accountId: string,
    strategyId: string,
    symbol: string,
    close: () => void
}) {
    const closeGridWithIds = closeGridStrategy.bind(null, strategyId, accountId);
    const [state, formAction, isPending] = useActionState(closeGridWithIds, null);

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white p-10 shadow-2xl ring-2 ring-white/20 border border-white/10 transform transition-all duration-500 hover:scale-105">
                {/* Header with enhanced styling */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Close Grid Strategy: <span className="text-red-600">{symbol}</span>
                        </h2>
                    </div>
                    <button
                        onClick={close}
                        className="text-gray-500 hover:text-red-500 transition-all duration-200 transform hover:scale-110 p-2 rounded-full hover:bg-red-50"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form action={formAction} className="space-y-8 text-left text-slate-500">
                    {/* Exit Price Field */}
                    <div className="group">
                        <label htmlFor="exitPrice" className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-red-600 transition-colors">
                            Exit Price
                        </label>
                        <div className="relative">
                            <input
                                id="exitPrice"
                                type="number"
                                name="exitPrice"
                                step="any"
                                required
                                className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-4 shadow-lg focus:border-red-500 focus:ring-4 focus:ring-red-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 text-lg"
                                placeholder="e.g., 45000.00"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-sm">USD</span>
                            </div>
                        </div>
                    </div>

                    {/* Grid and Total Profit Fields */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="group">
                            <label htmlFor="gridProfit" className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-green-600 transition-colors">
                                Grid Profit
                            </label>
                            <div className="relative">
                                <input
                                    id="gridProfit"
                                    type="number"
                                    name="gridProfit"
                                    step="any"
                                    required
                                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-4 shadow-lg focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 text-lg"
                                    placeholder="e.g., 1250.50"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-green-500 text-sm font-medium">$</span>
                                </div>
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="totalProfit" className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-blue-600 transition-colors">
                                Total Profit
                            </label>
                            <div className="relative">
                                <input
                                    id="totalProfit"
                                    type="number"
                                    name="totalProfit"
                                    step="any"
                                    required
                                    className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-4 shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 text-lg"
                                    placeholder="e.g., 3200.75"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-blue-500 text-sm font-medium">$</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Closing Note Field */}
                    <div className="group">
                        <label htmlFor="closeNote" className="block text-sm font-semibold text-gray-800 mb-2 group-focus-within:text-purple-600 transition-colors">
                            Closing Note <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="closeNote"
                            name="closeNote"
                            rows={5}
                            className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-5 py-4 shadow-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-400 text-lg resize-none"
                            placeholder="Share your insights: market conditions, lessons learned, or reasons for closing..."
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-xl border-2 border-gray-300 px-8 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 text-sm font-semibold text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Closing Strategy...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Close Grid
                                </>
                            )}
                        </button>
                    </div>
                    {state?.error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in slide-in-from-top duration-300">
                            {state.error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}