'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border w-fit">
                <div className="p-2 rounded-lg text-muted-foreground/50">
                    <Sun className="h-4 w-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border w-fit">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg transition-all ${theme === 'light'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-lg transition-all ${theme === 'system'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                title="System Theme"
            >
                <Monitor className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg transition-all ${theme === 'dark'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    );
}
