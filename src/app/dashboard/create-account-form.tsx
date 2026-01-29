'use client';

import { useActionState, useState } from 'react';
import { createAccount } from '@/app/lib/actions';
import { X, Wallet, Globe, Briefcase, Plus } from 'lucide-react';

export default function CreateAccountForm({ close }: { close: () => void }) {
    const [errorMessage, formAction] = useActionState(createAccount, undefined);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-3xl bg-card shadow-2xl shadow-black/20 border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 px-8 py-10 text-white">
                    <button
                        onClick={close}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Plus className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">New Portfolio</h2>
                    </div>
                    <p className="text-blue-100/80 text-sm font-medium">Initialize a new trading account and starting balance</p>
                </div>

                {/* Form */}
                <form action={formAction} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Entity Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="block w-full rounded-2xl border-border bg-muted/30 pl-11 pr-4 py-3.5 text-sm font-medium transition-all focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none placeholder:text-muted-foreground/50"
                                placeholder="e.g. Binanace Futures Main"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Account Nature</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    id="type"
                                    className="block w-full rounded-2xl border-border bg-muted/30 px-4 py-3.5 text-sm font-bold transition-all focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="PERSONAL">Personal</option>
                                    <option value="PROP">Prop Firm</option>
                                    <option value="DEMO">Demo</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="currency" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Base Currency</label>
                            <div className="relative">
                                <select
                                    name="currency"
                                    id="currency"
                                    className="block w-full rounded-2xl border-border bg-muted/30 px-4 py-3.5 text-sm font-bold transition-all focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="JPY">JPY (¥)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="initialBalance" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Capital Investment</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <input
                                type="number"
                                name="initialBalance"
                                id="initialBalance"
                                required
                                step="0.01"
                                className="block w-full rounded-2xl border-border bg-muted/30 pl-11 pr-4 py-3.5 text-sm font-black transition-all focus:bg-background focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none placeholder:text-muted-foreground/50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            type="submit"
                            className="w-full rounded-2xl cursor-pointer bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            Establish Portfolio
                        </button>
                        <button
                            type="button"
                            onClick={close}
                            className="w-full rounded-2xl py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                    {errorMessage && (
                        <div className="mt-4 rounded-2xl bg-red-500/10 p-4 text-xs font-bold text-red-500 border border-red-500/20 flex items-center gap-3 animate-shake">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
