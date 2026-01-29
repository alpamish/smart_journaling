import {
    fetchSpotTradingPairs,
    fetchFuturesTradingPairs,
    fetchSymbolPrice as fetchBinancePrice,
    formatPrice,
    formatVolume
} from './binance-api';

export type MarketSegment = 'CRYPTO' | 'FOREX' | 'STOCK' | 'COMMODITY' | 'FUTURES';

export interface MarketSymbol {
    symbol: string;
    name: string;
    price: string;
    changePercent: string;
    volume: string;
    segment: MarketSegment;
    exchange?: string;
}

export async function fetchSymbols(segment: MarketSegment, isFutures: boolean = false): Promise<MarketSymbol[]> {
    if (segment === 'CRYPTO') {
        const pairs = isFutures ? await fetchFuturesTradingPairs() : await fetchSpotTradingPairs();
        return pairs.map(p => ({
            symbol: p.symbol,
            name: `${p.baseAsset}/${p.quoteAsset}`,
            price: p.price,
            changePercent: p.priceChangePercent,
            volume: p.volume,
            segment: 'CRYPTO'
        }));
    }
    return [];
}

export async function searchSymbols(query: string, segment: MarketSegment): Promise<MarketSymbol[]> {
    if (segment === 'CRYPTO') {
        const pairs = await fetchSpotTradingPairs();
        return pairs
            .filter(p => p.symbol.toLowerCase().includes(query.toLowerCase()))
            .map(p => ({
                symbol: p.symbol,
                name: `${p.baseAsset}/${p.quoteAsset}`,
                price: p.price,
                changePercent: p.priceChangePercent,
                volume: p.volume,
                segment: 'CRYPTO'
            }));
    }
    return [];
}

export async function fetchPrice(symbol: string, segment: MarketSegment, isFutures: boolean = false): Promise<string | null> {
    if (segment === 'CRYPTO') {
        return fetchBinancePrice(symbol, isFutures);
    }
    return null;
}

export { formatPrice, formatVolume };
