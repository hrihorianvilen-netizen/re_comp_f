'use client';

interface AdminHeaderProps {
  title: string;
  badge?: {
    text: string;
    color?: 'gray' | 'green' | 'red' | 'blue' | 'yellow';
  };
  actions: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export default function AdminHeader({ title, badge, actions }: AdminHeaderProps) {
  const getBadgeColor = (color: string = 'gray') => {
    const colors = {
      gray: 'bg-gray-100 text-gray-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getButtonColor = (variant: string = 'secondary') => {
    const colors = {
      primary: 'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]',
      secondary: 'px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
      danger: 'px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
    };
    return colors[variant as keyof typeof colors] || colors.secondary;
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {badge && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge.color)}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonColor(action.variant)}
          >
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
}