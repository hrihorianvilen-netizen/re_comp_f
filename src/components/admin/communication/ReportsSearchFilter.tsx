'use client';

interface ReportsSearchFilterProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ReportsSearchFilter({ 
  totalCount, 
  searchQuery, 
  onSearchChange
}: ReportsSearchFilterProps) {
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* All count - Left */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="px-3 py-1 text-sm font-medium text-black">
              All <span className="text-gray-500">({totalCount})</span>
            </span>
          </div>

          {/* Search - Right */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search reports"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
            />
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}