import { Trade, Image, SpotHolding, Account } from '@prisma/client';

export interface TradeWithImages extends Trade {
    images: Image[];
}

export interface Holding extends SpotHolding {
    // Add any extra fields if needed, but Prisma types usually suffice
}

export interface AnalyticsData {
    stats: {
        totalTrades?: number;
        totalTradesCount?: number;
        winRate?: string;
        profitFactor?: string;
        totalPnL?: string;
        total_pnl?: string;
        totalTradePnL?: string;
        total_parent_trade?: number;
        monthlyReturn?: string;
        avgWin?: string;
        avgLoss?: string;
        netPnL?: string;
        totalHoldings?: string;
        totalGridPnL?: string;
        totalHoldingPnL?: string;
        dailyChange?: string;
        dailySpotChange?: string;
        portfolioCount?: number;
        maxDrawdown?: string;
        avgTradePnL?: string;
        totalDays?: number;
    };
    equityCurve: any[];
    assetPerformance: {
        symbol: string;
        pnl: string;
        trades: number;
        winRate: string;
    }[];
    dayPerformance: {
        date: string;
        value: number;
    }[];
}
