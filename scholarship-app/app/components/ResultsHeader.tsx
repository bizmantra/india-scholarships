'use client';

interface ResultsHeaderProps {
    count: number;
    sortBy: string;
    viewMode: 'grid' | 'list';
    onSortChange: (sort: string) => void;
    onViewChange: (view: 'grid' | 'list') => void;
    showViewToggle?: boolean;
}

export default function ResultsHeader({
    count,
    sortBy,
    viewMode,
    onSortChange,
    onViewChange,
    showViewToggle = true
}: ResultsHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
            {/* Results Count */}
            <div className="text-sm">
                <span className="font-semibold text-gray-900">{count}</span>
                <span className="text-gray-600"> scholarship{count !== 1 ? 's' : ''} found</span>
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600">
                        Sort by:
                    </label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-700/20 bg-white"
                    >
                        <option value="deadline">Deadline (Soonest)</option>
                        <option value="amount">Amount (Highest)</option>
                        <option value="recent">Recently Added</option>
                        <option value="relevance">Relevance</option>
                    </select>
                </div>

                {/* View Toggle */}
                {showViewToggle && (
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                        <button
                            onClick={() => onViewChange('grid')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'grid'
                                    ? 'bg-blue-700 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="Grid view"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onViewChange('list')}
                            className={`p-1.5 rounded transition-colors ${viewMode === 'list'
                                    ? 'bg-blue-700 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            title="List view"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" />
                                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
                                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
