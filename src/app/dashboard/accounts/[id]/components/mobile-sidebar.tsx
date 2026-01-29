'use client';

import React from 'react';
import { X, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { ViewType, menuItems } from './glass-sidebar';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

interface MobileSidebarProps {
    accountId: string;
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
    isOpen: boolean;
    onClose: () => void;
    onLogTradeToggle?: () => void;
}

export default function MobileSidebar({ accountId, currentView, onViewChange, isOpen, onClose, onLogTradeToggle }: MobileSidebarProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-y-0 left-0 w-80 overflow-y-auto glass-sidebar bg-background/95 border-r border-white/10">
                <div className="p-6 border-b border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                                <Image
                                    src="/logo.jpg"
                                    alt="Smart Journaling Logo"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Smart Journaling</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Trading Dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 w-full p-3 rounded-xl border border-white/10 glass-card hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                                <Home className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-muted-foreground group-hover:text-foreground">Exit Account</span>
                        </Link>

                        <button
                            onClick={() => {
                                onLogTradeToggle?.();
                                onClose();
                            }}
                            className="flex items-center gap-3 w-full p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300 group"
                        >
                            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-blue-400 group-hover:text-blue-300 text-sm">Log Future Trade</span>
                        </button>
                    </div>
                </div>

                <nav className="p-6 space-y-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onViewChange(item.id);
                                    onClose();
                                }}
                                className={`
                                    menu-item w-full p-4 rounded-xl border text-left transition-all duration-300
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-white/20 text-foreground'
                                        : 'glass-card hover:bg-white/10 border-white/10 text-muted-foreground'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        h-10 w-10 rounded-lg flex items-center justify-center
                                        ${isActive ? item.gradient : 'bg-muted/50'}
                                    `}>
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.label}</p>
                                    </div>
                                    {isActive && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto p-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Appearance</span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
}
