import React from 'react';
import { FiInbox, FiFileText, FiUsers, FiBarChart } from 'react-icons/fi';

interface EmptyStateProps {
  type?: 'default' | 'assignments' | 'users' | 'analytics';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ type = 'default', title, description, action }) => {
  const icons = {
    default: FiInbox,
    assignments: FiFileText,
    users: FiUsers,
    analytics: FiBarChart,
  };

  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 btn-primary-gradient rounded-lg font-medium text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
