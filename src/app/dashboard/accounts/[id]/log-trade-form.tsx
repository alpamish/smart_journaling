'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { createTrade, getTradeConditions } from '@/app/lib/actions';
import { TradeCondition } from '@prisma/client';
import { Search } from 'lucide-react';
import SymbolSelector from './grid/symbol-selector';
import './log-trade-form.css';

export default function LogTradeForm({ accountId, balance, close }: { accountId: string, balance: number, close: () => void }) {
    const createTradeWithId = createTrade.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createTradeWithId, null);

    // Form State for dynamic logic
    const [segment, setSegment] = useState('CRYPTO');
    const [symbol, setSymbol] = useState<string>('');
    const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);
    const [currentPrice, setCurrentPrice] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [entryPrice, setEntryPrice] = useState<number>(0);
    const [leverage, setLeverage] = useState<number>(3);
    const [exitPrice, setExitPrice] = useState<number>(0);
    const [exitQuantity, setExitQuantity] = useState<number>(0);
    const [exitQuantityPercent, setExitQuantityPercent] = useState<number>(0);
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

    const [entryConditions, setEntryConditions] = useState<TradeCondition[]>([]);
    const [selectedEntryCondition, setSelectedEntryCondition] = useState<string>('');
    const [exitConditions, setExitConditions] = useState<TradeCondition[]>([]);
    const [imageCount, setImageCount] = useState(0);
    const [imagePreviews, setImagePreviews] = useState<{ file: File, preview: string, progress: number }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d', '3d', '1w', '1M'];
    const DEFAULT_CONDITIONS = {
        ENTRY: [
            'Accurate Entry', 'Early Entry', 'FOMO', 'Trendline Breakout', 'Double Bottom',
            'Double Top', 'EMA Cross', 'RSI Divergence', 'Support Bounce', 'Resistance Breakout',
            'Golden Cross', 'Death Cross', 'Trendline Reject', 'Oversold RSI', 'Overbought RSI',
            'Patience rewarded', 'Chased entry', 'News event', 'Rule based', 'Impulse trade'
        ],
        EXIT: [
            // Standard Hits
            'Target Hit', 'Stop Loss Hit', 'Manual Exit', 'Trailing Stop',
            // Technical Reasons
            'Trend Reversal', 'Resistance Reject', 'Support Break', 'Exhaustion Candle',
            'Double Top Confirm', 'Double Bottom Confirm', 'Divergence Confirmation',
            'Indicator Overlap', 'Squeeze Play Over', 'Volume Climax', 'Invalid Setup',
            'Lower High formed', 'Higher Low broken', 'EMA 200 Reject', 'VWAP Reject',
            'Parabolic Blowoff', 'Mean Reversion', 'Liquidity Sweep',
            // Time & Strategy
            'Time Based Exit', 'End of Session', 'Risk Reduction', 'Scaling Out',
            'Fundamental Shift', 'Economic Data Release', 'Profit Protecting',
            // Psychological
            'Emotional Exit', 'Fear based', 'Greed based', 'Lost Confidence',
            'Impatience', 'Distraction', 'Second Guessing'
        ]
    };

    useEffect(() => {
        const fetchConditions = async () => {
            const entry = await getTradeConditions('ENTRY');
            const exit = await getTradeConditions('EXIT');
            setEntryConditions(entry);
            setExitConditions(exit);
        };
        fetchConditions();
    }, []);

    useEffect(() => {
        if (state?.success) {
            close();
            // Reset form state after successful submission
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setImagePreviews([]);
            setImageCount(0);
            setIsUploading(false);
        }
    }, [state, close]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPending) {
            setIsUploading(true);
            // Simulate upload progress
            interval = setInterval(() => {
                setImagePreviews(prev =>
                    prev.map(preview => ({
                        ...preview,
                        progress: Math.min(preview.progress + Math.random() * 20, 90)
                    }))
                );
            }, 200);
        } else {
            setIsUploading(false);
            // Complete progress on success
            if (imagePreviews.length > 0) {
                setImagePreviews(prev =>
                    prev.map(preview => ({ ...preview, progress: 100 }))
                );
            }
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPending, imagePreviews.length]);

    // Auto-calculations
    const amountAfterLeverage = useMemo(() => quantity * entryPrice, [quantity, entryPrice]);
    const marginUsed = useMemo(() => (leverage > 0 ? amountAfterLeverage / leverage : 0), [amountAfterLeverage, leverage]);

    const pnl = useMemo(() => {
        if (!exitPrice || !entryPrice || !quantity) return 0;
        return side === 'LONG'
            ? (exitPrice - entryPrice) * quantity
            : (entryPrice - exitPrice) * quantity;
    }, [exitPrice, entryPrice, quantity, side]);

    const pnlPercent = useMemo(() => {
        if (!pnl || !marginUsed) return 0;
        return (pnl / marginUsed) * 100;
    }, [pnl, marginUsed]);

    const liquidationPrice = useMemo(() => {
        if (!entryPrice || !leverage || leverage <= 0) return 0;
        // maintenance margin rate (0.1% to allow higher leverage without immediately liquidating)
        const mm = 0.001;

        if (side === 'LONG') {
            // LiqPrice = EntryPrice * (1 - 1/leverage + mm)
            let lp = entryPrice * (1 - (1 / leverage) + mm);
            return Math.max(0, lp);
        } else {
            // LiqPrice = EntryPrice * (1 + 1/leverage - mm)
            let lp = entryPrice * (1 + (1 / leverage) - mm);
            return Math.max(0, lp);
        }
    }, [entryPrice, leverage, side]);

    const isOverMargin = marginUsed > balance;

    const exitQuantityPnL = useMemo(() => {
        if (!exitPrice || !entryPrice || !exitQuantity) return 0;
        return side === 'LONG'
            ? (exitPrice - entryPrice) * exitQuantity
            : (entryPrice - exitPrice) * exitQuantity;
    }, [exitPrice, entryPrice, exitQuantity, side]);

    const handleSliderChange = (percent: number) => {
        setExitQuantityPercent(percent);
        const calculatedQuantity = (quantity * percent) / 100;
        setExitQuantity(calculatedQuantity);
        const input = document.querySelector('input[name="exitQuantity"]') as HTMLInputElement;
        if (input) {
            input.value = calculatedQuantity.toString();
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    const handleSymbolSelect = (selectedSymbol: string, price: string) => {
        setSymbol(selectedSymbol);
        setCurrentPrice(price);
        // Auto-fill entry price with current market price if not already set
        if (!entryPrice || entryPrice === 0) {
            setEntryPrice(parseFloat(price));
            const input = document.querySelector('input[name="entryPrice"]') as HTMLInputElement;
            if (input) {
                input.value = price;
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Limit to 3 images total (including already selected)
        const totalImages = imagePreviews.length + files.length;
        const filesToProcess = totalImages > 3
            ? files.slice(0, 3 - imagePreviews.length)
            : files;

        if (totalImages > 3) {
            alert('You can only upload up to 3 images.');
        }

        const validFiles = filesToProcess.filter(file => {
            const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            return isValidType && isValidSize;
        });

        const previews = await Promise.all(validFiles.map(async (file) => {
            return new Promise<{ file: File, preview: string, progress: number }>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        file,
                        preview: e.target?.result as string,
                        progress: 0
                    });
                };
                reader.readAsDataURL(file);
            });
        }));

        setImagePreviews(prev => {
            const newPreviews = [...prev, ...previews];
            if (selectedImageIndex === null && newPreviews.length > 0) {
                setSelectedImageIndex(0);
            } else if (previews.length > 0) {
                setSelectedImageIndex(newPreviews.length - 1);
            }
            return newPreviews;
        });
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    async function handleSubmit(formData: FormData) {
        // Clear any existing images from the native form submission to avoid duplicates
        // Note: FormData.delete isn't always available in all environments, 
        // but it's safe in modern browsers.
        formData.delete('images');

        // Append all files from imagePreviews state
        imagePreviews.forEach(preview => {
            formData.append('images', preview.file);
        });

        formAction(formData);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-4xl rounded-3xl bg-[#0B0F1A] p-8 shadow-2xl max-h-[95vh] overflow-y-auto border border-white/[0.08] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-3xl" />
                <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Log Futures Trade</h2>
                            <p className="text-sm text-slate-400 font-medium">Record a new derivatives entry across any asset class.</p>
                        </div>
                        <button onClick={close} className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-8">
                        {/* Setup Section */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-white/5">1. Trade Setup</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Segment</label>
                                    <select
                                        name="segment"
                                        value={segment}
                                        onChange={(e) => setSegment(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="CRYPTO">Crypto</option>
                                        <option value="STOCK">Stock</option>
                                        <option value="FOREX">Forex</option>
                                        <option value="COMMODITY">Commodity</option>
                                        <option value="FUTURES">Futures</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                                    <select name="marginMode" className="form-select">
                                        <option value="ISOLATED">Isolated</option>
                                        <option value="CROSS">Cross</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Trade Type</label>
                                    <select name="tradeType" className="form-select">
                                        <option value="SCALPING">Scalping</option>
                                        <option value="INTRADAY">Intraday</option>
                                        <option value="SWING">Swing</option>
                                        <option value="POSITIONAL">Positional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Session</label>
                                    <select name="session" className="form-select">
                                        <option value="MORNING">Morning</option>
                                        <option value="AFTERNOON">Afternoon</option>
                                        <option value="EVENING">Evening</option>
                                        <option value="NIGHT">Night</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Entry Details Section */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-white/5">2. Entry Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2 grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Symbol</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="symbol"
                                                value={symbol}
                                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                                onFocus={() => segment === 'CRYPTO' && setShowSymbolSelector(true)}
                                                required
                                                placeholder={segment === 'CRYPTO' ? "BTCUSDT" : "Enter Symbol"}
                                                className="form-input pr-10 uppercase font-bold tracking-wide"
                                            />
                                            {segment === 'CRYPTO' && <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />}
                                        </div>
                                        {segment === 'CRYPTO' && currentPrice && (
                                            <p className="text-[13px] text-slate-400 mt-1.5">
                                                <span>Current Price:</span>
                                                <span className="font-mono font-medium text-blue-400 ml-2">${parseFloat(currentPrice).toLocaleString()}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Side</label>
                                        <select
                                            name="side"
                                            value={side}
                                            onChange={(e) => setSide(e.target.value as 'LONG' | 'SHORT')}
                                            className={`form-select font-bold ${side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}
                                        >
                                            <option value="LONG">LONG</option>
                                            <option value="SHORT">SHORT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Price</label>
                                        <input
                                            type="number"
                                            name="entryPrice"
                                            step="any"
                                            required
                                            onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                                            className="form-input font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Date</label>
                                        <input type="datetime-local" name="entryDate" defaultValue={new Date().toISOString().slice(0, 16)} className="form-input text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis Timeframe</label>
                                        <select name="analysisTimeframe" className="form-select text-sm font-medium">
                                            {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                        </select>
                                    </div>
                                    <div className='h-1'></div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Timeframe</label>
                                        <select name="entryTimeframe" className="form-select text-sm font-medium">
                                            {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Condition</label>
                                <select
                                    name="entryCondition"
                                    value={selectedEntryCondition}
                                    onChange={(e) => setSelectedEntryCondition(e.target.value)}
                                    className="form-select w-full"
                                >
                                    <option value="">Select primary reason...</option>
                                    {entryConditions.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                    {DEFAULT_CONDITIONS.ENTRY.filter(name => !entryConditions.some(c => c.name === name)).map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {/* Risk & Position Management */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-white/5">3. Risk & Position</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Stop Loss</label>
                                    <input type="number" name="stopLoss" step="any" className="form-input form-input-rose font-mono" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target (TP)</label>
                                    <input type="number" name="takeProfit" step="any" className="form-input form-input-emerald font-mono" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity (Size)</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        step="any"
                                        required
                                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                                        className="form-input font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Leverage (x)</label>
                                    <input
                                        type="number"
                                        name="leverage"
                                        min="1"
                                        defaultValue="3"
                                        onChange={(e) => setLeverage(parseFloat(e.target.value) || 3)}
                                        className="form-input font-mono"
                                    />
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between group hover:bg-white/[0.07] transition-all">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position Size</span>
                                    <div className="text-xl font-mono font-bold text-white mt-2">
                                        {amountAfterLeverage.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-medium text-slate-500">USD</span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${isOverMargin
                                    ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                    : 'bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isOverMargin ? 'text-rose-400' : 'text-blue-400'}`}>Margin Required</span>
                                        {isOverMargin && (
                                            <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">LOW BAL</span>
                                        )}
                                    </div>
                                    <div className={`text-xl font-mono font-bold mt-2 ${isOverMargin ? 'text-rose-400' : 'text-blue-400'}`}>
                                        {marginUsed.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-medium opacity-70">USD</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] flex flex-col justify-between">
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Est. Liq Price</span>
                                    <input type="hidden" name="liquidationPrice" value={liquidationPrice} />
                                    <div className="text-xl font-mono font-bold text-orange-400 mt-2">
                                        ${liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Exit Details Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                                <h3 className="text-lg font-semibold text-slate-200">4. Exit Details (Optional)</h3>
                                <button type="button" className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-3 py-1 rounded-lg uppercase font-bold transition-all border border-white/5">
                                    Close Trade Now
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Price</label>
                                    <input
                                        type="number"
                                        name="exitPrice"
                                        step="any"
                                        onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                                        className="form-input font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Quantity</label>
                                    <input
                                        type="number"
                                        name="exitQuantity"
                                        step="any"
                                        value={exitQuantity}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            setExitQuantity(val);
                                            if (quantity > 0) {
                                                setExitQuantityPercent((val / quantity) * 100);
                                            }
                                        }}
                                        className="form-input font-mono mb-3"
                                    />
                                    {quantity > 0 && (
                                        <div className="space-y-2 px-1">
                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                                                <span>0%</span>
                                                <span className="text-blue-400">{exitQuantityPercent.toFixed(0)}%</span>
                                                <span>100%</span>
                                            </div>
                                            <div className="relative h-4 flex items-center">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={exitQuantityPercent}
                                                    onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                                                    className="slider w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exit Condition</label>
                                    <div className="space-y-3">
                                        <select
                                            name="exitCondition"
                                            className="form-select w-full"
                                        >
                                            <option value="">Select reason...</option>
                                            {exitConditions.map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                            {DEFAULT_CONDITIONS.EXIT.filter(name => !exitConditions.some(c => c.name === name)).map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Performance & Review */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 pb-2 border-b border-white/5">5. Performance & Review</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <div className={`p-6 rounded-2xl border transition-all ${pnl >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Estimated PnL</span>
                                                <div className={`text-3xl font-mono font-bold mt-2 ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className={`text-xl font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {pnl >= 0 ? '▲' : '▼'} {Math.abs(pnlPercent).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks / Trade Notes</label>
                                        <textarea name="remarks" rows={4} className="form-input resize-none" placeholder="Describe your logic, emotions, or mistakes..." />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chart Images</label>

                                    <div className="grid grid-cols-2 gap-4">
                                        {imagePreviews.map((img, index) => (
                                            <div key={index} className={`image-thumbnail ${selectedImageIndex === index ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0B0F1A]' : ''}`} onClick={() => setSelectedImageIndex(index)}>
                                                <img src={img.preview} alt={`Upload ${index + 1}`} />
                                                <div className="image-thumbnail-overlay">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{selectedImageIndex === index ? 'Selected' : 'View'}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(index); if (selectedImageIndex === index) setSelectedImageIndex(null); }}
                                                    className="image-delete-btn"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                                {img.progress < 100 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {imagePreviews.length < 3 && (
                                            <div
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                                className="aspect-square rounded-xl border-2 border-white/10 border-dashed hover:border-blue-500/50 hover:bg-white/[0.02] transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 group-hover:text-blue-400">Add Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Chart Selection Preview */}
                                    {selectedImageIndex !== null && imagePreviews[selectedImageIndex] && (
                                        <div className="mt-4 animate-in zoom-in-95 duration-200">
                                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                                                <img
                                                    src={imagePreviews[selectedImageIndex].preview}
                                                    alt="Selected chart"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImageIndex(selectedImageIndex)}
                                                        className="text-[10px] font-bold text-white uppercase tracking-widest bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg"
                                                    >
                                                        Fullscreen Mode
                                                    </button>
                                                </div>
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-blue-400 uppercase tracking-widest border border-white/10">
                                                    Selected Chart
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <input type="file" id="image-upload" multiple name="images" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <button
                                type="button"
                                onClick={close}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-8 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Logging...
                                    </span>
                                ) : 'Finalize & Log Trade'}
                            </button>
                        </div>
                        {state?.error && <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold text-center">{state.error}</div>}
                    </form>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {selectedImageIndex !== null && imagePreviews[selectedImageIndex] && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="relative max-w-5xl w-full">
                        <div className="relative bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        {imagePreviews[selectedImageIndex!].file.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                        {(imagePreviews[selectedImageIndex!].file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedImageIndex(null)}
                                    className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative group">
                                <img
                                    src={imagePreviews[selectedImageIndex].preview}
                                    alt="Preview"
                                    className="w-full max-h-[75vh] object-contain"
                                />
                                {imagePreviews.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImageIndex(selectedImageIndex! > 0 ? selectedImageIndex! - 1 : imagePreviews.length - 1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setSelectedImageIndex(selectedImageIndex! < imagePreviews.length - 1 ? selectedImageIndex! + 1 : 0)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    <span>{selectedImageIndex + 1} of {imagePreviews.length}</span>
                                    <button
                                        onClick={() => removeImage(selectedImageIndex!)}
                                        className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        Delete Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Symbol Selector Modal */}
            {
                showSymbolSelector && (
                    <SymbolSelector
                        isFutures={segment === 'CRYPTO'}
                        segment={segment as any}
                        onSelect={handleSymbolSelect}
                        onClose={() => setShowSymbolSelector(false)}
                    />
                )
            }
        </div >
    );
}
