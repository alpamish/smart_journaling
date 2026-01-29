'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, TrendingUp, TrendingDown, Info, Tag, MessageSquare, Image as ImageIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Clock, Timer } from 'lucide-react';
import { Trade, Image as TradeImage } from '@prisma/client';

type TradeWithImages = Trade & {
    images: TradeImage[];
    parentId?: string | null;
};

export default function TradeDetailModal({
    trade,
    children = [],
    onClose
}: {
    trade: TradeWithImages,
    children?: Trade[],
    onClose: () => void
}) {
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Aggregate Calculations
    const totalRealizedPnL = (trade.netPnL || 0) + children.reduce((sum, child) => sum + (child.netPnL || 0), 0);
    const totalInitialQuantity = (trade.quantity || 0) + children.reduce((sum, child) => sum + (child.exitQuantity || 0), 0);
    const totalMarginUsed = (trade.marginUsed || 0) + children.reduce((sum, child) => sum + (child.marginUsed || 0), 0);
    const avgPnLPercent = totalMarginUsed > 0 ? (totalRealizedPnL / totalMarginUsed) * 100 : 0;

    // Combined Exit Calculations
    const allExits = [
        ...children.map(c => ({ qty: c.exitQuantity || 0, price: c.exitPrice || 0, pnl: c.netPnL || 0 })),
        ...(trade.status === 'CLOSED' ? [{ qty: trade.exitQuantity || 0, price: trade.exitPrice || 0, pnl: trade.netPnL || 0 }] : [])
    ];
    const totalExitedQty = allExits.reduce((sum, e) => sum + e.qty, 0);
    const weightedAvgExitPrice = totalExitedQty > 0
        ? allExits.reduce((sum, e) => sum + (e.price * e.qty), 0) / totalExitedQty
        : (trade.exitPrice || 0);

    const isWin = totalRealizedPnL > 0;
    const hasHistory = children.length > 0;
    const hasExits = allExits.length > 0;

    // Zoom controls
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
    const handleResetZoom = () => {
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
    };

    // Mouse wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    // Drag to pan functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoomLevel > 1) {
            setPanPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Reset zoom when changing images
    useEffect(() => {
        const timer = setTimeout(() => {
            setZoomLevel(1);
            setPanPosition({ x: 0, y: 0 });
        }, 0);
        return () => clearTimeout(timer);
    }, [currentImageIndex]);

    // Keyboard navigation for image viewer
    useEffect(() => {
        if (!imageViewerOpen || !trade.images) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : trade.images.length - 1));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCurrentImageIndex((prev) => (prev < trade.images.length - 1 ? prev + 1 : 0));
                    break;
                case 'Escape':
                    e.preventDefault();
                    setImageViewerOpen(false);
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    handleZoomIn();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    handleZoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    handleResetZoom();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [imageViewerOpen, trade.images, currentImageIndex]);

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{trade.symbol}</h2>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trade.side === 'LONG'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                    }`}>
                                    {trade.side}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${trade.status === 'OPEN'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {trade.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Logged on {new Date(trade.createdAt).toLocaleDateString()} at {new Date(trade.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
                        {/* Performance Summary */}
                        {(trade.status === 'CLOSED' || hasHistory) && (
                            <div className={`p-6 rounded-2xl border flex items-center justify-between ${isWin
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'
                                }`}>
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {trade.status === 'OPEN' ? 'Realized from Partials' : 'Total Realized PnL'}
                                    </span>
                                    <div className={`text-3xl font-mono font-bold mt-1 ${isWin ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                        {totalRealizedPnL >= 0 ? '+' : ''}{totalRealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        <span className="text-sm ml-1 font-normal opacity-70">USD</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`flex items-center gap-2 text-xl font-bold ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {isWin ? <TrendingUp /> : <TrendingDown />}
                                        {Math.abs(avgPnLPercent).toFixed(2)}%
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">On Total Margin</p>
                                </div>
                            </div>
                        )}

                        {/* Entry/Exit Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Entry Details */}
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                    Entry Details
                                </div>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Price</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">${trade.entryPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Initial Quantity</span>
                                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{totalInitialQuantity.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Leverage</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.leverage}X ({trade.marginMode})</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Margin Used</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">${trade.marginUsed?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Trade Type</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                                            <Timer className="w-3.5 h-3.5 text-slate-400" />
                                            {trade.tradeType || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Session</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {trade.session || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Entry Date & Time</span>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(trade.entryDate).toLocaleString()}
                                        </p>
                                    </div>
                                    {trade.entryCondition && (
                                        <div className="col-span-2">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Entry Condition</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Tag className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold">{trade.entryCondition}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Exit Details */}
                            <div className={`space-y-4 p-5 rounded-2xl border ${trade.status === 'CLOSED'
                                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                : 'bg-slate-50/30 dark:bg-slate-800/20 border-dashed border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trade.status === 'CLOSED' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                        <TrendingDown className="w-4 h-4 rotate-180" />
                                    </div>
                                    Exit Details
                                </div>
                                {hasExits ? (
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Exit Price</span>
                                            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">${weightedAvgExitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Total Exited Quantity</span>
                                            <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{totalExitedQty?.toLocaleString()}</p>
                                        </div>

                                        {allExits.length > 0 && (
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Exit Breakdown</span>
                                                <div className="flex items-center flex-wrap gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                                                    {allExits.map((exit, i) => (
                                                        <div key={i} className="flex items-center gap-4">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{exit.qty.toLocaleString()}</span>
                                                                <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-700 my-1"></div>
                                                                <span className="text-[10px] text-slate-500 font-mono font-bold">${exit.price.toLocaleString()}</span>
                                                                <span className={`text-[10px] font-bold mt-1 ${exit.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {exit.pnl >= 0 ? '+' : ''}${Math.abs(exit.pnl).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {i < allExits.length - 1 && <span className="text-slate-300 font-bold text-lg">+</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-span-2">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold">Last Exit Date & Time</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {(children.length > 0 ? (new Date(Math.max(...children.map(c => new Date(c.exitDate || c.createdAt).getTime())))) : (trade.exitDate ? new Date(trade.exitDate) : new Date())).toLocaleString()}
                                            </p>
                                        </div>
                                        {trade.exitCondition && (
                                            <div className="col-span-2">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Exit Condition</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                                                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded text-xs font-bold">{trade.exitCondition}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                        <Info className="w-8 h-8 text-slate-300 mb-2" />
                                        <p className="text-sm text-slate-400">Position remains open.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Risk Management */}
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4 uppercase tracking-widest text-[10px]">
                                Risk Management
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-start text-left">
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Stop Loss</span>
                                    <p className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{trade.stopLoss ? `$${trade.stopLoss.toLocaleString()}` : 'Not Set'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Take Profit</span>
                                    <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{trade.takeProfit ? `$${trade.takeProfit.toLocaleString()}` : 'Not Set'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Timeframe (Analysis)</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.analysisTimeframe || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Timeframe (Entry)</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{trade.entryTimeframe || 'N/A'}</p>
                                </div>
                                {trade.liquidationPrice && (
                                    <div className="md:col-span-1">
                                        <span className="text-[10px] text-orange-500 uppercase font-bold">Liq. Price</span>
                                        <p className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">${trade.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remarks */}
                        {trade.remarks && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Remarks & Notes
                                </div>
                                <div className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    &ldquo;{trade.remarks}&rdquo;
                                </div>
                            </div>
                        )}

                        {/* Images Section */}
                        {trade.images && trade.images.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase tracking-widest text-[10px]">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Performance Evidence ({trade.images.length})
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {trade.images.map((img, index) => (
                                        <div key={img.id} className="relative group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md cursor-pointer" onClick={() => {
                                            setCurrentImageIndex(index);
                                            setImageViewerOpen(true);
                                        }}>
                                            <img
                                                src={img.url}
                                                alt="Trade Evidence"
                                                className="w-full h-auto object-cover max-h-64 transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    View Full Size
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                        >
                            Close Detail View
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Viewer Modal */}
            {imageViewerOpen && trade.images && (
                <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setImageViewerOpen(false)}>
                    <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setImageViewerOpen(false)}
                            className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Navigation Arrows */}
                        {trade.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : trade.images.length - 1));
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev < trade.images.length - 1 ? prev + 1 : 0));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </>
                        )}

                        {/* Zoom Controls */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomIn();
                                }}
                                className="rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomOut();
                                }}
                                className="rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetZoom();
                                }}
                                className="rounded-full p-2 bg-black/50 text-white hover:bg-black/70 transition-colors"
                                title="Reset Zoom (0)"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Zoom Level Indicator */}
                        {zoomLevel > 1 && (
                            <div className="absolute top-20 left-4 z-10 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                                {Math.round(zoomLevel * 100)}%
                            </div>
                        )}

                        {/* Image */}
                        <div
                            className="overflow-hidden cursor-move"
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ cursor: isDragging && zoomLevel > 1 ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default' }}
                        >
                            <img
                                src={trade.images[currentImageIndex].url}
                                alt={`Trade Evidence ${currentImageIndex + 1}`}
                                className="transition-opacity duration-300"
                                style={{
                                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                                    transformOrigin: 'center',
                                    userSelect: 'none',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentImageIndex + 1} of {trade.images.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
