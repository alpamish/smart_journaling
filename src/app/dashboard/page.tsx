import { auth, signOut } from '@/auth';
import { fetchUserAccounts } from '@/app/lib/data';
import AddAccountButton from './add-account-button';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, LogOut, User, BarChart3, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const accounts = await fetchUserAccounts();

    // Calculate total portfolio value
    const totalInitialBalance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalEquity = accounts.reduce((sum, acc) => sum + acc.equity, 0);
    const totalPnL = totalEquity - totalInitialBalance;
    const pnlPercentage = totalInitialBalance > 0 ? (totalPnL / totalInitialBalance) * 100 : 0;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Main Sidebar (Glass effect inspired by Account Dashboard) */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 glass-sidebar p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2 transition-all duration-300 hover:scale-105">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20">
                        <Image
                            src="/logo.jpg"
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">Smart Journal</h2>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold italic">Professional</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <a href="/dashboard" className="menu-item active flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </a>
                    <div className="pt-4 pb-2 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accounts</span>
                    </div>
                    {accounts.slice(0, 5).map(acc => (
                        <a key={acc.id} href={`/dashboard/accounts/${acc.id}`} className="menu-item flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {acc.name}
                        </a>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 pt-6 border-t border-border/10">
                    <div className="flex flex-col gap-4 mt-auto">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Appearance</span>
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-2xl border border-border/50">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                                {session?.user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate leading-none mb-1">{session?.user?.email?.split('@')[0]}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email}</p>
                            </div>
                        </div>

                        <form
                            action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/login' });
                            }}
                        >
                            <button className="menu-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer group">
                                <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8 relative">
                    {/* Animated Background Blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-0 -left-4 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-0 -right-4 w-[40rem] h-[40rem] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>

                    {/* Header/Hero Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                                Welcome back,<br />
                                <span className="text-blue-500">{session?.user?.email?.split('@')[0]}</span>
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Portfolio overview across {accounts.length} trading accounts
                            </p>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="flex gap-8 items-center px-6 py-4 glass-card rounded-2xl shadow-xl shadow-black/5">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Combined Equity</span>
                                    <span className="text-2xl font-black tracking-tight font-mono text-foreground">
                                        ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="h-10 w-px bg-border/20" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Overall P&L</span>
                                    <span className={`text-xl font-bold font-mono ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-3 mb-16 animate-slide-up">
                        {/* Total Balance Card */}
                        <div className="stat-card group cursor-default">
                            <div className="flex items-start justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${totalPnL >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {pnlPercentage.toFixed(2)}%
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Balance</p>
                                <p className="text-3xl font-black tracking-tighter">
                                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Total Equity Card */}
                        <div className="stat-card group cursor-default border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                            <div className="flex items-start justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <LayoutDashboard className="h-6 w-6" />
                                </div>
                                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500">
                                    Combined
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Equity</p>
                                <p className="text-3xl font-black tracking-tighter">
                                    ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Accounts Count Card */}
                        <div className="stat-card group cursor-default">
                            <div className="flex items-start justify-between">
                                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <User className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Managed Accounts</p>
                                <p className="text-3xl font-black tracking-tighter">
                                    {accounts.length} <span className="text-sm font-medium text-muted-foreground tracking-normal lowercase">Portfolios</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Accounts Grid */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Trading Accounts</h2>
                                <p className="text-sm text-muted-foreground">Select an account to view detailed analytics and journal</p>
                            </div>
                            <AddAccountButton />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account, index) => {
                                const accountPnL = account.equity - account.initialBalance;
                                const accountPnLPercentage = account.initialBalance > 0 ? (accountPnL / account.initialBalance) * 100 : 0;

                                return (
                                    <a
                                        href={`/dashboard/accounts/${account.id}`}
                                        key={account.id}
                                        className="group block animate-scale-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="section-card hover:border-blue-500/50 hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1">
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex-1 pr-2">
                                                        <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors truncate">
                                                            {account.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${account.type === 'PERSONAL' ? 'bg-blue-500/10 text-blue-500' :
                                                                account.type === 'PROP' ? 'bg-purple-500/10 text-purple-500' :
                                                                    'bg-slate-500/10 text-slate-500'
                                                                }`}>
                                                                {account.type}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-muted-foreground">{account.currency}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                                        <LayoutDashboard className="h-5 w-5" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Balance</p>
                                                        <p className="text-2xl font-black font-mono">
                                                            ${account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>

                                                    <div className="pt-4 border-t border-border/10 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-muted-foreground">Net Equity</span>
                                                            <span className="text-sm font-bold">${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-muted-foreground">Profit & Loss</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm font-bold ${accountPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {accountPnL >= 0 ? '+' : '-'}${Math.abs(accountPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accountPnL >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                    {accountPnLPercentage.toFixed(2)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
