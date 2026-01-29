'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { GridStrategy } from '@prisma/client';
import GridDetailModal from './grid-detail-modal';

export default function GridDetailButton({
    grid,
    children,
    onClose: parentOnClose
}: {
    grid: GridStrategy,
    children?: React.ReactNode,
    onClose?: () => void
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
        parentOnClose?.();
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    return (
        <>
            <div onClick={handleClick} className="cursor-pointer">
                {children || (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        Details
                    </div>
                )}
            </div>
            {isOpen && <GridDetailModal grid={grid} onClose={handleClose} />}
        </>
    );
}
