'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Search, Filter, ArrowUpDown } from 'lucide-react';
import TradeDetailButton from './trade-detail-button';
import CloseTradeButton from './close-trade-button';
import { Trade, Image as TradeImage } from '@prisma/client';

type TradeWithImages = Trade & {
    images: TradeImage[];
    parentId?: string | null;
};

interface OptimizedTradesTableProps {
    trades: TradeWithImages[];
    itemsPerPage?: number;
}

type SortField = 'date' | 'symbol' | 'quantity' | 'entryPrice' | 'netPnL' | 'status';
type SortDirection = 'asc' | 'desc';

export default function OptimizedTradesTable({ trades, itemsPerPage = 25 }: OptimizedTradesTableProps) {
    const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Memoized filtering and sorting logic
    const filteredAndSortedTrades = useMemo(() => {
        let filtered = trades;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(trade =>
                trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trade.side.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(trade => trade.status === statusFilter);
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'date':
                    aValue = new Date(a.entryDate);
                    bValue = new Date(b.entryDate);
                    break;
                case 'symbol':
                    aValue = a.symbol;
                    bValue = b.symbol;
                    break;
                case 'quantity':
                    aValue = a.quantity;
                    bValue = b.quantity;
                    break;
                case 'entryPrice':
                    aValue = a.entryPrice;
                    bValue = b.entryPrice;
                    break;
                case 'netPnL':
                    aValue = a.netPnL || 0;
                    bValue = b.netPnL || 0;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.entryDate;
                    bValue = b.entryDate;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [trades, searchTerm, statusFilter, sortField, sortDirection]);

    // Memoized parent/child grouping
    const { parentTrades, childTrades } = useMemo(() => {
        const parents = filteredAndSortedTrades.filter(t => !t.parentId);
        const children = filteredAndSortedTrades.filter(t => t.parentId);
        return { parentTrades: parents, childTrades: children };
    }, [filteredAndSortedTrades]);

    // Pagination logic
    const paginatedTrades = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return parentTrades.slice(startIndex, endIndex);
    }, [parentTrades, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(parentTrades.length / itemsPerPage);

    // Optimized toggle function
    const toggleTrade = useCallback((id: string) => {
        setExpandedTrades(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Sort handling
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    }, [sortField]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-2 px-4">
                <div className="relative flex-1 max-w-md ">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search trades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background rounded-md focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-background rounded-md focus:outline-none focus:border-primary transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground px-6">
                Showing {paginatedTrades.length} of {parentTrades.length} trades
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="w-10 px-4 py-4"></th>
                            <th className="px-6 py-4 font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-2">
                                    Date
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('symbol')}>
                                <div className="flex items-center gap-2">
                                    Symbol
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('quantity')}>
                                <div className="flex items-center gap-2 justify-end">
                                    Qty
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground">Side</th>
                            <th className="px-6 py-4 font-semibold text-foreground text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('entryPrice')}>
                                <div className="flex items-center gap-2 justify-end">
                                    Entry
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground text-right cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('netPnL')}>
                                <div className="flex items-center gap-2 justify-end">
                                    PnL
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-2">
                                    Status
                                    <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 font-semibold text-foreground text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                        {paginatedTrades.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all' ? 'No trades match your filters.' : 'No trades logged yet.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedTrades.map((trade) => {
                                const children = childTrades.filter(c => c.parentId === trade.id);
                                const hasChildren = children.length > 0;
                                const isExpanded = expandedTrades.has(trade.id);

                                // Calculate unified stats for the parent row (Parent + Children)
                                const totalQuantity = trade.quantity + children.reduce((sum, c) => sum + (c.exitQuantity || 0), 0);
                                const aggregatePnL = (trade.netPnL || 0) + children.reduce((sum, c) => sum + (c.netPnL || 0), 0);

                                return (
                                    <React.Fragment key={trade.id}>
                                        <tr className="group transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-4 text-center">
                                                {hasChildren && (
                                                    <button
                                                        onClick={() => toggleTrade(trade.id)}
                                                        className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                                                    >
                                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                                                {new Date(trade.entryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">
                                                {trade.symbol}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground text-xs uppercase">
                                                {totalQuantity.toLocaleString()} Units
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${trade.side === 'LONG' ? 'bg-green-500/10 text-green-600 ring-green-600/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 ring-red-600/20 dark:text-red-400'
                                                    }`}>
                                                    {trade.side}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-muted-foreground">
                                                ${trade.entryPrice.toLocaleString()}
                                            </td>
                                            <td className={`whitespace-nowrap px-6 py-4 text-right font-bold tabular-nums ${aggregatePnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {aggregatePnL >= 0 ? `+$${aggregatePnL.toLocaleString()}` : `-$${Math.abs(aggregatePnL).toLocaleString()}`}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${trade.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
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

                                        {/* Child trades */}
                                        {isExpanded && children.map((child) => (
                                            <tr key={child.id} className="bg-muted/10 border-l-4 border-primary/30 text-xs">
                                                <td className="px-4 py-3"></td>
                                                <td className="px-6 py-3 text-muted-foreground">
                                                    {new Date(child.exitDate || child.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-foreground italic flex items-center gap-2">
                                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">Exited</span>
                                                    {child.exitQuantity?.toLocaleString()} {trade.symbol}
                                                </td>
                                                <td className="px-6 py-3"></td>
                                                <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                                                    @ ${child.exitPrice?.toLocaleString()}
                                                </td>
                                                <td className={`px-6 py-3 text-right font-bold tabular-nums ${(child.netPnL || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {(child.netPnL || 0) >= 0 ? '+' : ''}${child.netPnL?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-medium">Partial Out</span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <TradeDetailButton trade={child} />
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}