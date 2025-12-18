import type { EPeriod } from "../../../../services/admin/dashboard.service";

interface PeriodFilterProps {
  selectedPeriod: EPeriod;
  onPeriodChange: (period: EPeriod) => void;
  periodLabel?: string;
}

const periodOptions: { value: EPeriod; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "7days", label: "7 ngày qua" },
  { value: "30days", label: "30 ngày qua" },
];

const PeriodFilter = ({ selectedPeriod, onPeriodChange, periodLabel }: PeriodFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {periodLabel && (
          <p className="text-gray-500 text-sm mt-1">
            Thống kê: {periodLabel}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selectedPeriod === option.value
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodFilter;
