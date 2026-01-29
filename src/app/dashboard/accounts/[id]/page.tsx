import { fetchAccountById, fetchTradesByAccountId, fetchGridStrategies, fetchSpotHoldings } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import AccountDashboard from './account-dashboard';
import { fetchAnalyticsData } from '@/app/lib/data';
import { Trade, Image as TradeImage } from '@prisma/client';

interface TradeWithImages extends Trade {
    images: TradeImage[];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const account = await fetchAccountById(id);
    const trades = await fetchTradesByAccountId(id) as TradeWithImages[];
    const analytics = await fetchAnalyticsData(id);
    const strategies = await fetchGridStrategies(id);
    const holdings = await fetchSpotHoldings(id);

    if (!account) {
        notFound();
    }

    return (
        <AccountDashboard
            accountId={id}
            account={account}
            trades={trades}
            analytics={analytics || { stats: {}, equityCurve: [], assetPerformance: [], dayPerformance: [] }}
            strategies={strategies}
            holdings={holdings}
        />
    );
}
