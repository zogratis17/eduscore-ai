import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

interface AlertProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const config = {
    error: {
      icon: FiAlertCircle,
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      textColor: 'text-destructive',
      iconColor: 'text-destructive',
    },
    warning: {
      icon: FiAlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      textColor: 'text-warning-foreground',
      iconColor: 'text-warning',
    },
    success: {
      icon: FiCheckCircle,
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      textColor: 'text-success',
      iconColor: 'text-success',
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      textColor: 'text-primary',
      iconColor: 'text-primary',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div className={`relative flex items-start gap-3 p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-medium mb-1 ${textColor}`}>{title}</h4>
        )}
        <p className="text-sm text-foreground/80">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md hover:bg-foreground/10 transition-colors"
        >
          <FiX className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default Alert;
