'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

export default function PnLChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="premium-card flex h-[350px] items-center justify-center text-muted-foreground">
                <span className="text-sm">Not enough data for PnL chart</span>
            </div>
        );
    }

    // Filter out the initial "Start" point which has 0 PnL
    const chartData = data.filter(d => d.date !== 'Start');

    return (
        <div className="premium-card h-[350px] w-full">
            <h3 className="mb-6 text-lg font-bold tracking-tight text-foreground">Trade PnL Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
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
                        itemStyle={{ fontWeight: 'bold' }}
                        cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'PnL']}
                    />
                    <ReferenceLine y={0} stroke="var(--border)" strokeWidth={2} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1500}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
