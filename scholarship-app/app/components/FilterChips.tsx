'use client';

import { X } from 'lucide-react';

interface FilterChip {
    label: string;
    value: string;
    type: string;
}

interface FilterChipsProps {
    activeFilters: FilterChip[];
    onRemove: (filter: FilterChip) => void;
    onClearAll: () => void;
}

export default function FilterChips({ activeFilters, onRemove, onClearAll }: FilterChipsProps) {
    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-gray-600 font-medium">Applied Filters:</span>

            {activeFilters.map((filter, index) => (
                <button
                    key={`${filter.type}-${filter.value}-${index}`}
                    onClick={() => onRemove(filter)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors group"
                >
                    <span>{filter.label}</span>
                    <X className="h-3.5 w-3.5 group-hover:text-blue-900" />
                </button>
            ))}

            {activeFilters.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                >
                    Clear All
                </button>
            )}
        </div>
    );
}
