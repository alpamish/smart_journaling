import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Account, Trade, GridStrategy, SpotHolding } from '@prisma/client';

export async function fetchUserAccounts(): Promise<Account[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const accounts = await prisma.account.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return accounts;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch accounts.');
    }
}

export async function fetchAccountById(id: string): Promise<Account | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const account = await prisma.account.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
        });
        return account;
    } catch (error) {
        console.error('Fetch Account Error:', error);
        return null;
    }
}

export async function fetchTradesByAccountId(accountId: string): Promise<Trade[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        // First verify ownership
        const account = await prisma.account.findUnique({
            where: {
                id: accountId,
                userId: session.user.id,
            },
        });

        if (!account) return [];

        const trades = await prisma.trade.findMany({
            where: {
                accountId,
            },
            include: {
                images: true,
            },
            orderBy: {
                entryDate: 'desc',
            },
        });
        return trades;

    } catch (error) {
        console.error('Fetch Trades Error:', error);
        return [];
    }
}

export async function fetchGridStrategies(accountId: string): Promise<GridStrategy[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const strategies = await prisma.gridStrategy.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
        return strategies;
    } catch (error) {
        console.error('Fetch Grids Error:', error);
        return [];
    }
}

export async function fetchSpotHoldings(accountId: string): Promise<SpotHolding[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const holdings = await prisma.spotHolding.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
        return holdings;
    } catch (error) {
        console.error('Fetch Holdings Error:', error);
        return [];
    }
}

export async function fetchAnalyticsData(accountId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId }
        });

        if (!account) return null;

        const trades = await prisma.trade.findMany({
            where: {
                accountId,
                status: 'CLOSED'
            },
            orderBy: { exitDate: 'asc' }
        });

        const closedGrids = await prisma.gridStrategy.findMany({
            where: { accountId, status: 'CLOSED' },
            orderBy: { updatedAt: 'asc' }
        });

        const soldHoldings = await prisma.spotHolding.findMany({
            where: { accountId, status: 'SOLD' },
            orderBy: { updatedAt: 'asc' }
        });

        // 1. Create a unified "Profit/Loss Events" list for timeline and stats
        const allEvents = [
            ...trades.map(t => ({
                type: 'TRADE',
                pnl: Number(t.netPnL || 0),
                date: t.exitDate || t.updatedAt,
                symbol: t.symbol
            })),
            ...closedGrids.map(g => ({
                type: 'GRID',
                pnl: Number(g.totalProfit || 0),
                date: g.updatedAt,
                symbol: g.symbol
            })),
            ...soldHoldings.map(h => ({
                type: 'HOLDING',
                pnl: (Number(h.exitPrice || 0) - Number(h.avgEntryPrice || 0)) * Number(h.quantity || 0),
                date: h.updatedAt,
                symbol: h.assetSymbol
            }))
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 2. Initial Stats Calculation
        const totalEvents = allEvents.length;
        const winners = allEvents.filter(e => e.pnl > 0);
        const losers = allEvents.filter(e => e.pnl < 0);

        const grossProfit = winners.reduce((sum, e) => sum + e.pnl, 0);
        const grossLoss = Math.abs(losers.reduce((sum, e) => sum + e.pnl, 0));

        const winRate = totalEvents > 0 ? (winners.length / totalEvents) * 100 : 0;
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
        const totalPnL = grossProfit - grossLoss;

        const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
        const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;

        // 3. Unified Equity Curve & Max Drawdown
        let runningBalance = account.initialBalance;
        let maxBalance = account.initialBalance;
        let maxDD = 0;
        const equityCurve = [{ date: 'Start', balance: runningBalance, pnl: 0 }];

        allEvents.forEach(event => {
            runningBalance += event.pnl;

            if (runningBalance > maxBalance) {
                maxBalance = runningBalance;
            }
            const dd = maxBalance > 0 ? ((maxBalance - runningBalance) / maxBalance) * 100 : 0;
            if (dd > maxDD) {
                maxDD = dd;
            }

            equityCurve.push({
                date: new Date(event.date).toLocaleDateString(),
                balance: runningBalance,
                pnl: event.pnl
            });
        });

        // 4. Time-based Stats (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const lastMonthPnL = allEvents
            .filter(e => new Date(e.date) >= thirtyDaysAgo)
            .reduce((sum, e) => sum + e.pnl, 0);

        const previousBalance = runningBalance - lastMonthPnL;
        const monthlyReturn = previousBalance > 0 ? (lastMonthPnL / previousBalance) * 100 : 0;

        // 5. Daily Performance Breakdown
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayPerformance = dayNames.map(name => ({ date: name, value: 0 }));
        allEvents.forEach(e => {
            const dayIndex = new Date(e.date).getDay();
            dayPerformance[dayIndex].value += e.pnl;
        });

        // 6. Asset Performance Breakdown
        const assetMap: Record<string, { symbol: string, pnl: number, trades: number, wins: number }> = {};
        allEvents.forEach(e => {
            if (!assetMap[e.symbol]) {
                assetMap[e.symbol] = { symbol: e.symbol, pnl: 0, trades: 0, wins: 0 };
            }
            assetMap[e.symbol].pnl += e.pnl;
            assetMap[e.symbol].trades += 1;
            if (e.pnl > 0) assetMap[e.symbol].wins += 1;
        });

        const sortedAssetPerformance = Object.values(assetMap)
            .sort((a, b) => b.pnl - a.pnl)
            .map(a => ({
                ...a,
                winRate: ((a.wins / a.trades) * 100).toFixed(1),
                pnl: a.pnl.toFixed(2)
            }));

        // 7. General Counts
        const totalTradesCount = await prisma.trade.count({ where: { accountId } });
        const totalParentTrades = await prisma.trade.count({
            where: { accountId, parentId: null }
        });

        let totalDays = 0;
        if (allEvents.length > 0) {
            const start = new Date(allEvents[0].date);
            const end = new Date(allEvents[allEvents.length - 1].date);
            totalDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }

        // 8. Active Portfolio metrics
        const activeHoldings = await prisma.spotHolding.findMany({
            where: { accountId, status: { not: 'SOLD' } }
        });
        const totalHoldingsValue = activeHoldings.reduce((sum, h) => sum + (h.quantity * (h.avgEntryPrice || 0)), 0);
        const portfolioCount = new Set(activeHoldings.map(h => h.assetSymbol)).size;

        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const lastDayPnL = allEvents
            .filter(e => new Date(e.date) >= twentyFourHoursAgo)
            .reduce((sum, e) => sum + e.pnl, 0);

        const lastDaySpotPnL = allEvents
            .filter(e => e.type === 'HOLDING' && new Date(e.date) >= twentyFourHoursAgo)
            .reduce((sum, e) => sum + e.pnl, 0);

        const totalGridPnL = allEvents.filter(e => e.type === 'GRID').reduce((sum, e) => sum + e.pnl, 0);
        const totalHoldingPnL = allEvents.filter(e => e.type === 'HOLDING').reduce((sum, e) => sum + e.pnl, 0);
        const totalTradePnL = allEvents.filter(e => e.type === 'TRADE').reduce((sum, e) => sum + e.pnl, 0);

        return {
            stats: {
                totalTrades: totalTradesCount,
                totalTradesCount,
                total_parent_trade: totalParentTrades,
                winRate: winRate.toFixed(1),
                profitFactor: profitFactor.toFixed(2),
                totalPnL: totalPnL.toFixed(2),
                total_pnl: totalPnL.toFixed(2),
                totalTradePnL: totalTradePnL.toFixed(2),
                totalGridPnL: totalGridPnL.toFixed(2),
                totalHoldingPnL: totalHoldingPnL.toFixed(2),
                avgWin: avgWin.toFixed(2),
                avgLoss: avgLoss.toFixed(2),
                monthlyReturn: monthlyReturn.toFixed(1),
                totalHoldings: totalHoldingsValue.toFixed(2),
                portfolioCount: portfolioCount,
                dailyChange: lastDayPnL.toFixed(2),
                dailySpotChange: lastDaySpotPnL.toFixed(2),
                maxDrawdown: maxDD.toFixed(2),
                totalDays: totalDays,
                avgTradePnL: totalEvents > 0 ? (totalPnL / totalEvents).toFixed(2) : '0.00'
            },
            equityCurve,
            assetPerformance: sortedAssetPerformance,
            dayPerformance
        };

    } catch (error) {
        console.error('Fetch Analytics Error:', error);
        return null;
    }
}
