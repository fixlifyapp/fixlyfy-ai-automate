
import { useState, useMemo } from "react";
import { useTeamMetrics, TechnicianMetric } from "@/hooks/useTeamMetrics";
import { TopTechnicians } from "./metrics/TopTechnicians";
import { DateRangeSelector } from "./metrics/DateRangeSelector";
import { formatCurrency } from "@/lib/utils";

interface ExpandedDashboardMetricsProps {
  onClose: () => void;
}

export const ExpandedDashboardMetrics = ({
  onClose,
}: ExpandedDashboardMetricsProps) => {
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    end: new Date().toISOString(),
  });

  const { technicians, isLoading } = useTeamMetrics(dateRange);

  const formatValue = (value: number): string => {
    return formatCurrency(value);
  };

  return (
    <div className="expand-animation z-50 bg-white fixed inset-0 overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-screen-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Performance Metrics</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <DateRangeSelector
          value={{
            from: new Date(dateRange.start),
            to: new Date(dateRange.end),
          }}
          onChange={({ from, to }) => {
            if (from && to) {
              setDateRange({
                start: from.toISOString(),
                end: to.toISOString(),
              });
            }
          }}
        />

        <TopTechnicians
          technicians={technicians}
          isLoading={isLoading}
          formatValue={formatValue}
        />
      </div>
    </div>
  );
};
