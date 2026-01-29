import { fetchAccountById, fetchTradesByAccountId, fetchGridStrategies, fetchSpotHoldings } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import LogTradeButton from './log-trade-button';
import GridList from './grid/grid-list';
import CreateGridButton from './grid/create-grid-button';
import AddHoldingButton from './holdings/add-holding-button';
import HoldingsList from './holdings/holdings-list';
import OptimizedStatsCards from './analytics/optimized-stats-cards';
import OptimizedChart from './analytics/optimized-chart';
import TradeDetailButton from './trade-detail-button';
import OptimizedTradesTable from './optimized-trades-table';
import OptimizedDashboardLayout, { CollapsibleSection } from './components/optimized-dashboard-layout';
import PerformanceMonitor from './components/performance-monitor';
import AdvancedDataFilter from './components/advanced-data-filter';
import { fetchAnalyticsData } from '@/app/lib/data';
import { Trade, Image as TradeImage } from '@prisma/client';
import { Suspense } from 'react';

interface TradeWithImages extends Trade {
    images: TradeImage[];
}



// Loading fallback components
function StatsCardsLoading() {
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

function ChartLoading() {
    return (
        <div className="premium-card p-6 animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
        </div>
    );
}

// Dashboard content component
async function DashboardContent({ id }: { id: string }) {
    const account = await fetchAccountById(id);
    const trades = await fetchTradesByAccountId(id) as TradeWithImages[];
    const analytics = await fetchAnalyticsData(id);
    const strategies = await fetchGridStrategies(id);
    const holdings = await fetchSpotHoldings(id);

    if (!account) {
        notFound();
    }

    return (
        <PerformanceMonitor showPerformanceInfo={false}>
            <OptimizedDashboardLayout
                sidebar={
                    <CollapsibleSection title="Account Balance" defaultExpanded={true}>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: account.currency,
                                    }).format(account.currentBalance)}
                                </p>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Initial Balance</span>
                                    <span className="font-medium text-foreground">${account.initialBalance}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                }
            >
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-primary px-6 py-12 text-primary-foreground md:px-12 md:py-16 lg:col-span-full">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
                        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl">
                        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                    {account.type} Account
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{account.name}</h1>
                            </div>
                            <div className="flex flex-col items-start gap-1 md:items-end">
                                <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/60">Current Equity</p>
                                <p className="text-4xl font-bold md:text-5xl">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: account.currency,
                                    }).format(account.equity)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Overview */}
                <CollapsibleSection
                    title="Performance Analytics"
                    defaultExpanded={true}
                    headerActions={
                        <div className="text-sm text-muted-foreground">
                            {trades.length} trades analyzed
                        </div>
                    }
                >
                    <div className="space-y-8">
                        <Suspense fallback={<StatsCardsLoading />}>
                            {analytics?.stats ? (
                                <OptimizedStatsCards stats={analytics.stats} isLoading={false} />
                            ) : (
                                <StatsCardsLoading />
                            )}
                        </Suspense>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Suspense fallback={<ChartLoading />}>
                                <OptimizedChart
                                    data={(analytics?.equityCurve || []).map(item => ({
                                        date: item.date,
                                        value: item.balance
                                    }))}
                                    type="equity"
                                    isLoading={!analytics}
                                />
                            </Suspense>
                            <Suspense fallback={<ChartLoading />}>
                                <OptimizedChart
                                    data={(analytics?.equityCurve || []).map(item => ({
                                        date: item.date,
                                        value: item.pnl
                                    }))}
                                    type="pnl"
                                    isLoading={!analytics}
                                />
                            </Suspense>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Grid Strategy Section */}
                    <CollapsibleSection
                        title="Active Grid Strategies"
                        defaultExpanded={true}
                        headerActions={<CreateGridButton accountId={id} account={account} />}
                    >
                        <GridList strategies={strategies} accountId={id} />
                    </CollapsibleSection>

                    {/* Spot Holdings Section */}
                    <CollapsibleSection
                        title="Spot Holdings"
                        defaultExpanded={false}
                        headerActions={<AddHoldingButton accountId={id} />}
                    >
                        <HoldingsList holdings={holdings} accountId={id} />
                    </CollapsibleSection>

                    {/* Trades Section */}
                    <CollapsibleSection
                        title="Trade Journal"
                        defaultExpanded={true}
                        headerActions={<LogTradeButton accountId={id} balance={account.currentBalance} />}
                    >
                        <div className="space-y-4">
                            <AdvancedDataFilter
                                data={trades}
                                onFilterChange={() => { }} // OptimizedTradesTable handles this internally
                            />
                            <div className="premium-card overflow-hidden !p-0">
                                <OptimizedTradesTable trades={trades} />
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <CollapsibleSection title="Account Balance" defaultExpanded={true}>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: account.currency,
                                    }).format(account.currentBalance)}
                                </p>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Initial Balance</span>
                                    <span className="font-medium text-foreground">${account.initialBalance}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            </OptimizedDashboardLayout>
        </PerformanceMonitor>
    );
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            }>
                <DashboardContent id={id} />
            </Suspense>
        </div>
    );
}