import { FC } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: FC<any>;
  trend?: string;
}

export const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-sans text-zinc-900">
          {value}
        </span>
        {subValue && (
          <span className="text-sm text-zinc-400 font-medium">{subValue}</span>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
