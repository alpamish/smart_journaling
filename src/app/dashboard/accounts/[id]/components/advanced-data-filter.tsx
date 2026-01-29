'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, X, Calendar, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { Trade, Image as TradeImage } from '@prisma/client';

type TradeWithImages = Trade & {
    images: TradeImage[];
    parentId?: string | null;
};

export interface FilterOptions {
    searchTerm: string;
    status: string;
    side: string;
    symbol: string;
    dateRange: {
        start: string;
        end: string;
    };
    minPnL: string;
    maxPnL: string;
    segment: string;
}

interface AdvancedDataFilterProps {
    data: TradeWithImages[];
    onFilterChange: (filteredData: TradeWithImages[]) => void;
    className?: string;
}

const DEFAULT_FILTERS: FilterOptions = {
    searchTerm: '',
    status: 'all',
    side: 'all',
    symbol: 'all',
    dateRange: {
        start: '',
        end: ''
    },
    minPnL: '',
    maxPnL: '',
    segment: 'all'
};

export default function AdvancedDataFilter({ data, onFilterChange, className = '' }: AdvancedDataFilterProps) {
    const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const symbols = [...new Set(data.map(trade => trade.symbol))].sort();
        const segments = [...new Set(data.map(trade => trade.segment).filter(Boolean))].sort();
        
        return {
            symbols,
            segments,
            hasData: data.length > 0
        };
    }, [data]);

    // Apply filters to data
    const filteredData = useMemo(() => {
        let result = data;

        // Search term filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            result = result.filter(trade => 
                trade.symbol.toLowerCase().includes(searchLower) ||
                trade.side.toLowerCase().includes(searchLower) ||
                trade.status.toLowerCase().includes(searchLower) ||
                ((trade as any).notes && (trade as any).notes.toLowerCase().includes(searchLower))
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            result = result.filter(trade => trade.status === filters.status);
        }

        // Side filter
        if (filters.side !== 'all') {
            result = result.filter(trade => trade.side === filters.side);
        }

        // Symbol filter
        if (filters.symbol !== 'all') {
            result = result.filter(trade => trade.symbol === filters.symbol);
        }

        // Segment filter
        if (filters.segment !== 'all') {
            result = result.filter(trade => trade.segment === filters.segment);
        }

        // Date range filter
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            result = result.filter(trade => new Date(trade.entryDate) >= startDate);
        }

        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // End of day
            result = result.filter(trade => new Date(trade.entryDate) <= endDate);
        }

        // P&L range filter
        if (filters.minPnL) {
            const minPnL = parseFloat(filters.minPnL);
            if (!isNaN(minPnL)) {
                result = result.filter(trade => (trade.netPnL || 0) >= minPnL);
            }
        }

        if (filters.maxPnL) {
            const maxPnL = parseFloat(filters.maxPnL);
            if (!isNaN(maxPnL)) {
                result = result.filter(trade => (trade.netPnL || 0) <= maxPnL);
            }
        }

        return result;
    }, [data, filters]);

    // Notify parent of filter changes
    React.useEffect(() => {
        onFilterChange(filteredData);
    }, [filteredData, onFilterChange]);

    // Update filter handlers
    const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const updateDateRange = useCallback((field: 'start' | 'end', value: string) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: value
            }
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return (
            filters.searchTerm ||
            filters.status !== 'all' ||
            filters.side !== 'all' ||
            filters.symbol !== 'all' ||
            filters.segment !== 'all' ||
            filters.dateRange.start ||
            filters.dateRange.end ||
            filters.minPnL ||
            filters.maxPnL
        );
    }, [filters]);

    if (!filterOptions.hasData) {
        return (
            <div className={`text-center py-8 text-muted-foreground ${className}`}>
                No data available to filter
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Quick Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search trades..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter('searchTerm', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <select
                        value={filters.side}
                        onChange={(e) => updateFilter('side', e.target.value)}
                        className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">All Sides</option>
                        <option value="LONG">Long</option>
                        <option value="SHORT">Short</option>
                    </select>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-3 py-2 bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showAdvanced ? 'Simple' : 'Advanced'}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2 bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="premium-card p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Symbol Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Symbol</label>
                            <select
                                value={filters.symbol}
                                onChange={(e) => updateFilter('symbol', e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">All Symbols</option>
                                {filterOptions.symbols.map(symbol => (
                                    <option key={symbol} value={symbol}>{symbol}</option>
                                ))}
                            </select>
                        </div>

                        {/* Segment Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Segment</label>
                            <select
                                value={filters.segment}
                                onChange={(e) => updateFilter('segment', e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">All Segments</option>
                                {filterOptions.segments.map(segment => (
                                    <option key={segment} value={segment || ''}>{segment}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start || ''}
                                    onChange={(e) => updateDateRange('start', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                                <input
                                    type="date"
                                    value={filters.dateRange.end || ''}
                                    onChange={(e) => updateDateRange('end', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* P&L Range */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">P&L Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPnL}
                                    onChange={(e) => updateFilter('minPnL', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPnL}
                                    onChange={(e) => updateFilter('maxPnL', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {filteredData.length} of {data.length} trades
                    {hasActiveFilters && ' (filtered)'}
                </span>
                
                {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                        <span>Active filters:</span>
                        <div className="flex gap-1">
                            {filters.searchTerm && (
                                <span className="px-2 py-1 bg-muted rounded text-xs">Search: {filters.searchTerm}</span>
                            )}
                            {filters.status !== 'all' && (
                                <span className="px-2 py-1 bg-muted rounded text-xs">Status: {filters.status}</span>
                            )}
                            {filters.side !== 'all' && (
                                <span className="px-2 py-1 bg-muted rounded text-xs">Side: {filters.side}</span>
                            )}
                            {filters.symbol !== 'all' && (
                                <span className="px-2 py-1 bg-muted rounded text-xs">Symbol: {filters.symbol}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}