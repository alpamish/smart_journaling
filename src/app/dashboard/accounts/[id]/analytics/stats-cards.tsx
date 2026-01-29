import { TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart3 } from 'lucide-react';

export default function StatsCards({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total PnL */}
            <div className="stat-card text-foreground group animate-fade-in">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total PnL</p>
                    <div className={`icon-gradient ${Number(stats.totalPnL) >= 0 ? 'gradient-success' : 'gradient-danger'}`}>
                        <DollarSign className="h-5 w-5 text-white" />
                    </div>
                </div>
                <p className={`text-3xl font-bold tracking-tight mt-2 ${Number(stats.totalPnL) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${stats.totalPnL}
                </p>
                <div className="flex items-center gap-1.5 text-xs mt-1">
                    {Number(stats.totalPnL) >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span className={Number(stats.totalPnL) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {Number(stats.totalPnL) >= 0 ? 'Profitable' : 'Drawdown'}
                    </span>
                </div>
            </div>

            {/* Win Rate */}
            <div className="stat-card text-foreground group animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Win Rate</p>
                    <div className="icon-gradient gradient-info">
                        <Target className="h-5 w-5 text-white" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-3xl font-bold tracking-tight text-foreground">{stats.winRate}%</p>
                    <p className="text-sm text-muted-foreground font-medium">/ 100%</p>
                </div>
                <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${stats.winRate}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Based on {stats.totalTrades} trades</p>
                </div>
            </div>

            {/* Profit Factor */}
            <div className="stat-card text-foreground group animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Profit Factor</p>
                    <div className="icon-gradient gradient-purple">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-2">{stats.profitFactor}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${Math.min((Number(stats.profitFactor) / 3) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                    {Number(stats.profitFactor) >= 2 ? 'Excellent' : Number(stats.profitFactor) >= 1.5 ? 'Good' : 'Needs Improvement'}
                </p>
            </div>

            {/* Avg Win / Loss Ratio */}
            <div className="stat-card text-foreground group animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Avg Win/Loss</p>
                    <div className="icon-gradient gradient-orange">
                        <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">${stats.avgWin}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Avg Win</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="flex-1">
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">${stats.avgLoss === '0.00' ? '-' : stats.avgLoss}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Avg Loss</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
