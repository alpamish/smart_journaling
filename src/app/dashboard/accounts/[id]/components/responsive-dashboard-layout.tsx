'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Minimize2, Maximize2, LayoutGrid } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    headerActions?: React.ReactNode;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const CollapsibleSection = React.memo(({ 
    title, 
    children, 
    defaultExpanded = true, 
    className = '',
    headerActions
}: CollapsibleSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isMinimized, setIsMinimized] = useState(false);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const toggleMinimized = useCallback(() => {
        setIsMinimized(prev => !prev);
    }, []);

    return (
        <section className={`premium-card transition-all duration-300 ${isMinimized ? 'opacity-75' : ''} ${className}`}>
            <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleExpanded}
                        className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                    {headerActions}
                    <button
                        onClick={toggleMinimized}
                        className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                        aria-label={isMinimized ? 'Maximize section' : 'Minimize section'}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            
            {isExpanded && !isMinimized && (
                <div className="px-6 pb-6">
                    {children}
                </div>
            )}
        </section>
    );
});

CollapsibleSection.displayName = 'CollapsibleSection';

export default function ResponsiveDashboardLayout({ children, className = '' }: DashboardLayoutProps) {
    const [layoutMode, setLayoutMode] = useState<'comfortable' | 'compact'>('comfortable');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleLayoutMode = useCallback(() => {
        setLayoutMode(prev => prev === 'comfortable' ? 'compact' : 'comfortable');
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    return (
        <div className={`min-h-screen bg-background text-foreground transition-all duration-300 ${
            layoutMode === 'compact' ? 'compact-layout' : 'comfortable-layout'
        } ${className}`}>
            {/* Layout Controls */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LayoutGrid className="h-4 w-4" />
                            <span>Layout: {layoutMode === 'comfortable' ? 'Comfortable' : 'Compact'}</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={toggleLayoutMode}
                                className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                            >
                                {layoutMode === 'comfortable' ? 'Compact View' : 'Comfortable View'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
                <div className={`grid gap-6 transition-all duration-300 ${
                    layoutMode === 'compact' ? 'lg:grid-cols-12' : 'lg:grid-cols-4'
                }`}>
                    {/* Sidebar */}
                    <div className={`transition-all duration-300 ${
                        layoutMode === 'compact' ? 
                            (sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3') :
                            'lg:col-span-1'
                    }`}>
                        <div className={`space-y-4 ${sidebarCollapsed ? 'opacity-50 pointer-events-none' : ''}`}>
                            {React.Children.map(children, (child, index) => {
                                if (React.isValidElement(child) && (child.props as any)?.slot === 'sidebar') {
                                    return React.cloneElement(child as React.ReactElement<any>, { 
                                        key: index,
                                        className: layoutMode === 'compact' ? 'compact-card' : ''
                                    });
                                }
                                return null;
                            })}
                        </div>
                        
                        {layoutMode === 'compact' && (
                            <button
                                onClick={toggleSidebar}
                                className="mt-4 w-full px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors lg:hidden"
                            >
                                {sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
                            </button>
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className={`transition-all duration-300 ${
                        layoutMode === 'compact' ? 
                            (sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-9') :
                            'lg:col-span-3'
                    }`}>
                        <div className="space-y-8">
                            {React.Children.map(children, (child, index) => {
                                if (React.isValidElement(child) && (child.props as any)?.slot !== 'sidebar') {
                                    return React.cloneElement(child as React.ReactElement<any>, { 
                                        key: index,
                                        className: layoutMode === 'compact' ? 'compact-section' : ''
                                    });
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .comfortable-layout {
                    --section-spacing: 3rem;
                    --card-padding: 1.5rem;
                    --header-font-size: 1.5rem;
                }
                
                .compact-layout {
                    --section-spacing: 1.5rem;
                    --card-padding: 1rem;
                    --header-font-size: 1.25rem;
                }
                
                .compact-card {
                    padding: var(--card-padding) !important;
                }
                
                .compact-section h2 {
                    font-size: var(--header-font-size) !important;
                }
                
                .compact-layout .premium-card {
                    margin-bottom: var(--section-spacing);
                }
                
                @media (max-width: 1024px) {
                    .compact-layout .lg\\:grid-cols-12 {
                        grid-template-columns: 1fr;
                    }
                    
                    .compact-layout .lg\\:col-span-1,
                    .compact-layout .lg\\:col-span-3,
                    .compact-layout .lg\\:col-span-9,
                    .compact-layout .lg\\:col-span-11 {
                        grid-column: 1;
                    }
                }
            `}</style>
        </div>
    );
}

export { CollapsibleSection };