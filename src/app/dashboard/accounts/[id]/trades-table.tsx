'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Tag, Calendar, Timer, Clock } from 'lucide-react';
import TradeDetailButton from './trade-detail-button';
import CloseTradeButton from './close-trade-button';
import { Trade, Image as TradeImage } from '@prisma/client';

type TradeWithImages = Trade & {
    images: TradeImage[];
    parentId?: string | null;
};

export default function TradesTable({ trades }: { trades: TradeWithImages[] }) {
    const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

    // Grouping Logic: Separate parent trades and group their children
    const parentTrades = trades.filter(t => !t.parentId);
    const childTrades = trades.filter(t => t.parentId);

    const toggleTrade = (id: string) => {
        const next = new Set(expandedTrades);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedTrades(next);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/50 border-b-2 border-border">
                    <tr>
                        <th className="w-10 px-4 py-4"></th>
                        <th className="px-6 py-4 font-bold text-foreground uppercase text-xs tracking-wider">Date</th>
                        <th className="px-6 py-4 font-bold text-foreground uppercase text-xs tracking-wider">Symbol</th>
                        <th className="px-6 py-4 font-bold text-foreground text-right uppercase text-xs tracking-wider">Qty</th>
                        <th className="px-6 py-4 font-bold text-foreground uppercase text-xs tracking-wider">Side</th>
                        <th className="px-6 py-4 font-bold text-foreground text-right uppercase text-xs tracking-wider">Entry</th>
                        <th className="px-6 py-4 font-bold text-foreground text-right uppercase text-xs tracking-wider">PnL</th>
                        <th className="px-6 py-4 font-bold text-foreground uppercase text-xs tracking-wider">Status</th>
                        <th className="px-6 py-4 font-bold text-foreground text-right uppercase text-xs tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                    {parentTrades.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-16 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-lg font-medium">No trades logged yet.</p>
                                    <p className="text-sm">Start logging your trades to track your performance</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        parentTrades.map((trade) => {
                            const children = childTrades.filter(c => c.parentId === trade.id);
                            const hasChildren = children.length > 0;
                            const isExpanded = expandedTrades.has(trade.id);

                            const aggregatePnL = (trade.netPnL || 0) + children.reduce((sum, child) => sum + (child.netPnL || 0), 0);
                            const totalInitialQuantity = (trade.quantity || 0) + children.reduce((sum, child) => sum + (child.exitQuantity || 0), 0);

                            return (
                                <React.Fragment key={trade.id}>
                                    <tr className="table-row-hover">
                                        <td className="px-4 py-4 text-center">
                                            {hasChildren && (
                                                <button
                                                    onClick={() => toggleTrade(trade.id)}
                                                    className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                >
                                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground font-medium">
                                            {new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-base">
                                            {trade.symbol}
                                            {hasChildren && (
                                                <div className="text-[10px] font-normal text-muted-foreground uppercase tracking-tighter">
                                                    Group View
                                                </div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground text-sm flex flex-col items-end">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                                {totalInitialQuantity.toLocaleString()}
                                            </span>
                                            {hasChildren && (
                                                <span className="text-[10px] opacity-60">Total</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${trade.side === 'LONG' ? 'bg-green-500/10 text-green-600 ring-green-600/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 ring-red-600/20 dark:text-red-400'
                                                }`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground font-medium">
                                            ${trade.entryPrice.toLocaleString()}
                                        </td>
                                        <td className={`whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums text-base ${aggregatePnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {aggregatePnL >= 0 ? `+$${aggregatePnL.toLocaleString()}` : `-$${Math.abs(aggregatePnL).toLocaleString()}`}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trade.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <TradeDetailButton trade={trade} children={children} />
                                                <CloseTradeButton trade={trade} />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* History Rows */}
                                    {isExpanded && [
                                        ...children.map(c => ({ ...c, label: 'Partial Out' })),
                                        ...(trade.status === 'CLOSED' ? [{ ...trade, id: `final-${trade.id}`, label: 'Final Out', isFinal: true }] : [])
                                    ].sort((a, b) => new Date(b.exitDate || b.createdAt).getTime() - new Date(a.exitDate || a.createdAt).getTime()).map((item) => (
                                        <tr key={item.id} className="bg-muted/20 border-l-4 border-primary/40 text-xs hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3"></td>
                                            <td className="px-6 py-3 text-muted-foreground font-medium">
                                                {new Date(item.exitDate || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-3 font-semibold text-foreground italic flex items-center gap-2">
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Exited</span>
                                                {item.exitQuantity?.toLocaleString()} {trade.symbol}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {/* Display Qty in its own column if desired, or keep as is */}
                                            </td>
                                            <td className="px-6 py-3"></td>
                                            <td className="px-6 py-3 text-right tabular-nums text-muted-foreground font-medium">
                                                @ ${item.exitPrice?.toLocaleString()}
                                            </td>
                                            <td className={`px-6 py-3 text-right font-bold tabular-nums ${(item.netPnL || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {(item.netPnL || 0) >= 0 ? '+' : ''}${item.netPnL?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{item.label}</span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {!('isFinal' in item) ? (
                                                    <TradeDetailButton trade={item as any} />
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">Main Trade</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
