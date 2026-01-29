'use client';

import { useActionState, useState, useEffect } from 'react';
import { createSpotHolding } from '@/app/lib/actions';
import { X, Coins, Target, Info, Hash, ArrowUpRight, Save, Layout, Search } from 'lucide-react';
import SymbolSelector from '../grid/symbol-selector';

export default function AddHoldingForm({ accountId, close }: { accountId: string, close: () => void }) {
    const createHoldingWithId = createSpotHolding.bind(null, accountId);
    const [state, formAction, isPending] = useActionState(createHoldingWithId, null);
    const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);
    const [assetSymbol, setAssetSymbol] = useState<string>('');
    const [currentPrice, setCurrentPrice] = useState<string>('');

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    const handleSymbolSelect = (selectedSymbol: string, price: string) => {
        // Extract base asset from symbol (e.g., BTCUSDT -> BTC)
        const baseAsset = selectedSymbol.replace('USDT', '');
        setAssetSymbol(baseAsset);
        setCurrentPrice(price);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 animate-in fade-in">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Coins className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Add Spot Holding</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">New Portfolio Position</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={formAction} className="p-6 space-y-6">
                    {/* Asset Symbol */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <Hash className="h-4 w-4 text-primary/60" />
                            Asset Symbol
                        </label>
                        <div className="relative group">
                            <div className="relative">
                                <input
                                    type="text"
                                    name="assetSymbol"
                                    value={assetSymbol}
                                    onChange={(e) => setAssetSymbol(e.target.value.toUpperCase())}
                                    onFocus={() => setShowSymbolSelector(true)}
                                    required
                                    placeholder="Click to browse assets"
                                    className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase font-medium"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {currentPrice && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Current price: <span className="font-semibold text-foreground">${parseFloat(currentPrice).toLocaleString()}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quantity and Avg Price Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Layout className="h-4 w-4 text-primary/60" />
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                step="any"
                                required
                                placeholder="0.00"
                                className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <ArrowUpRight className="h-4 w-4 text-primary/60" />
                                Avg Buy Price
                            </label>
                            <input
                                type="number"
                                name="avgEntryPrice"
                                step="any"
                                required
                                placeholder="0.00"
                                className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Target Price and Status Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Target className="h-4 w-4 text-primary/60" />
                                Target Price
                            </label>
                            <input
                                type="number"
                                name="targetPrice"
                                step="any"
                                placeholder="optional"
                                className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                                <Info className="h-4 w-4 text-primary/60" />
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue="HODLING"
                                className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="HODLING">HODLING</option>
                                <option value="STAKED">STAKED</option>
                                <option value="LOCKED">LOCKED</option>
                                <option value="SOLD">SOLD</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <Info className="h-4 w-4 text-primary/60" />
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            rows={2}
                            placeholder="Add strategy notes or details..."
                            className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {state?.error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 animate-in slide-in-from-top-1">
                            <div className="flex items-center gap-2 font-medium">
                                <X className="h-4 w-4" />
                                {state.error}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={close}
                            className="h-11 rounded-xl px-5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative h-11 flex items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
                        >
                            {isPending ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    Add Holding
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Symbol Selector Modal */}
            {showSymbolSelector && (
                <SymbolSelector
                    isFutures={false}
                    segment="CRYPTO"
                    onSelect={handleSymbolSelect}
                    onClose={() => setShowSymbolSelector(false)}
                />
            )}
        </div>
    );
}
