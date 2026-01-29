'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { MarketSymbol, MarketSegment, fetchSymbols, searchSymbols, formatPrice, formatVolume } from '@/app/lib/market-api';

interface SymbolSelectorProps {
    isFutures: boolean;
    segment: MarketSegment;
    onSelect: (symbol: string, currentPrice: string) => void;
    onClose: () => void;
}

export default function SymbolSelector({ isFutures, segment, onSelect, onClose }: SymbolSelectorProps) {
    const [pairs, setPairs] = useState<MarketSymbol[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'favorites'>('all');

    useEffect(() => {
        const loadPairs = async () => {
            setLoading(true);
            const data = await fetchSymbols(segment, isFutures);
            setPairs(data);
            setLoading(false);
        };

        loadPairs();
    }, [isFutures, segment]);

    useEffect(() => {
        if (!searchQuery) return;

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            const searchResults = await searchSymbols(searchQuery, segment);
            setPairs(prev => {
                // Merge search results with current list, avoiding duplicates
                const existingSymbols = new Set(prev.map(p => p.symbol));
                const newOnes = searchResults.filter(r => !existingSymbols.has(r.symbol));
                return [...prev, ...newOnes];
            });
            setLoading(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, segment]);

    const filteredPairs = useMemo(() => {
        let filtered = pairs;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(pair =>
                pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pair.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Show top 50 by default, or all search results
        return searchQuery ? filtered : filtered.slice(0, 50);
    }, [pairs, searchQuery]);

    const handleSelect = (pair: MarketSymbol) => {
        onSelect(pair.symbol, pair.price);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl bg-[#16171a] text-[#eaecef] shadow-2xl border border-[#2b2f36] flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#2b2f36]">
                    <div>
                        <h2 className="text-xl font-bold">Select Trading Pair</h2>
                        <p className="text-xs text-[#848e9c] mt-1">
                            {isFutures ? 'Futures Perpetual Contracts' : 'Spot Trading Pairs'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-[#1e2026] text-[#848e9c] hover:text-white hover:bg-[#2b2f36] transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-[#2b2f36]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#848e9c]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search symbol (e.g., BTC, ETH)"
                            className="w-full pl-10 pr-4 py-3 bg-[#1e2026] border border-[#2b2f36] rounded-lg text-sm text-white placeholder-[#848e9c] focus:outline-none focus:ring-2 focus:ring-[#f0b90b]/50 focus:border-[#f0b90b]/50 transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Segment Specific Info */}
                    {!searchQuery && (
                        <div className="mt-3">
                            <p className="text-xs text-[#848e9c] font-bold uppercase tracking-wider mb-2">Popular {segment}</p>
                            <div className="flex flex-wrap gap-2">
                                {pairs.slice(0, 10).map(pair => (
                                    <button
                                        key={pair.symbol}
                                        onClick={() => handleSelect(pair)}
                                        className="px-3 py-1.5 bg-[#1e2026] hover:bg-[#2b2f36] border border-[#2b2f36] hover:border-[#f0b90b]/30 rounded-lg text-xs font-bold text-[#eaecef] transition-all hover:scale-105 active:scale-95"
                                    >
                                        {pair.symbol.replace('USDT', '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pairs List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="animate-spin h-8 w-8 text-[#f0b90b]" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-sm text-[#848e9c]">Loading trading pairs...</p>
                            </div>
                        </div>
                    ) : filteredPairs.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <p className="text-sm text-[#848e9c]">No trading pairs found</p>
                                <p className="text-xs text-[#474d57] mt-1">Try a different search term</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#2b2f36]">
                            {filteredPairs.map((pair) => {
                                const priceChange = parseFloat(pair.changePercent);
                                const isPositive = priceChange >= 0;

                                return (
                                    <button
                                        key={pair.symbol}
                                        onClick={() => handleSelect(pair)}
                                        className="w-full px-5 py-4 hover:bg-[#1e2026] transition-all text-left group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-white group-hover:text-[#f0b90b] transition-colors">
                                                        {pair.symbol}
                                                    </span>
                                                    <span className="text-xs text-[#848e9c]">{pair.name !== pair.symbol ? `• ${pair.name}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-[#848e9c]">
                                                    {pair.exchange && <span>{pair.exchange}</span>}
                                                    <span>Vol: {formatVolume(pair.volume)}</span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-sm text-white mb-1">
                                                    {formatPrice(pair.price)}
                                                </div>
                                                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isPositive ? 'text-[#0ecb81]' : 'text-[#f23645]'
                                                    }`}>
                                                    {isPositive ? (
                                                        <TrendingUp className="h-3 w-3" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3" />
                                                    )}
                                                    <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#2b2f36] bg-[#1e2026]/50">
                    <p className="text-xs text-[#848e9c] text-center">
                        Showing {filteredPairs.length} of {pairs.length} trading pairs • Data from Binance
                    </p>
                </div>
            </div>
        </div>
    );
}
