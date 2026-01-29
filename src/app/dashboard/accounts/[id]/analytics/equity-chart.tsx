'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function EquityChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="premium-card flex h-[350px] items-center justify-center text-muted-foreground">
                <span className="text-sm">Not enough data for equity chart</span>
            </div>
        );
    }

    return (
        <div className="premium-card h-[350px] w-full">
            <h3 className="mb-6 text-lg font-bold tracking-tight text-foreground">Equity Growth</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                    <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            color: 'var(--foreground)'
                        }}
                        itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance']}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorEquity)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
