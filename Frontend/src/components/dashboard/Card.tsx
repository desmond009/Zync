import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-slate-200
        p-6 transition-all duration-200
        ${hoverable && onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  onClick,
  isLoading = false,
}) => {
  return (
    <Card onClick={onClick} hoverable={!!onClick} className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        )}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {icon && <div className="text-slate-400 ml-4">{icon}</div>}
    </Card>
  );
};
