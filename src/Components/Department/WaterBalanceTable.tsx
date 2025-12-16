import React from "react";
import { useLocation } from "react-router-dom";

interface WaterBalanceTableProps {
  reportData: Record<string, number> | null;
  totalNetBalance: number;
  unit: string;
  isLoading?: boolean;
}

const WaterBalanceTable: React.FC<WaterBalanceTableProps> = ({
  reportData,
  totalNetBalance,
  unit,
  isLoading = false,
}) => {
  const formatUnit = (unitValue: string) => {
    return unitValue === "M^3" ? "m³" : unitValue;
  };
  const location = useLocation();

  const formattedUnit = formatUnit(unit);

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
    return allReportTypes.map((reportType) => ({
      name: reportType,
      value: reportData?.[reportType] || 0,
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg px-4 py-2">
        <table>
          <thead className="border-b border-border-primary last:border-b-0">
            <tr>
              <th className="text-text-secondary text-base font-roboto text-left font-normal p-2 whitespace-nowrap">
                <div className="w-24 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
              </th>
              <th className="text-text-secondary text-base font-roboto text-right font-normal p-2 whitespace-nowrap">
                <div className="w-20 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr
                key={i}
                className="border-b border-border-primary last:border-b-0"
              >
                <td className="text-center p-2">
                  <div className="w-24 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
                </td>
                <td className="text-center p-2">
                  <div className="w-20 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
                </td>
              </tr>
            ))}
            <tr className="border-b border-border-primary last:border-b-0 bg-secondary/30">
              <td className="text-center p-2">
                <div className="w-24 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
              </td>
              <td className="text-center p-2">
                <div className="w-20 h-4 bg-input-bg rounded animate-pulse mx-auto"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg px-4 py-2">
      {!location.pathname.includes("plant-layout") && (
        <h3 className="text-text-secondary text-xl border-b border-border-primary pb-2 font-roboto font-normal whitespace-nowrap">
          Water Balance
        </h3>
      )}
      <table>
        <thead className="border-b border-border-primary last:border-b-0">
          <tr>
            <th
              className={`text-text-secondary text-base font-roboto text-left font-medium p-2 ${
                location.pathname.includes("plant-layout")
                  ? "text-start"
                  : "whitespace-nowrap"
              }`}
            >
              Parameter
            </th>
            <th
              className={`text-text-secondary text-base font-roboto text-right font-medium p-2 ${
                location.pathname.includes("plant-layout")
                  ? "text-start whitespace-nowrap"
                  : "whitespace-nowrap"
              }`}
            >
              Quantity{" "}
              <span className="text-sm italic text-text-secondary font-roboto">
                ({formattedUnit})
              </span>
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
          {reportData && (
            <tr className="border-b border-border-primary last:border-b-0 bg-secondary/30">
              <td
                className={`text-text-primary text-base font-roboto font-normal text-center p-2 ${
                  location.pathname.includes("plant-layout")
                    ? "text-start"
                    : "whitespace-nowrap"
                }`}
              >
                Un-Accounted Water
              </td>
              <td className="text-text-primary text-base font-roboto font-normal text-right p-2">
                {totalNetBalance}{" "}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WaterBalanceTable;
