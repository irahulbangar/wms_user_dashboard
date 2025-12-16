import React from "react";
import PieChart from "./PieChart";
import CollapsibleSection from "./CollapsibleSection";

interface GroupChartsProps {
  totalIn: number;
  totalOut: number;
  totalStock: number;
  totalCapacity: number;
  groupType: "system" | "department" | "plant";
  groupName: string;
  unit: string;
}

export const FlowChart: React.FC<GroupChartsProps> = ({
  totalIn,
  totalOut,
  groupType,
  groupName: _groupName,
  unit,
}) => {
  const totalBalance = totalIn - totalOut;

  const flowData = [
    {
      name: "Total In",
      value: totalIn,
      color: "#5070de",
      unit: unit,
    },
    {
      name: "Total Out",
      value: totalOut,
      color: "#b6d733",
      unit: unit,
    },
  ];

  const tableData = [
    ...flowData,
    {
      name: "Total Balance",
      value: totalBalance,
      color: totalBalance >= 0 ? "#10B981" : "#EF4444",
      unit: unit,
    },
  ];

  const getGroupTypeLabel = () => {
    switch (groupType) {
      case "system":
        return "System";
      case "department":
        return "Department";
      case "plant":
        return "Plant";
      default:
        return "Group";
    }
  };

  const chartData = flowData.filter((item: any) => {
    if (item.name === "Total Balance") {
      return true;
    }
    return item.value > 0;
  });

  const pieChartData = chartData.map((item: any) => {
    return {
      ...item,
      value: Math.max(item.value, 0.1),
    };
  });

  return (
    <CollapsibleSection
      title={`${getGroupTypeLabel()} Flow Analysis`}
      defaultExpanded={true}
    >
      <div className="space-y-6">
        {pieChartData.length > 0 ? (
          <div className="flex flex-col items-center">
            <PieChart
              data={pieChartData}
              title={getGroupTypeLabel() + " Flow"}
              height={200}
              width={250}
              showLegend={false}
              colors={pieChartData.map((item: any) => item.color)}
              unit={unit}
            />
            <div className="flex items-center gap-1 flex-wrap">
              {flowData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-4 h-2 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-roboto text-text-secondary">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-text-secondary font-roboto text-sm">
              No flow data for chart visualization
            </p>
          </div>
        )}

        {chartData?.length > 0 && (
          <div className="bg-primary border border-border-primary overflow-hidden rounded-lg">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-1.5 text-left text-base font-normal text-text-primary font-roboto border-b border-border-primary">
                    Category
                  </th>
                  <th className="px-4 py-1.5 text-right text-base font-normal text-text-primary font-roboto border-b border-border-primary">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item: any, index) => (
                  <tr
                    key={index}
                    className="border-b border-border-primary last:border-b-0"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-text-secondary font-roboto">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-sm font-normal text-text-primary font-roboto">
                        {item?.unit === "M^3"
                          ? (item.value / 1000).toFixed(1)
                          : item.value.toFixed(1)}{" "}
                        <span className="text-sm italic text-text-secondary font-roboto">
                          {item?.unit === "M^3" ? (
                            <>
                              m<sup>3</sup>
                            </>
                          ) : (
                            item?.unit
                          )}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export const StorageChart: React.FC<GroupChartsProps> = ({
  totalStock,
  totalCapacity,
  groupType,
  groupName: _groupName,
  unit,
}) => {
  const capacityData = [
    {
      name: "Total Stock",
      value: totalStock,
      color: "#5070de",
      unit: unit,
    },
    {
      name: "Available Capacity",
      value: Math.max(0, totalCapacity - totalStock),
      color: "#7da6d2",
      unit: unit,
    },
  ];

  const tableData = [
    ...capacityData,
    {
      name: "Total Capacity",
      value: totalCapacity,
      color: "#06B6D4",
      unit: unit,
    },
  ];

  const getGroupTypeLabel = () => {
    switch (groupType) {
      case "system":
        return "System";
      case "department":
        return "Department";
      case "plant":
        return "Plant";
      default:
        return "Group";
    }
  };

  const chartData = capacityData.filter((item: any) => item.value > 0);

  return (
    <CollapsibleSection
      title={`${getGroupTypeLabel()} Storage Analysis`}
      defaultExpanded={true}
    >
      <div className="space-y-6">
        {chartData.length > 0 ? (
          <div className="flex flex-col items-center">
            <PieChart
              data={chartData}
              title={getGroupTypeLabel() + " Storage"}
              height={200}
              width={250}
              showLegend={false}
              colors={chartData.map((item: any) => item.color)}
              unit={unit}
            />
            <div className="flex items-center gap-1 flex-wrap">
              {chartData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-4 h-2 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-roboto text-text-secondary">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-text-secondary font-roboto text-sm">
              No storage data for chart visualization
            </p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-primary border border-border-primary overflow-hidden rounded-lg">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-1.5 text-left text-sm font-normal text-text-primary font-roboto border-b border-border-primary">
                    Storage Type
                  </th>
                  <th className="px-4 py-1.5 text-right text-sm font-normal text-text-primary font-roboto border-b border-border-primary">
                    <div className="flex items-center gap-1">
                      Value
                      <span className="text-sm italic text-text-secondary font-roboto">
                        (
                        {unit === "M^3" ? (
                          <>
                            m<sup>3</sup>
                          </>
                        ) : (
                          unit
                        )}
                        )
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item: any, index) => (
                  <tr
                    key={index}
                    className="border-b border-border-primary last:border-b-0"
                  >
                    <td className="px-4 py-3 truncate">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-text-primary font-roboto">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right truncate">
                      <span className="text-sm font-normal text-text-primary font-roboto">
                        {item?.unit === "M^3"
                          ? (item.value / 1000).toFixed(0)
                          : item.value.toFixed(0)}{" "}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

const GroupCharts: React.FC<GroupChartsProps> = (props) => {
  return (
    <div className="space-y-6">
      <FlowChart {...props} />
      <StorageChart {...props} />
    </div>
  );
};

export default GroupCharts;
