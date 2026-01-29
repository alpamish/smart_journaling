'use client';

import { Trash2 } from 'lucide-react';

export default function DeleteButton({
    onDelete,
    itemType
}: {
    onDelete: () => Promise<any>,
    itemType: string
}) {
    return (
        <form action={onDelete}>
            <button
                type="submit"
                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                title={`Delete ${itemType}`}
                onClick={(e) => {
                    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
                        e.preventDefault();
                    }
                }}
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </form>
    )
}
