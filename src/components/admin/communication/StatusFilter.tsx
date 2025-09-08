'use client';

interface StatusCounts {
  all: number;
  published: number;
  spam: number;
  trash: number;
}

interface StatusFilterProps {
  selectedStatus: string;
  statusCounts: StatusCounts;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  showSearch?: boolean;
}

export default function StatusFilter({ 
  selectedStatus, 
  statusCounts, 
  searchQuery, 
  onStatusChange, 
  onSearchChange,
  showSearch = true
}: StatusFilterProps) {
  const statusOptions = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'published', label: 'Published', count: statusCounts.published },
    { key: 'spam', label: 'Spam', count: statusCounts.spam },
    { key: 'trash', label: 'Trash', count: statusCounts.trash },
  ];

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filters - Left */}
          <div className="flex flex-wrap items-center gap-1">
            {statusOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => onStatusChange(option.key)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  selectedStatus === option.key
                    ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {option.label} <span className="text-gray-500">({option.count})</span>
              </button>
            ))}
          </div>

          {/* Search - Right */}
          {showSearch && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
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
          )}
        </div>
      </div>
    </div>
  );
}