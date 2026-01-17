import { FC } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: FC<any>;
  trend?: string;
}

export const MetricCard: FC<MetricCardProps> = ({ title, value }) => {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
};
