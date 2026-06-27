import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  bgColor = "from-yellow-100 via-orange-50 to-red-100",
  textColor = "text-red-700"
}) => {
  return (
    <div className={`rounded-2xl p-6 shadow-lg bg-gradient-to-br ${bgColor} border border-orange-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className={`text-lg font-semibold ${textColor} mb-2`}>{title}</h2>
          <p className="text-3xl font-bold text-red-600 drop-shadow-sm">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className={`p-2 rounded-full bg-white/50 ${textColor}`}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-600">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;