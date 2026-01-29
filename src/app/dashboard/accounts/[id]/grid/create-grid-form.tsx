'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { createGridStrategy } from '@/app/lib/actions';
import { calculateFuturesGrid, GridInputs, GridResults } from '@/app/lib/grid-calculator';
import { ChevronLeft, Info, HelpCircle, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import SymbolSelector from './symbol-selector';

export default function CreateGridForm({ accountId, balance, close }: { accountId: string, balance: number, close: () => void }) {
    const createGridWithId = createGridStrategy.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createGridWithId, null);

    const [strategyType, setStrategyType] = useState<'SPOT' | 'FUTURES'>('FUTURES');
    const [direction, setDirection] = useState<'LONG' | 'SHORT' | 'NEUTRAL'>('LONG');
    const [symbol, setSymbol] = useState<string>('');
    const [lowerPrice, setLowerPrice] = useState<string>('');
    const [upperPrice, setUpperPrice] = useState<string>('');
    const [gridCount, setGridCount] = useState<string>('');
    const [investment, setInvestment] = useState<string>('');
    const [leverage, setLeverage] = useState<number>(3);
    const [entryPrice, setEntryPrice] = useState<string>('');
    const [autoReserve, setAutoReserve] = useState<boolean>(true);
    const [manualReservedMargin, setManualReservedMargin] = useState<string>('');
    const [capitalAllocation, setCapitalAllocation] = useState<number>(0);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
    const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);

    const isPriceInvalid = lowerPrice !== '' && upperPrice !== '' && parseFloat(lowerPrice) >= parseFloat(upperPrice);

    const calcResults = useMemo(() => {
        if (!lowerPrice || !upperPrice || !gridCount || !investment) return null;
        if (strategyType === 'FUTURES' && !leverage) return null;

        const inputs: GridInputs = {
            lowerPrice: parseFloat(lowerPrice),
            upperPrice: parseFloat(upperPrice),
            gridCount: parseInt(gridCount),
            investment: parseFloat(investment),
            leverage: strategyType === 'SPOT' ? 1 : leverage,
            maintenanceMarginRate: 0.05, // Should ideally be fetched dynamically based on coin
            autoReserveMargin: strategyType === 'SPOT' ? false : autoReserve,
            manualReservedMargin: strategyType === 'SPOT' ? 0 : (parseFloat(manualReservedMargin) || 0),
            positionSide: strategyType === 'SPOT' ? 'NEUTRAL' : direction,
            entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
            availableBalance: balance, // Pass available balance for manual reserve calculation
        };

        try {
            return calculateFuturesGrid(inputs);
        } catch (e: unknown) {
            return { error: e instanceof Error ? e.message : 'Unknown error' };
        }
    }, [lowerPrice, upperPrice, gridCount, investment, leverage, autoReserve, manualReservedMargin, direction, entryPrice, balance]);

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    const isError = !!(calcResults && 'error' in calcResults);
    const hasValidInput = lowerPrice && upperPrice && gridCount && investment;

    const handleTooltip = (e: React.MouseEvent, content: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            content,
            x: rect.left + rect.width / 2,
            y: rect.top - 8
        });
    };

    const handleSymbolSelect = (selectedSymbol: string, currentPrice: string) => {
        setSymbol(selectedSymbol);
        // Optionally auto-fill entry price with current market price
        if (!entryPrice) {
            setEntryPrice(currentPrice);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200" onMouseMove={() => setTooltip(null)} onMouseLeave={() => setTooltip(null)}>
            <div className="w-full max-w-lg rounded-xl bg-[#16171a] text-[#eaecef] shadow-2xl border border-[#2b2f36] flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#2b2f36]">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={close}
                            className="p-1.5 rounded-lg bg-[#1e2026] text-[#848e9c] hover:text-white hover:bg-[#2b2f36] transition-all duration-200"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold">{strategyType === 'FUTURES' ? 'Futures Grid' : 'Spot Grid'}</h2>
                            <p className="text-[10px] text-[#848e9c]">Create automated trading strategy</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full ${strategyType === 'FUTURES' ? 'bg-[#0ecb81]/10 border border-[#0ecb81]/20' : 'bg-[#f0b90b]/10 border border-[#f0b90b]/20'}`}>
                            <span className={`text-[10px] font-bold ${strategyType === 'FUTURES' ? 'text-[#0ecb81]' : 'text-[#f0b90b]'}`}>
                                {strategyType}
                            </span>
                        </div>
                    </div>


                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {/* Strategy Type Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-[#848e9c] font-bold">Strategy Type</label>
                        <div className="flex bg-[#1e2026] rounded-lg p-1 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setStrategyType('FUTURES')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${strategyType === 'FUTURES'
                                    ? 'bg-[#2b2f36] text-[#0ecb81] shadow-lg border border-white/10'
                                    : 'text-[#848e9c] hover:text-[#0ecb81]'
                                    }`}
                            >
                                Futures Grid
                            </button>
                            <button
                                type="button"
                                onClick={() => setStrategyType('SPOT')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${strategyType === 'SPOT'
                                    ? 'bg-[#2b2f36] text-[#f0b90b] shadow-lg border border-white/10'
                                    : 'text-[#848e9c] hover:text-[#f0b90b]'
                                    }`}
                            >
                                Spot Grid
                            </button>
                        </div>
                    </div>

                    {/* Pair Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-[#848e9c] font-bold">Trading pair</label>
                        <div className="relative">
                            <div className="flex items-center justify-between bg-[#1e2026] rounded-lg p-1 transition-all border border-transparent hover:border-[#2b2f36] focus-within:border-[#f0b90b]/50">
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    onFocus={() => setShowSymbolSelector(true)}
                                    className="w-full bg-transparent border-none font-bold outline-none focus:ring-0 focus:outline-none p-2 uppercase pr-8"
                                    placeholder="Click to browse pairs"
                                />
                                <Search className="h-4 w-4 text-[#848e9c] mr-2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Direction Tabs */}
                    {strategyType === 'FUTURES' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] uppercase tracking-wider text-[#848e9c] font-bold">Position direction</label>
                            <div className="flex bg-[#1e2026] rounded-lg p-1 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setDirection('LONG')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all transform hover:scale-105 active:scale-95 ${direction === 'LONG'
                                        ? 'bg-gradient-to-r from-[#0ecb81]/20 to-[#0bb271]/20 text-[#0ecb81] shadow-lg shadow-[#0ecb81]/20 border border-[#0ecb81]/30'
                                        : 'text-[#848e9c] hover:text-[#0ecb81] hover:bg-[#0ecb81]/5'
                                        }`}
                                >
                                    Long
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDirection('SHORT')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all transform hover:scale-105 active:scale-95 ${direction === 'SHORT'
                                        ? 'bg-gradient-to-r from-[#f23645]/20 to-[#d8303e]/20 text-[#f23645] shadow-lg shadow-[#f23645]/20 border border-[#f23645]/30'
                                        : 'text-[#848e9c] hover:text-[#f23645] hover:bg-[#f23645]/5'
                                        }`}
                                >
                                    Short
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDirection('NEUTRAL')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all transform hover:scale-105 active:scale-95 ${direction === 'NEUTRAL'
                                        ? 'bg-gradient-to-r from-[#eaecef]/20 to-[#cfd3d7]/20 text-[#eaecef] shadow-lg shadow-white/10 border border-white/30'
                                        : 'text-[#848e9c] hover:text-[#eaecef] hover:bg-white/5'
                                        }`}
                                >
                                    Neutral
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2b2f36]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-[#16171a] px-3 text-[#848e9c] font-medium">Strategy parameters</span>
                        </div>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <input type="hidden" name="type" value={strategyType} />
                        <input type="hidden" name="direction" value={strategyType === 'SPOT' ? 'NEUTRAL' : direction} />
                        <input type="hidden" name="symbol" value={symbol} />
                        <input type="hidden" name="leverage" value={strategyType === 'SPOT' ? '1' : leverage} />
                        <input type="hidden" name="maintenanceMarginRate" value={strategyType === 'SPOT' ? '0' : '0.05'} />

                        {/* Hidden fields for calculated values - only if valid */}
                        {!isError && calcResults && (
                            <>
                                <input type="hidden" name="liquidationPrice" value={('liquidationPrices' in calcResults) ? (calcResults.liquidationPrices.long || calcResults.liquidationPrices.short || '') : ''} />
                                <input type="hidden" name="investmentAfterLeverage" value={('positionSize' in calcResults) ? calcResults.positionSize : ''} />
                                <input type="hidden" name="reservedMargin" value={('reservedMargin' in calcResults) ? calcResults.reservedMargin : ''} />
                                <input type="hidden" name="usableMargin" value={('usableMargin' in calcResults) ? calcResults.usableMargin : ''} />
                                <input type="hidden" name="reserveRate" value={('reserveRate' in calcResults) ? calcResults.reserveRate : ''} />
                                <input type="hidden" name="autoReserveMargin" value={autoReserve.toString()} />
                            </>
                        )}

                        <input type="hidden" name="entryPrice" value={entryPrice || (!isNaN(parseFloat(lowerPrice)) && !isNaN(parseFloat(upperPrice)) ? (parseFloat(lowerPrice) + parseFloat(upperPrice)) / 2 : '')} />

                        {/* 1. Price Range */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#eaecef]">1. Price Range</span>
                                <HelpCircle
                                    className="h-3 w-3 text-[#848e9c] cursor-help hover:text-[#f0b90b] transition-colors"
                                    onMouseEnter={(e) => handleTooltip(e, 'Set the lower and upper price bounds for your grid strategy')}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#1e2026] rounded-lg p-2 transition-all flex items-center justify-between">
                                    <input
                                        type="number"
                                        name="lowerPrice"
                                        value={lowerPrice}
                                        onChange={(e) => setLowerPrice(e.target.value)}
                                        className="w-full bg-transparent border-none text-left font-bold text-sm outline-none focus:ring-0 focus:outline-none p-0 placeholder:text-[#474d57] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="Min"
                                    />
                                    <span className="text-[10px] text-[#848e9c] font-bold">USDT</span>
                                </div>
                                <div className="bg-[#1e2026] rounded-lg p-2 transition-all flex items-center justify-between">
                                    <input
                                        type="number"
                                        name="upperPrice"
                                        value={upperPrice}
                                        onChange={(e) => setUpperPrice(e.target.value)}
                                        className="w-full bg-transparent border-none text-left font-bold text-sm outline-none focus:ring-0 focus:outline-none p-0 placeholder:text-[#474d57] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

                                        placeholder="Max"
                                    />
                                    <span className="text-[10px] text-[#848e9c] font-bold">USDT</span>
                                </div>
                            </div>
                            {isPriceInvalid && (
                                <div className="text-[10px] text-[#f23645] flex items-center gap-1 animate-in slide-in-from-top-1 duration-200 mt-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Lower price must be less than upper price</span>
                                </div>
                            )}
                        </div>

                        {/* Optional Entry Price */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#eaecef]">Entry Price</span>
                                <HelpCircle
                                    className="h-3 w-3 text-[#848e9c] cursor-help hover:text-[#f0b90b] transition-colors"
                                    onMouseEnter={(e) => handleTooltip(e, 'Optional: Specify the price where the grid activation starts. Defaults to market mid-price.')}
                                />
                            </div>
                            <div className="bg-[#1e2026] rounded-lg p-2 transition-all flex items-center justify-between">
                                <input
                                    type="number"
                                    value={entryPrice}
                                    onChange={(e) => setEntryPrice(e.target.value)}
                                    className="w-full bg-transparent border-none text-left font-bold text-sm outline-none focus:ring-0 focus:outline-none p-0 placeholder:text-[#474d57] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="Auto (Mid-Price)"
                                />
                                <span className="text-[10px] text-[#848e9c] font-bold">USDT</span>
                            </div>
                        </div>

                        {/* 2. Quantity of Grids */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#eaecef]">2. Quantity of Grids</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#848e9c] bg-[#2b2f36] px-1.5 py-0.5 rounded">2-500</span>
                                    <HelpCircle
                                        className="h-3 w-3 text-[#848e9c] cursor-help hover:text-[#f0b90b] transition-colors"
                                        onMouseEnter={(e) => handleTooltip(e, 'Number of price levels where orders will be placed')}
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-[#1e2026] rounded-lg p-2 transition-all flex items-center justify-between">
                                    <input
                                        type="number"
                                        name="gridCount"
                                        value={gridCount}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!e.target.value || (val > 0 && val <= 500)) {
                                                setGridCount(e.target.value);
                                            }
                                        }}
                                        className="w-full bg-transparent border-none text-left font-bold text-sm outline-none focus:ring-0 focus:outline-none p-0 placeholder:text-[#474d57] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="Quantity"
                                        min={2}
                                        max={500}
                                    />
                                    <span className="text-[10px] text-[#848e9c] font-bold">Grids</span>
                                </div>
                                {!isError && calcResults && 'gridStep' in calcResults && gridCount && (
                                    <div className="text-[10px] text-[#848e9c] mt-1 flex justify-between">
                                        <span>Step: {calcResults.gridStep.toFixed(calcResults.gridStep < 0.1 ? 4 : 2)} USDT</span>
                                        {parseInt(gridCount) > 0 && (
                                            <span>
                                                Profit/Grid: {((calcResults.gridStep / parseFloat(upperPrice)) * 100).toFixed(2)}% - {((calcResults.gridStep / parseFloat(lowerPrice)) * 100).toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Investment Amount */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#eaecef]">3. Investment Amount</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-[#848e9c] font-mono">Avbl: {balance.toLocaleString()} USDT</span>
                                    <HelpCircle
                                        className="h-3 w-3 text-[#848e9c] cursor-help hover:text-[#f0b90b] transition-colors"
                                        onMouseEnter={(e) => handleTooltip(e, 'Capital to allocate for this strategy. Leverage will multiply this amount.')}
                                    />
                                </div>
                            </div>

                            <div className="bg-[#1e2026] rounded-lg p-3 transition-all relative">
                                <div className="flex items-center justify-between mb-2">
                                    <input
                                        type="number"
                                        name="allocatedCapital"
                                        value={investment}
                                        onChange={(e) => setInvestment(e.target.value)}
                                        className="w-full bg-transparent border-none text-left text-xl font-bold outline-none focus:ring-0 focus:outline-none p-0 placeholder:text-[#474d57] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0.00"
                                    />
                                    {strategyType === 'FUTURES' && (
                                        <div className="w-[35%] flex items-center gap-1 bg-[#2b2f36] rounded-md overflow-hidden border border-white/5 animate-in slide-in-from-right-2 duration-300">
                                            <button
                                                type="button"
                                                onClick={() => setLeverage(prev => Math.max(1, prev - 1))}
                                                className="px-3 py-1 hover:bg-[#474d57] text-xs font-bold text-[#848e9c] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={leverage}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        setLeverage(val);
                                                    }
                                                }}
                                                className="w-10 bg-transparent border-none text-xs font-bold text-[#f0b90b] text-center outline-none focus:ring-0 focus:outline-none p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setLeverage(prev => prev + 1)}
                                                className="px-2 py-1 hover:bg-[#474d57] text-xs font-bold text-[#848e9c] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                            >
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] text-[#848e9c]">
                                        {strategyType === 'FUTURES' ? (
                                            !isError && calcResults && !('error' in calcResults) && 'reservedMargin' in calcResults ? (
                                                <>
                                                    {autoReserve ? (
                                                        <>
                                                            Reserved: <span className="text-[#f0b90b]">{(calcResults as GridResults).reservedMargin.toFixed(1)}</span>
                                                            {' | '}
                                                            Usable: <span className="text-[#0ecb81]">{(calcResults as GridResults).usableMargin.toFixed(1)}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Reserved: <span className="text-[#f0b90b]">{(calcResults as GridResults).reservedMargin.toFixed(1)}</span>
                                                            {' | '}
                                                            Usable: <span className="text-[#0ecb81]">{(calcResults as GridResults).usableMargin.toFixed(1)}</span>
                                                            {' | '}
                                                            From Avbl: <span className="text-[#848e9c]">{balance.toFixed(1)}</span>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                autoReserve ? 'Initial Margin' : 'Manual Reserve from Balance'
                                            )
                                        ) : (
                                            'Total investment for spot trading'
                                        )}
                                    </div>
                                    {strategyType === 'FUTURES' && (
                                        <div className="flex items-center gap-1.5 w-[30%] justify-end animate-in fade-in duration-500">
                                            <input
                                                type="checkbox"
                                                id="autoReserve"
                                                checked={autoReserve}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setAutoReserve(checked);
                                                    if (!checked) {
                                                        setManualReservedMargin('0');
                                                    }
                                                }}
                                                className="w-3 h-3 rounded bg-[#2b2f36] border-[#474d57] text-[#f0b90b] focus:ring-0 focus:outline-none outline-none cursor-pointer"
                                            />
                                            <label htmlFor="autoReserve" className="text-[10px] mr-2 text-[#848e9c] cursor-pointer hover:text-[#eaecef] transition-colors">Auto Reserv.</label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Manual Margin Input */}
                            {strategyType === 'FUTURES' && !autoReserve && (
                                <div className="space-y-2">
                                    <div className="bg-[#1e2026] rounded-lg p-2 transition-all flex items-center justify-between">
                                        <input
                                            type="number"
                                            value={manualReservedMargin}
                                            onChange={(e) => setManualReservedMargin(e.target.value)}
                                            className="w-full bg-transparent border-none text-left font-bold text-sm outline-none focus:ring-0 focus:outline-none p-0 text-[#f0b90b] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="Enter reserve margin"
                                            max={Math.max(0, balance - (parseFloat(investment) || 0))}
                                        />
                                        <span className="text-[10px] text-[#f0b90b] font-bold">USDT</span>
                                    </div>
                                    <div className="text-[9px] text-[#848e9c] flex justify-between">
                                        <span>Available: {Math.max(0, balance - (parseFloat(investment) || 0)).toFixed(2)} USDT</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const investmentVal = parseFloat(investment) || 0;
                                                setManualReservedMargin((investmentVal * 0.20).toFixed(2));
                                            }}
                                            className="text-[#f0b90b] hover:text-[#f0b90b]/80 transition-colors"
                                        >
                                            Use Suggested
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error Message from Calculation */}
                            {isError && (
                                <div className="text-[10px] text-[#f23645] flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{('error' in calcResults) ? (calcResults as { error: string }).error : ''}</span>
                                </div>
                            )}

                            {/* Slider */}
                            <div className="pt-2 px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="25"
                                    value={capitalAllocation}
                                    onChange={(e) => {
                                        const percent = parseInt(e.target.value);
                                        setCapitalAllocation(percent);
                                        setInvestment((balance * percent / 100).toFixed(2));
                                    }}
                                    className="w-full h-1 bg-[#2b2f36] rounded-lg appearance-none cursor-pointer accent-[#f0b90b]"
                                />
                                <div className="flex justify-between mt-2">
                                    {[0, 25, 50, 75, 100].map(val => (
                                        <div key={val}
                                            className={`flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 active:scale-95 ${capitalAllocation >= val ? 'text-[#f0b90b]' : 'text-[#474d57] hover:text-[#848e9c]'}`}
                                            onClick={() => {
                                                setCapitalAllocation(val);
                                                setInvestment((balance * val / 100).toFixed(2));
                                            }}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mb-1 transition-all ${capitalAllocation >= val ? 'bg-[#f0b90b] shadow-sm shadow-[#f0b90b]/50' : 'bg-[#2b2f36] hover:bg-[#474d57]'}`} />
                                            <span className="text-[10px] font-bold">{val}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Strategy Summary Card */}
                        {hasValidInput && (
                            <div className="bg-gradient-to-br from-[#1e2026] to-[#2b2f36] rounded-xl p-4 border border-[#2b2f36] animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="h-4 w-4 text-[#f0b90b]" />
                                    <span className="text-sm font-bold text-[#eaecef]">Strategy Summary</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#16171a]/50 rounded-lg p-3 border border-white/5">
                                        <div className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Position Size</div>
                                        <div className="text-sm font-bold text-[#0ecb81] mt-1">
                                            {!isError && calcResults && 'positionSize' in calcResults ? calcResults.positionSize.toLocaleString() : '0.0'} USDT
                                        </div>
                                    </div>

                                    <div className="bg-[#16171a]/50 rounded-lg p-3 border border-white/5">
                                        <div className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Profit / Grid</div>
                                        <div className="text-sm font-bold text-[#f0b90b] mt-1">
                                            {!isError && calcResults && 'gridStep' in calcResults ? (
                                                `${((calcResults.gridStep / parseFloat(upperPrice)) * 100).toFixed(2)}%`
                                            ) : '0.00%'}
                                        </div>
                                    </div>

                                    <div className="bg-[#16171a]/50 rounded-lg p-3 border border-white/5">
                                        <div className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Risk Level</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {strategyType === 'FUTURES' ? (
                                                !isError && calcResults && 'positionSize' in calcResults && leverage > 5 ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-[#f23645] rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-bold text-[#f23645]">HIGH</span>
                                                    </>
                                                ) : !isError && calcResults && 'positionSize' in calcResults && leverage > 2 ? (
                                                    <>
                                                        <div className="w-2 h-2 bg-[#f0b90b] rounded-full" />
                                                        <span className="text-[10px] font-bold text-[#f0b90b]">MEDIUM</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 bg-[#0ecb81] rounded-full" />
                                                        <span className="text-[10px] font-bold text-[#0ecb81]">LOW</span>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <div className="w-2 h-2 bg-[#0ecb81] rounded-full" />
                                                    <span className="text-[10px] font-bold text-[#0ecb81]">LOW</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {strategyType === 'FUTURES' && !isError && calcResults && 'liquidationPrices' in calcResults && (
                                        <div className="mt-3 animate-in slide-in-from-top-1 duration-300">
                                            <div className="bg-[#16171a]/50 rounded-lg p-3 border border-white/5">
                                                <div className="text-[10px] text-[#848e9c] font-bold uppercase tracking-wider">Liq. Price</div>
                                                <div className="text-sm font-bold text-[#f23645] mt-1">
                                                    {calcResults.liquidationPrices.long?.toLocaleString() || calcResults.liquidationPrices.short?.toLocaleString() || '-'}
                                                </div>
                                                {direction === 'NEUTRAL' && calcResults.liquidationPrices.short && (
                                                    <div className="text-[10px] text-[#848e9c] mt-1">
                                                        Short: {calcResults.liquidationPrices.short.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {!isError && calcResults && 'warnings' in calcResults && calcResults.warnings.map((warning, i) => (
                            <div key={i} className="bg-[#f23645]/10 text-[#f23645] p-3 rounded-lg border border-[#f23645]/20 text-[10px] font-bold flex items-center gap-2">
                                <Info className="h-3 w-3 flex-shrink-0" />
                                <span>{warning}</span>
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isPending || isPriceInvalid || isError}
                            className={`w-full py-4 rounded-xl text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg ${strategyType === 'SPOT' ? 'bg-gradient-to-r from-[#f0b90b] to-[#d8a306] hover:from-[#d8a306] hover:to-[#c49205] text-black shadow-[#f0b90b]/30' :
                                direction === 'LONG' ? 'bg-gradient-to-r from-[#0ecb81] to-[#0bb271] hover:from-[#0bb271] hover:to-[#0aa861] text-white shadow-[#0ecb81]/30' :
                                    direction === 'SHORT' ? 'bg-gradient-to-r from-[#f23645] to-[#d8303e] hover:from-[#d8303e] hover:to-[#c42b37] text-white shadow-[#f23645]/30' :
                                        'bg-gradient-to-r from-[#eaecef] to-[#cfd3d7] hover:from-[#cfd3d7] hover:to-[#b8bcc0] text-black shadow-white/10'
                                }`}
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Create Strategy'
                            )}
                        </button>
                    </form>
                </div>

                {/* Tooltip */}
                {
                    tooltip && (
                        <div
                            className="fixed z-[100] px-3 py-2 bg-[#2b2f36] text-[#eaecef] text-[10px] font-bold rounded-lg shadow-xl border border-[#474d57] pointer-events-none animate-in fade-in duration-150"
                            style={{
                                left: `${tooltip.x}px`,
                                top: `${tooltip.y}px`,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            {tooltip.content}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2b2f36]" />
                        </div>
                    )
                }
            </div >

            {/* Symbol Selector Modal */}
            {showSymbolSelector && (
                <SymbolSelector
                    isFutures={strategyType === 'FUTURES'}
                    segment="CRYPTO"
                    onSelect={handleSymbolSelect}
                    onClose={() => setShowSymbolSelector(false)}
                />
            )}
        </div >
    );
}
