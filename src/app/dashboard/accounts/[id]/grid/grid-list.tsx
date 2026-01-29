'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal } from 'lucide-react';
import DeleteButton from '@/app/dashboard/components/delete-button';
import { deleteGridStrategy } from '@/app/lib/actions';
import CloseGridButton from './close-grid-button';
import GridDetailButton from './grid-detail-button';
import { GridStrategy } from '@prisma/client';

export default function GridList({ strategies, accountId }: { strategies: GridStrategy[], accountId: string }) {
    const [filter, setFilter] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredStrategies = useMemo(() => {
        return strategies.filter(grid => grid.status === filter);
    }, [strategies, filter]);

    const totalPages = Math.ceil(filteredStrategies.length / itemsPerPage);

    const paginatedStrategies = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStrategies.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStrategies, currentPage, itemsPerPage]);

    const totalAllocatedCapital = useMemo(() => {
        return strategies
            .filter(g => g.status === 'ACTIVE')
            .reduce((sum, g) => sum + g.allocatedCapital, 0);
    }, [strategies]);

    const totalRealizedPnL = useMemo(() => {
        return strategies
            .filter(g => g.status === 'CLOSED')
            .reduce((sum, g) => sum + (g.totalProfit ?? 0), 0);
    }, [strategies]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleFilterChange = (newFilter: 'ACTIVE' | 'CLOSED') => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    if (strategies.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500 shadow-sm">
                No grid strategies found. Create one to start automating.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allocated Capital</span>
                        <span className="text-lg font-bold text-foreground">${totalAllocatedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                        onClick={() => handleFilterChange('ACTIVE')}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filter === 'ACTIVE' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Active
                    </button>
                    <button
                        onClick={() => handleFilterChange('CLOSED')}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filter === 'CLOSED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        History
                    </button>
                </div>
            </div>

            {filteredStrategies.length === 0 ? (
                <div className="premium-card overflow-hidden !p-12 text-center">
                    <p className="text-muted-foreground">No {filter === 'ACTIVE' ? 'active' : 'historical'} grid strategies found.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {paginatedStrategies.map((grid) => (
                            <div key={grid.id} className="premium-card group relative flex flex-col justify-between overflow-hidden">
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                <span className="text-sm font-bold">{grid.symbol}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground ring-1 ring-inset ring-border">
                                                    {grid.type}
                                                </span>
                                                {grid.type === 'FUTURES' && grid.direction && (
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${grid.direction === 'LONG' ? 'bg-green-500/10 text-green-600 ring-green-600/20' :
                                                        grid.direction === 'SHORT' ? 'bg-red-500/10 text-red-600 ring-red-600/20' :
                                                            'bg-blue-500/10 text-blue-600 ring-blue-600/20'
                                                        }`}>
                                                        {grid.direction}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-inset ${grid.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 ring-green-600/20' :
                                            grid.status === 'CLOSED' ? 'bg-muted text-muted-foreground ring-border' :
                                                'bg-yellow-500/10 text-yellow-600 ring-yellow-600/20'
                                            }`}>
                                            {grid.status}
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Price Range</p>
                                            <p className="text-sm font-bold text-foreground">${grid.lowerPrice} - ${grid.upperPrice}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Grids / Invested</p>
                                            <p className="text-sm font-bold text-foreground">{grid.gridCount} / ${grid.allocatedCapital}</p>
                                        </div>
                                    </div>

                                    {grid.type === 'FUTURES' && (() => {
                                        const investmentAfterLeverage = grid.investmentAfterLeverage || (grid.allocatedCapital * (grid.leverage || 1));

                                        // Use stored maintenance margin or calculate fallback
                                        const maintenanceMargin = grid.maintenanceMargin ?? (investmentAfterLeverage * 0.005);

                                        const liqPrice = grid.liquidationPrice ?? (() => {
                                            // Use geometric mean for average entry price as per plan.md
                                            const avgPrice = Math.sqrt(grid.lowerPrice * grid.upperPrice);
                                            const maintenanceMarginRate = grid.maintenanceMarginRate ?? 0.005;

                                            if (grid.direction === 'LONG') {
                                                // P_liq_long = P_avg × (1 - 1/Leverage + MaintenanceMarginRate)
                                                return avgPrice * (1 - (1 / (grid.leverage || 1)) + maintenanceMarginRate);
                                            } else if (grid.direction === 'SHORT') {
                                                // P_liq_short = P_avg × (1 + 1/Leverage - MaintenanceMarginRate)
                                                return avgPrice * (1 + (1 / (grid.leverage || 1)) - maintenanceMarginRate);
                                            }
                                            return null;
                                        })();

                                        return (
                                            <div className="mt-4 space-y-3">
                                                <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/30 p-3">
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Entry / Lev</p>
                                                        <p className="text-xs font-semibold text-foreground">${grid.entryPrice || '-'} / {grid.leverage || 1}x</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Inv. After Lev</p>
                                                        <p className="text-xs font-semibold text-foreground">${investmentAfterLeverage.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Maint. Margin</p>
                                                        <p className="text-xs font-semibold text-foreground">${maintenanceMargin.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3">
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Est. Liq. Price</p>
                                                        <p className="text-xs font-semibold text-red-600">${liqPrice?.toLocaleString() || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dist. to Liq</p>
                                                        <p className="text-xs font-semibold text-foreground">
                                                            {grid.entryPrice && liqPrice ? (
                                                                grid.direction === 'LONG' ? `-${(((liqPrice - grid.entryPrice) / grid.entryPrice) * 100).toFixed(2)}%` :
                                                                    grid.direction === 'SHORT' ? `+${(((liqPrice - grid.entryPrice) / grid.entryPrice) * 100).toFixed(2)}%` :
                                                                        '-'
                                                            ) : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex items-end justify-between border-t pt-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Profit & Loss</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-md font-black tabular-nums ${(grid.gridProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {grid.status === 'CLOSED' && (
                                                        (grid.gridProfit ?? 0) >= 0 ? `+$${grid.gridProfit ?? 0}` : `-$${Math.abs(grid.gridProfit ?? 0)}`
                                                    )}
                                                </span>
                                                {grid.status === 'CLOSED' && (
                                                    <span className={`text-xs font-bold ${(grid.totalProfit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        (Tot: ${grid.totalProfit ?? 0})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <GridDetailButton
                                            grid={grid}
                                        >
                                            <div className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                                                Details
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </GridDetailButton>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground">Created {new Date(grid.createdAt).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            {grid.status === 'ACTIVE' && (
                                                <CloseGridButton
                                                    accountId={accountId}
                                                    strategyId={grid.id}
                                                    symbol={grid.symbol}
                                                />
                                            )}
                                            <DeleteButton
                                                onDelete={deleteGridStrategy.bind(null, grid.id, accountId)}
                                                itemType="Strategy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4 border-t">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-lg border text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${currentPage === page
                                        ? 'bg-foreground text-white'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-lg border text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
