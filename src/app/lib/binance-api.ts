// Binance API utilities for fetching real-time market data

export interface TradingPair {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    price: string;
    priceChangePercent: string;
    volume: string;
    status: string;
}

export interface TickerPrice {
    symbol: string;
    price: string;
}

export interface Ticker24h {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    askPrice: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    count: number;
}

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES_API_BASE = 'https://fapi.binance.com/fapi/v1';

/**
 * Fetch all spot trading pairs from Binance
 */
export async function fetchSpotTradingPairs(): Promise<TradingPair[]> {
    try {
        const [exchangeInfo, tickers] = await Promise.all([
            fetch(`${BINANCE_API_BASE}/exchangeInfo`).then(res => res.json()),
            fetch(`${BINANCE_API_BASE}/ticker/24hr`).then(res => res.json())
        ]);

        const tickerMap = new Map<string, Ticker24h>(
            tickers.map((t: Ticker24h) => [t.symbol, t])
        );

        return exchangeInfo.symbols
            .filter((s: any) => s.status === 'TRADING' && s.quoteAsset === 'USDT')
            .map((s: any) => {
                const ticker: Ticker24h | undefined = tickerMap.get(s.symbol);
                return {
                    symbol: s.symbol,
                    baseAsset: s.baseAsset,
                    quoteAsset: s.quoteAsset,
                    price: ticker ? ticker.lastPrice : '0',
                    priceChangePercent: ticker ? ticker.priceChangePercent : '0',
                    volume: ticker ? ticker.volume : '0',
                    status: s.status
                };
            })
            .sort((a: TradingPair, b: TradingPair) => {
                // Sort by volume (most traded first)
                return parseFloat(b.volume) - parseFloat(a.volume);
            });
    } catch (error) {
        console.error('Error fetching spot trading pairs:', error);
        return [];
    }
}

/**
 * Fetch all futures trading pairs from Binance
 */
export async function fetchFuturesTradingPairs(): Promise<TradingPair[]> {
    try {
        const [exchangeInfo, tickers] = await Promise.all([
            fetch(`${BINANCE_FUTURES_API_BASE}/exchangeInfo`).then(res => res.json()),
            fetch(`${BINANCE_FUTURES_API_BASE}/ticker/24hr`).then(res => res.json())
        ]);

        const tickerMap = new Map<string, Ticker24h>(
            tickers.map((t: Ticker24h) => [t.symbol, t])
        );

        return exchangeInfo.symbols
            .filter((s: any) => s.status === 'TRADING' && s.quoteAsset === 'USDT' && s.contractType === 'PERPETUAL')
            .map((s: any) => {
                const ticker: Ticker24h | undefined = tickerMap.get(s.symbol);
                return {
                    symbol: s.symbol,
                    baseAsset: s.baseAsset,
                    quoteAsset: s.quoteAsset,
                    price: ticker ? ticker.lastPrice : '0',
                    priceChangePercent: ticker ? ticker.priceChangePercent : '0',
                    volume: ticker ? ticker.volume : '0',
                    status: s.status
                };
            })
            .sort((a: TradingPair, b: TradingPair) => {
                // Sort by volume (most traded first)
                return parseFloat(b.volume) - parseFloat(a.volume);
            });
    } catch (error) {
        console.error('Error fetching futures trading pairs:', error);
        return [];
    }
}

/**
 * Fetch current price for a specific symbol
 */
export async function fetchSymbolPrice(symbol: string, isFutures: boolean = false): Promise<string | null> {
    try {
        const baseUrl = isFutures ? BINANCE_FUTURES_API_BASE : BINANCE_API_BASE;
        const response = await fetch(`${baseUrl}/ticker/price?symbol=${symbol}`);
        const data: TickerPrice = await response.json();
        return data.price;
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return null;
    }
}

/**
 * Fetch 24h ticker data for a specific symbol
 */
export async function fetchSymbol24hTicker(symbol: string, isFutures: boolean = false): Promise<Ticker24h | null> {
    try {
        const baseUrl = isFutures ? BINANCE_FUTURES_API_BASE : BINANCE_API_BASE;
        const response = await fetch(`${baseUrl}/ticker/24hr?symbol=${symbol}`);
        const data: Ticker24h = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching 24h ticker for ${symbol}:`, error);
        return null;
    }
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (numPrice >= 1000) {
        return numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (numPrice >= 1) {
        return numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else if (numPrice >= 0.01) {
        return numPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    } else {
        return numPrice.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
    }
}

/**
 * Format volume to readable format (K, M, B)
 */
export function formatVolume(volume: string | number): string {
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;

    if (numVolume >= 1_000_000_000) {
        return `${(numVolume / 1_000_000_000).toFixed(2)}B`;
    } else if (numVolume >= 1_000_000) {
        return `${(numVolume / 1_000_000).toFixed(2)}M`;
    } else if (numVolume >= 1_000) {
        return `${(numVolume / 1_000).toFixed(2)}K`;
    } else {
        return numVolume.toFixed(2);
    }
}
