'use client';

import React, { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, Target, Clock, TrendingUp, TrendingDown, Settings2, Trash2, MoreHorizontal, X, Info, History } from 'lucide-react';
import DeleteButton from '@/app/dashboard/components/delete-button';
import { deleteSpotHolding } from '@/app/lib/actions';
import CloseHoldingForm from './close-holding-form';

import { Holding } from '@/app/lib/types';

interface GroupedHolding {
    symbol: string;
    totalQuantity: number;
    totalCost: number;
    avgPrice: number;
    targetPrice: number | null;
    transactions: Holding[];
}

export default function HoldingsTable({
    holdings,
    accountId
}: {
    holdings: Holding[],
    accountId: string
}) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [closingHolding, setClosingHolding] = useState<Holding | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    // Filtering & Grouping Logic
    const filteredHoldings = holdings.filter(h => showHistory ? true : h.status !== 'SOLD');

    const grouped = filteredHoldings.reduce((acc, h) => {
        if (!acc[h.assetSymbol]) {
            acc[h.assetSymbol] = {
                symbol: h.assetSymbol,
                totalQuantity: 0,
                totalCost: 0,
                avgPrice: 0,
                targetPrice: h.targetPrice,
                transactions: []
            };
        }
        // Only count quantity and cost for active (non-SOLD) holdings if not in history mode
        // Or actually, if we are in history mode, maybe we still want to see the total realized PnL?
        // Let's keep aggregation simple: only aggregate what's currently filtered.
        acc[h.assetSymbol].totalQuantity += h.quantity;
        acc[h.assetSymbol].totalCost += (h.quantity * h.avgEntryPrice);
        acc[h.assetSymbol].transactions.push(h);
        acc[h.assetSymbol].avgPrice = acc[h.assetSymbol].totalCost / acc[h.assetSymbol].totalQuantity;
        return acc;
    }, {} as Record<string, GroupedHolding>);

    const groups = Object.values(grouped);

    // Calculate Global Stats
    const totalActiveValue = holdings
        .filter(h => h.status !== 'SOLD')
        .reduce((sum, h) => sum + (h.quantity * h.avgEntryPrice), 0);

    const totalRealizedPnL = holdings
        .filter(h => h.status === 'SOLD' && h.exitPrice)
        .reduce((sum, h) => sum + ((h.exitPrice! - h.avgEntryPrice) * h.quantity), 0);

    const toggleGroup = (symbol: string) => {
        const next = new Set(expandedGroups);
        if (next.has(symbol)) {
            next.delete(symbol);
        } else {
            next.add(symbol);
        }
        setExpandedGroups(next);
    };

    return (
        <div className="space-y-4">
            {/* Table Header / Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Portfolio Value</span>
                        <span className="text-lg font-bold text-foreground">${totalActiveValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {totalRealizedPnL !== 0 && (
                        <div className="flex flex-col border-l border-border pl-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Realized PnL</span>
                            <span className={`text-lg font-bold ${totalRealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1 border border-border">
                    <button
                        onClick={() => setShowHistory(false)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${!showHistory ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Active
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${showHistory ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        History
                    </button>
                </div>
            </div>

            <div className="premium-card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="w-10 px-4 py-4"></th>
                                <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-[10px]">Asset</th>
                                <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-[10px]">Total QTY</th>
                                <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-[10px]">Avg Price</th>
                                <th className="px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-[10px] text-right">Value (Est)</th>
                                <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {groups.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Info className="h-8 w-8 opacity-20" />
                                            <p>No {showHistory ? 'history' : 'active positions'} found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : groups.map((group) => (
                                <React.Fragment key={group.symbol}>
                                    {/* Summary Row */}
                                    <tr className="group transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleGroup(group.symbol)}
                                                className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                                            >
                                                {expandedGroups.has(group.symbol) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                                                    {group.symbol.slice(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{group.symbol}</span>
                                                    <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-tight">
                                                        {group.transactions.length} Transactions
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground tabular-nums font-medium">
                                            {group.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground tabular-nums font-medium">
                                            ${group.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-foreground tabular-nums">
                                            ${group.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleGroup(group.symbol)}
                                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                                View Ledger
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Detail Rows */}
                                    {expandedGroups.has(group.symbol) && (
                                        <>
                                            <tr className="bg-muted/30 border-t border-border/50">
                                                <th className="px-4 py-2"></th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Transaction Ledger</th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Qty</th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Entry Price</th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Exit Price</th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold text-right">Value / PnL</th>
                                                <th className="px-6 py-2 text-[9px] uppercase tracking-widest text-muted-foreground font-bold text-right text-foreground">Operations</th>
                                            </tr>
                                            {group.transactions.map((tx) => (
                                                <tr key={tx.id} className="bg-muted/10 border-l-4 border-primary/30">
                                                    <td className="px-4 py-3"></td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{tx.id.slice(-6)}</span>
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight ${tx.status === 'HODLING' ? 'bg-blue-500/10 text-blue-500' :
                                                                tx.status === 'STAKED' ? 'bg-purple-500/10 text-purple-500' :
                                                                    tx.status === 'SOLD' ? 'bg-green-500/10 text-green-500' :
                                                                        'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {tx.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-xs tabular-nums text-muted-foreground font-medium">
                                                        {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                                    </td>
                                                    <td className="px-6 py-3 text-xs tabular-nums text-muted-foreground font-medium">
                                                        ${tx.avgEntryPrice.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-3 text-xs tabular-nums text-muted-foreground font-medium">
                                                        {tx.exitPrice ? `$${tx.exitPrice.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-xs tabular-nums font-bold">
                                                        <div className="flex flex-col items-end">
                                                            <span className={tx.status === 'SOLD' ? 'line-through text-muted-foreground/50' : ''}>
                                                                ${(tx.quantity * tx.avgEntryPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                            {tx.exitPrice && (
                                                                <span className={`text-[10px] ${(tx.exitPrice - tx.avgEntryPrice) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {(tx.exitPrice - tx.avgEntryPrice) >= 0 ? '+' : ''}${((tx.exitPrice - tx.avgEntryPrice) * tx.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                                                        {tx.status !== 'SOLD' && (
                                                            <button
                                                                onClick={() => setClosingHolding(tx)}
                                                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20"
                                                            >
                                                                <TrendingUp className="h-3 w-3" />
                                                                Close Pos
                                                            </button>
                                                        )}
                                                        <DeleteButton
                                                            onDelete={deleteSpotHolding.bind(null, tx.id, accountId)}
                                                            itemType="Entry"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {closingHolding && (
                <CloseHoldingForm
                    holdingId={closingHolding.id}
                    accountId={accountId}
                    assetSymbol={closingHolding.assetSymbol}
                    maxQuantity={closingHolding.quantity}
                    close={() => setClosingHolding(null)}
                />
            )}
        </div>
    );
}
