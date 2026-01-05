import React from 'react';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'primary' | 'accent' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'primary',
}) => {
  const accentColors = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  const gradientOverlays = {
    primary: 'from-primary/5 to-transparent',
    accent: 'from-accent/5 to-transparent',
    success: 'from-success/5 to-transparent',
    warning: 'from-warning/5 to-transparent',
  };

  return (
    <div className="stat-card group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientOverlays[accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${accentColors[accentColor]} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
