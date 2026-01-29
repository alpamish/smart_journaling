'use client';

import React, { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart3 } from 'lucide-react';

interface StatsData {
    totalPnL: string;
    winRate: string;
    profitFactor: string;
    avgWin: string;
    avgLoss: string;
    totalTrades: number;
}

interface OptimizedStatsCardsProps {
    stats: StatsData;
    isLoading?: boolean;
}

const StatCard = memo(({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    iconColor, 
    valueColor, 
    trend 
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    iconColor: string;
    valueColor: string;
    trend?: 'up' | 'down' | 'neutral';
}) => {
    return (
        <div className="stat-card text-foreground group">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                <div className={`rounded-full p-2 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
                {value}
            </p>
            {subtitle && (
                <div className="flex items-center gap-1 text-xs">
                    {trend && (
                        trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : trend === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                        ) : null
                    )}
                    <span className="text-muted-foreground">{subtitle}</span>
                </div>
            )}
        </div>
    );
});

StatCard.displayName = 'StatCard';

export default memo(function OptimizedStatsCards({ stats, isLoading }: OptimizedStatsCardsProps) {
    // Memoize processed stats
    const processedStats = useMemo(() => {
        if (!stats || isLoading) return null;

        const totalPnL = Number(stats.totalPnL);
        const isProfitable = totalPnL >= 0;
        
        return {
            totalPnL: {
                value: totalPnL >= 0 ? `+$${totalPnL.toLocaleString()}` : `-$${Math.abs(totalPnL).toLocaleString()}`,
                color: isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                iconColor: isProfitable ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600',
                trend: (isProfitable ? 'up' : 'down') as 'up' | 'down',
                subtitle: isProfitable ? 'Profitable' : 'Drawdown'
            },
            winRate: {
                value: `${stats.winRate}%`,
                subtitle: `Based on ${stats.totalTrades} trades`,
                iconColor: 'bg-blue-500/10 text-blue-600',
                color: 'text-foreground'
            },
            profitFactor: {
                value: stats.profitFactor,
                iconColor: 'bg-purple-500/10 text-purple-600',
                color: 'text-foreground',
                showProgress: true,
                progressPercent: Math.min((Number(stats.profitFactor) / 3) * 100, 100)
            },
            avgWinLoss: {
                avgWin: stats.avgWin,
                avgLoss: stats.avgLoss,
                iconColor: 'bg-orange-500/10 text-orange-600'
            }
        };
    }, [stats, isLoading]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="stat-card animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!processedStats) return null;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total PnL */}
            <StatCard
                title="Total PnL"
                value={processedStats.totalPnL.value}
                subtitle={processedStats.totalPnL.subtitle}
                icon={DollarSign}
                iconColor={processedStats.totalPnL.iconColor}
                valueColor={processedStats.totalPnL.color}
                trend={processedStats.totalPnL.trend}
            />

            {/* Win Rate */}
            <StatCard
                title="Win Rate"
                value={processedStats.winRate.value}
                subtitle={processedStats.winRate.subtitle}
                icon={Target}
                iconColor={processedStats.winRate.iconColor}
                valueColor={processedStats.winRate.color}
            />

            {/* Profit Factor */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Profit Factor</p>
                    <div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
                        <Activity className="h-5 w-5" />
                    </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{processedStats.profitFactor.value}</p>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                            className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${processedStats.profitFactor.progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Avg Win / Loss Ratio */}
            <div className="stat-card text-foreground group">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Win/Loss</p>
                    <div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">${processedStats.avgWinLoss.avgWin}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">Avg Win</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            ${processedStats.avgWinLoss.avgLoss === '0.00' ? '-' : processedStats.avgWinLoss.avgLoss}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">Avg Loss</p>
                    </div>
                </div>
            </div>
        </div>
    );
});