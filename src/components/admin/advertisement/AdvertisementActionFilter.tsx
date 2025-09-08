'use client';

interface AdvertisementActionFilterProps {
  actionFilter: string;
  slotFilter: string;
  timeFilter: string;
  onActionChange: (action: string) => void;
  onSlotChange: (slot: string) => void;
  onTimeChange: (time: string) => void;
  filteredCount: number;
}

export default function AdvertisementActionFilter({
  actionFilter,
  slotFilter,
  timeFilter,
  onActionChange,
  onSlotChange,
  onTimeChange,
  filteredCount
}: AdvertisementActionFilterProps) {
  const actionOptions = ['Publish', 'Archive', 'Move to Trash', 'Duplicate'];
  const slotOptions = ['Header', 'Sidebar', 'Footer', 'Content', 'Popup'];
  const timeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left - Action, Slot, Time Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Action Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={actionFilter}
                onChange={(e) => onActionChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">Action</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action.toLowerCase().replace(' ', '_')}>
                    {action}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
              >
                Apply
              </button>
            </div>

            <span className="text-gray-400">|</span>

            {/* Slot Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={slotFilter}
                onChange={(e) => onSlotChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Slots</option>
                {slotOptions.map((slot) => (
                  <option key={slot} value={slot.toLowerCase()}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-gray-400">|</span>

            {/* Time Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={timeFilter}
                onChange={(e) => onTimeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="">All Time</option>
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
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