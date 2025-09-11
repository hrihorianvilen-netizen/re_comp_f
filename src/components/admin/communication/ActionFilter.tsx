'use client';

interface ActionFilterProps {
  actionFilter: string;
  onActionChange: (action: string) => void;
  onApply?: () => void;
  
  // Additional filter props - these are optional and depend on the page
  merchantSearch?: string;
  onMerchantSearchChange?: (search: string) => void;
  
  typeFilter?: string;
  onTypeChange?: (type: string) => void;
  
  starFilter?: string;
  onStarChange?: (star: string) => void;
  
  reactingFilter?: string;
  onReactingChange?: (reacting: string) => void;
  
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  
  filteredCount: number;
  showMerchantSearch?: boolean;
  showTypeFilter?: boolean;
  showStarFilter?: boolean;
  showReactingFilter?: boolean;
}

export default function ActionFilter({
  actionFilter,
  onActionChange,
  onApply,
  merchantSearch,
  onMerchantSearchChange,
  typeFilter,
  onTypeChange,
  starFilter,
  onStarChange,
  reactingFilter,
  onReactingChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  filteredCount,
  showMerchantSearch = false,
  showTypeFilter = false,
  showStarFilter = false,
  showReactingFilter = false
}: ActionFilterProps) {
  const actionOptions = showTypeFilter 
    ? ['Approve', 'Dismiss', 'Escalate']
    : ['Approve', 'Reject', 'Mark as Spam', 'Move to Trash'];

  const typeOptions = showReactingFilter 
    ? ['review', 'post']
    : ['Spam', 'Inappropriate', 'Fraud', 'Misleading', 'Harassment'];

  const starOptions = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'];
  const reactionOptions = ['love', 'helpful', 'cry', 'angry'];

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left - Action and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Action Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={actionFilter}
                onChange={(e) => onActionChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">Select Action</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action.toLowerCase()}>
                    {action}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onApply}
                disabled={!actionFilter}
                className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Merchant Search */}
            {showMerchantSearch && merchantSearch !== undefined && onMerchantSearchChange && (
              <input
                type="text"
                placeholder="Search merchant"
                value={merchantSearch}
                onChange={(e) => onMerchantSearchChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              />
            )}

            {/* Type Dropdown */}
            {showTypeFilter && typeFilter !== undefined && onTypeChange && (
              <select
                value={typeFilter}
                onChange={(e) => onTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            )}

            {/* Star Dropdown */}
            {showStarFilter && starFilter !== undefined && onStarChange && (
              <select
                value={starFilter}
                onChange={(e) => onStarChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Stars</option>
                {starOptions.map((star) => (
                  <option key={star} value={star}>
                    {star}
                  </option>
                ))}
              </select>
            )}

            {/* Reacting Dropdown */}
            {showReactingFilter && reactingFilter !== undefined && onReactingChange && (
              <select
                value={reactingFilter}
                onChange={(e) => onReactingChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Reactions</option>
                {reactionOptions.map((reaction) => (
                  <option key={reaction} value={reaction}>
                    {reaction}
                  </option>
                ))}
              </select>
            )}

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              />
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Right - Filtered Items Count */}
          <div className="text-sm text-gray-600">
            {filteredCount} items
          </div>
        </div>
      </div>
    </div>
  );
}