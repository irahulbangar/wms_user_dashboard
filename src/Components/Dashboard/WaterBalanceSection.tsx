import WaterBalanceTable from "../Department/WaterBalanceTable";
import LineChartSkeleton from "./LineChartSkeleton";

interface WaterBalanceSectionProps {
  isLoading: boolean;
  lineChartRef: React.RefObject<HTMLDivElement | null>;
  plantReportNameWise: Record<string, number> | null;
  totalNetBalance: number;
  unit: string;
  dateSelectionType?: "daily" | "monthly" | "yearly" | "custom";
}

export const WaterBalanceSection = ({
  isLoading,
  lineChartRef,
  plantReportNameWise,
  totalNetBalance,
  unit,
  dateSelectionType,
}: WaterBalanceSectionProps) => {
  const getDateTypeLabel = () => {
    if (!dateSelectionType) return "";
    return (
      dateSelectionType.charAt(0).toUpperCase() + dateSelectionType.slice(1)
    );
  };

  const allReportTypes = [
    "flow_in",
    "flow_out",
    "percolation",
    "evaporation",
    "consumption",
    "wastage",
    "regeneration",
    "reuse",
    "rainfall",
  ];

  const getAllReportTypes = () => {
    if (!plantReportNameWise) {
      return [];
    }
    return allReportTypes.map((reportType) => ({
      name: reportType,
      value: plantReportNameWise[reportType] || 0,
    }));
  };

  const hasData = plantReportNameWise !== null && 
    Object.values(plantReportNameWise).some((value) => value > 0);

  const titleText = dateSelectionType
    ? `Water Balance ${getDateTypeLabel()}`
    : "Water Balance";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
          {titleText}
        </h3>
      </div>
      {isLoading ? (
        <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
          <LineChartSkeleton />
          <WaterBalanceTable
            reportData={null}
            totalNetBalance={0}
            unit={unit}
            isLoading={true}
          />
        </div>
      ) : !hasData ? (
        <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
          <div className="h-[300px] md:h-auto md:min-h-[300px] w-full bg-card rounded-lg p-2 flex items-center justify-center">
            <p className="text-text-secondary text-base font-roboto">
              No data found
            </p>
          </div>
          <div className="bg-card rounded-lg w-full md:w-md px-4 py-2 flex items-center justify-center">
            <p className="text-text-secondary text-base font-roboto">
              No data found
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
          <div className="h-[300px] md:h-auto md:min-h-[300px] w-full bg-card rounded-lg p-2">
            <div ref={lineChartRef} className="w-full h-full"></div>
          </div>
          <div className="bg-card rounded-lg w-full md:w-md px-4 py-2">
            <h3 className="text-text-secondary text-xl border-b border-border-primary pb-2 font-roboto font-normal whitespace-nowrap">
              Water Balance
            </h3>
            <table className="w-full">
              <thead className="border-b border-border-primary last:border-b-0">
                <tr>
                  <th className="text-text-secondary text-base font-roboto text-left font-medium p-2 whitespace-nowrap">
                    Parameter
                  </th>
                  <th className="text-text-secondary text-base font-roboto text-right font-medium p-2 whitespace-nowrap">
                    Quantity ({unit === "M^3" ? "m³" : unit || ""})
                  </th>
                </tr>
              </thead>
              <tbody>
                {getAllReportTypes().map(({ name, value }) => (
                  <tr
                    key={name}
                    className="border-b border-border-primary last:border-b-0"
                  >
                    <td className="text-text-secondary text-base font-roboto font-normal text-start p-2 capitalize">
                      {name.replace(/_/g, " ")}
                    </td>
                    <td className="text-text-secondary text-base font-roboto font-normal text-right p-2">
                      {value}{" "}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-border-primary last:border-b-0 bg-secondary/30">
                  <td className="text-text-primary text-base font-roboto font-normal text-start p-2 whitespace-nowrap">
                    Un-Accountable Water
                  </td>
                  <td className="text-text-primary text-base font-roboto font-normal text-right p-2">
                    {totalNetBalance}{" "}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
