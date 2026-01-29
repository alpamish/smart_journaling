'use client';

import { X, Grid, DollarSign, Activity, Calendar, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { GridStrategy } from '@prisma/client';

export default function GridDetailModal({
    grid,
    onClose
}: {
    grid: GridStrategy,
    onClose: () => void
}) {
    const isWinning = (grid.gridProfit ?? 0) >= 0;
    const totalPnL = (grid.totalProfit ?? 0) + (grid.gridProfit ?? 0);
    const isActive = grid.status === 'ACTIVE';
    const isFutures = grid.type === 'FUTURES';

    const stepValue = grid.upperPrice > grid.lowerPrice
        ? (grid.upperPrice - grid.lowerPrice) / grid.gridCount
        : 0;

    const gridSpacing = stepValue < 0.1 ? stepValue.toFixed(4) : stepValue.toFixed(2);

    const investmentAfterLeverage = grid.investmentAfterLeverage ?? (isFutures ? grid.allocatedCapital * (grid.leverage || 1) : grid.allocatedCapital);

    const estimatedLiqPrice = grid.liquidationPrice ?? (() => {
        if (!isFutures || !grid.leverage) return null;
        // Use geometric mean for average entry price as per plan.md
        const avgPrice = Math.sqrt(grid.lowerPrice * grid.upperPrice);
        const maintenanceMarginRate = grid.maintenanceMarginRate ?? 0.005;

        if (grid.direction === 'LONG') {
            // P_liq_long = P_avg × (1 - 1/Leverage + MaintenanceMarginRate)
            return avgPrice * (1 - (1 / grid.leverage) + maintenanceMarginRate);
        } else if (grid.direction === 'SHORT') {
            // P_liq_short = P_avg × (1 + 1/Leverage - MaintenanceMarginRate)
            return avgPrice * (1 + (1 / grid.leverage) - maintenanceMarginRate);
        }
        return null;
    })();

    const distanceToLiq = grid.entryPrice && estimatedLiqPrice
        ? (grid.direction === 'LONG'
            ? -(((estimatedLiqPrice - grid.entryPrice) / grid.entryPrice) * 100)
            : grid.direction === 'SHORT'
                ? (((estimatedLiqPrice - grid.entryPrice) / grid.entryPrice) * 100)
                : 0)
        : null;

    const maintenanceMarginRate = grid.maintenanceMarginRate ?? 0.005;

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{grid.symbol}</h2>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isFutures
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                    }`}>
                                    {grid.type}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                    }`}>
                                    {grid.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Created on {new Date(grid.createdAt).toLocaleDateString()} at {new Date(grid.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
                        {/* Performance Summary */}
                        {grid.status === 'CLOSED' && (
                            <div className={`p-6 rounded-2xl border flex items-center justify-between ${isWinning
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'
                                }`}>
                                <div className="space-y-3">
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${isWinning ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            Grid Profit
                                        </span>
                                        <div className={`text-3xl font-mono font-bold mt-1 ${isWinning ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                            {(grid.gridProfit ?? 0) >= 0 ? '+' : ''}{(grid.gridProfit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="text-sm ml-1 font-normal opacity-70">USD</span>
                                        </div>
                                    </div>
                                    {(grid.totalProfit ?? 0) !== (grid.gridProfit ?? 0) && (
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                                Total Profit
                                            </span>
                                            <div className="text-xl font-mono font-bold mt-1 text-slate-900 dark:text-white">
                                                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                <span className="text-sm ml-1 font-normal opacity-70">USD</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right space-y-1">
                                    <div className={`flex items-center gap-2 text-xl font-bold ${isWinning ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {isWinning ? <TrendingUp /> : <AlertTriangle />}
                                        {grid.allocatedCapital > 0 ? ((totalPnL / grid.allocatedCapital) * 100).toFixed(2) : '0.00'}%
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-tighter">ROI on Capital</p>
                                </div>
                            </div>
                        )}

                        {/* Grid Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <Grid className="w-4 h-4" />
                                    </div>
                                    Grid Configuration
                                </div>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Price Range</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                            ${grid.lowerPrice.toLocaleString()} - ${grid.upperPrice.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Grid Spacing</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">${gridSpacing}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Yield: {((stepValue / grid.upperPrice) * 100).toFixed(2)}% - {((stepValue / grid.lowerPrice) * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Number of Grids</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{grid.gridCount}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Allocated Capital</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                            ${grid.allocatedCapital.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Investment per Grid</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                            ${(grid.allocatedCapital / grid.gridCount).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    Capital & Entry
                                </div>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Entry Price</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                            ${grid.entryPrice?.toLocaleString() || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Direction</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {grid.direction}
                                        </p>
                                    </div>
                                    {isFutures && (
                                        <>
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Leverage</span>
                                                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                                    {grid.leverage}x
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Margin Mode</span>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {grid.marginMode || '-'}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Inv. After Leverage</span>
                                                <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                                                    ${investmentAfterLeverage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Futures Risk Details */}
                        {isFutures && (
                            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                                    <AlertTriangle className="w-4 h-4 text-purple-600" />
                                    Futures Risk Management
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Liquidation Price</span>
                                        <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                                            {estimatedLiqPrice ? `$${estimatedLiqPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not Set'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Distance to Liq</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {distanceToLiq !== null ? `${distanceToLiq >= 0 ? '+' : ''}${distanceToLiq.toFixed(2)}%` : '-'}
                                        </p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Maintenance Margin Rate</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {(maintenanceMarginRate * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Financial Summary */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                                <Activity className="w-4 h-4" />
                                Financial Summary
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Grid Profit</span>
                                    <p className={`text-sm font-mono font-bold ${(grid.gridProfit ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ${(grid.gridProfit ?? 0).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Realized PnL</span>
                                    <p className={`text-sm font-mono font-bold ${grid.realizedPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        ${grid.realizedPnL.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Fees</span>
                                    <p className="text-sm font-mono font-bold text-rose-600">
                                        -${grid.fees.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Exit Price</span>
                                    <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {grid.exitPrice ? `$${grid.exitPrice.toLocaleString()}` : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Close Note */}
                        {grid.closeNote && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">
                                    <Info className="w-3.5 h-3.5" />
                                    Close Note
                                </div>
                                <div className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    &ldquo;{grid.closeNote}&rdquo;
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                                <Calendar className="w-3.5 h-3.5" />
                                Timestamps
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Created At</span>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                        {new Date(grid.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Last Updated</span>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                        {new Date(grid.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            Close Detail View
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
