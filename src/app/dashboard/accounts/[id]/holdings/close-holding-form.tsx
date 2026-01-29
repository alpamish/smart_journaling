'use client';

import { useActionState, useEffect } from 'react';
import { closeSpotHolding } from '@/app/lib/actions';
import { X, Target, Info, Save, TrendingUp } from 'lucide-react';

export default function CloseHoldingForm({
    holdingId,
    accountId,
    assetSymbol,
    maxQuantity,
    close
}: {
    holdingId: string,
    accountId: string,
    assetSymbol: string,
    maxQuantity: number,
    close: () => void
}) {
    const closeHoldingWithId = closeSpotHolding.bind(null, holdingId, accountId);
    const [state, formAction, isPending] = useActionState(closeHoldingWithId, null);

    useEffect(() => {
        if (state?.success) {
            close();
        }
    }, [state, close]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-card/95 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Close {assetSymbol}</h2>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Execute Exit Strategy</p>
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
                    {/* Exit Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <TrendingUp className="h-4 w-4 text-primary/60" />
                            Exit Quantity (Max: {maxQuantity})
                        </label>
                        <input
                            type="number"
                            name="exitQuantity"
                            step="any"
                            required
                            defaultValue={maxQuantity}
                            max={maxQuantity}
                            min={0.00000001}
                            placeholder="0.00"
                            className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>

                    {/* Exit Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <Target className="h-4 w-4 text-primary/60" />
                            Exit Price
                        </label>
                        <input
                            type="number"
                            name="exitPrice"
                            step="any"
                            required
                            placeholder="0.00"
                            className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>

                    {/* New Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                            <Info className="h-4 w-4 text-primary/60" />
                            Set Status To
                        </label>
                        <select
                            name="status"
                            defaultValue="SOLD"
                            className="h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none cursor-pointer"
                        >
                            <option value="SOLD">SOLD</option>
                            <option value="HODLING">STILL HODLING (Partial?)</option>
                            <option value="LOCKED">LOCKED</option>
                        </select>
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
                                    Close Position
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
