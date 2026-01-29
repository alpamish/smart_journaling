'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Activity, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
    renderTime: number;
    dataLoadTime: number;
    componentCount: number;
    memoryUsage?: number;
}

interface LoadingState {
    isLoading: boolean;
    loadingMessage?: string;
    progress?: number;
}

interface ErrorState {
    hasError: boolean;
    errorMessage?: string;
    retryCallback?: () => void;
}

interface PerformanceMonitorProps {
    children: React.ReactNode;
    loadingState?: LoadingState;
    errorState?: ErrorState;
    onPerformanceMetric?: (metrics: PerformanceMetrics) => void;
    showPerformanceInfo?: boolean;
    className?: string;
}

export default function PerformanceMonitor({
    children,
    loadingState,
    errorState,
    onPerformanceMetric,
    showPerformanceInfo = false,
    className = ''
}: PerformanceMonitorProps) {
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const startTimeRef = useRef<number>(Date.now());
    const mountTimeRef = useRef<number | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Track component mount time
    useEffect(() => {
        mountTimeRef.current = Date.now() - startTimeRef.current;
        
        const metrics: PerformanceMetrics = {
            renderTime: mountTimeRef.current,
            dataLoadTime: mountTimeRef.current, // Simplified for now
            componentCount: React.Children.count(children),
            memoryUsage: (performance as any).memory ? 
                Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 
                undefined
        };

        setPerformanceMetrics(metrics);
        onPerformanceMetric?.(metrics);

        // Set up intersection observer for visibility tracking
        if ('IntersectionObserver' in window) {
            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    setIsVisible(entry.isIntersecting);
                },
                { threshold: 0.1 }
            );
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [children, onPerformanceMetric]);

    // Retry functionality
    const handleRetry = useCallback(() => {
        if (errorState?.retryCallback) {
            errorState.retryCallback();
        }
    }, [errorState]);

    // Loading state
    if (loadingState?.isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
                <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    {loadingState.progress !== undefined && (
                        <div className="absolute -inset-2 rounded-full border-2 border-border border-t-transparent animate-spin" />
                    )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    {loadingState.loadingMessage || 'Loading...'}
                </p>
                {loadingState.progress !== undefined && (
                    <div className="mt-2 w-48 bg-muted rounded-full h-2">
                        <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingState.progress}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // Error state
    if (errorState?.hasError) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    {errorState.errorMessage || 'An unexpected error occurred. Please try again.'}
                </p>
                {errorState.retryCallback && (
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Performance Info Badge */}
            {showPerformanceInfo && performanceMetrics && (
                <div className="absolute top-2 right-2 z-10">
                    <div className="premium-card p-2 text-xs space-y-1 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{performanceMetrics.renderTime}ms</span>
                        </div>
                        {performanceMetrics.memoryUsage && (
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-muted-foreground" />
                                <span>{performanceMetrics.memoryUsage}MB</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-muted-foreground" />
                            <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Children */}
            {children}

            {/* Performance Indicator */}
            {showPerformanceInfo && (
                <div className="absolute bottom-2 left-2">
                    <div className={`flex items-center gap-1 text-xs ${
                        (performanceMetrics?.renderTime || 0) < 100 ? 'text-green-600' : 
                        (performanceMetrics?.renderTime || 0) < 300 ? 'text-yellow-600' : 
                        'text-red-600'
                    }`}>
                        {(performanceMetrics?.renderTime || 0) < 100 ? (
                            <CheckCircle className="h-3 w-3" />
                        ) : (performanceMetrics?.renderTime || 0) < 300 ? (
                            <Activity className="h-3 w-3" />
                        ) : (
                            <AlertTriangle className="h-3 w-3" />
                        )}
                        <span>{performanceMetrics?.renderTime}ms</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Hook for managing loading states
export function useLoadingState(initialState: Partial<LoadingState> = {}) {
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: false,
        ...initialState
    });

    const setLoading = useCallback((loading: boolean, message?: string) => {
        setLoadingState(prev => ({
            ...prev,
            isLoading: loading,
            loadingMessage: message
        }));
    }, []);

    const setProgress = useCallback((progress: number) => {
        setLoadingState(prev => ({
            ...prev,
            progress: Math.min(100, Math.max(0, progress))
        }));
    }, []);

    const startLoading = useCallback((message?: string) => {
        setLoadingState({
            isLoading: true,
            loadingMessage: message,
            progress: 0
        });
    }, []);

    const stopLoading = useCallback(() => {
        setLoadingState({
            isLoading: false,
            loadingMessage: undefined,
            progress: undefined
        });
    }, []);

    return {
        loadingState,
        setLoading,
        setProgress,
        startLoading,
        stopLoading
    };
}

// Hook for managing error states
export function useErrorState(initialState: Partial<ErrorState> = {}) {
    const [errorState, setErrorState] = useState<ErrorState>({
        hasError: false,
        ...initialState
    });

    const setError = useCallback((message: string, retryCallback?: () => void) => {
        setErrorState({
            hasError: true,
            errorMessage: message,
            retryCallback
        });
    }, []);

    const clearError = useCallback(() => {
        setErrorState({
            hasError: false,
            errorMessage: undefined,
            retryCallback: undefined
        });
    }, []);

    return {
        errorState,
        setError,
        clearError
    };
}

// Skeleton loading component
export function SkeletonLoader({ 
    type = 'card', 
    count = 1, 
    className = '' 
}: { 
    type?: 'card' | 'table' | 'chart' | 'stats'; 
    count?: number; 
    className?: string; 
}) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`premium-card p-6 animate-pulse ${className}`}>
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                );
            
            case 'table':
                return (
                    <div className={`animate-pulse ${className}`}>
                        <div className="border border-border rounded-md overflow-hidden">
                            <div className="bg-muted h-12"></div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 border-t border-border bg-card"></div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'chart':
                return (
                    <div className={`premium-card p-6 animate-pulse ${className}`}>
                        <div className="h-64 bg-muted rounded"></div>
                    </div>
                );
            
            case 'stats':
                return (
                    <div className={`grid grid-cols-4 gap-6 animate-pulse ${className}`}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="stat-card">
                                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                );
            
            default:
                return (
                    <div className={`animate-pulse ${className}`}>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                );
        }
    };

    return (
        <>
            {[...Array(count)].map((_, index) => (
                <React.Fragment key={index}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </>
    );
}