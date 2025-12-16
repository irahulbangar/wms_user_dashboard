import PieChart from "../WtareBalance/Diagram/PieChart";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AnalysisPieChartCardProps {
  title: string;
  data: ChartData[];
  colors: string[];
  isLoading: boolean;
  noDataMessage?: string;
  context?: "department" | "system";
  neutralityIndexValue: number | null;
}

const AnalysisPieChartCard = ({
  title,
  data,
  colors,
  isLoading,
  noDataMessage,
  context = "department",
  neutralityIndexValue,
}: AnalysisPieChartCardProps) => {
  const hasData = data.filter((item) => item.value > 0).length > 0;
  const contextText = context === "system" ? "system" : "department";
  const defaultMessage = `No ${title.toLowerCase()} data found for this ${contextText}`;

  return (
    <div
      className={`bg-card rounded-lg px-4 py-1 shadow-md flex flex-col items-center ${
        hasData ? "h-full" : "h-full"
      }`}
    >
      <h3 className="text-text-primary text-base font-normal font-roboto whitespace-nowrap">
        {title}
      </h3>
      {isLoading ? (
        <div className="flex flex-col items-center justify-between h-[235px]">
          <div className="w-full h-3 rounded-full bg-input-bg animate-pulse"></div>
          <div className="flex items-center justify-center h-full mt-3">
            <div className="w-[150px] h-[150px] rounded-full bg-input-bg animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2 w-full mt-2 mb-1">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-4 h-2 rounded-sm bg-input-bg animate-pulse"></div>
                <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ) : hasData ? (
        <div className="flex items-center justify-start flex-col h-full">
          <div className="flex flex-col items-center justify-center">
            <PieChart
              data={data}
              title=""
              height={200}
              width={200}
              showLegend={false}
              colors={colors}
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex flex-col gap-1">
              {neutralityIndexValue !== null && (
                <span className="text-sm font-roboto text-text-primary whitespace-nowrap truncate">
                  Water Neutrality Index :{" "}
                  {neutralityIndexValue !== null
                    ? (neutralityIndexValue > 120
                        ? 120
                        : neutralityIndexValue
                      ).toFixed(0)
                    : 0}
                  %
                </span>
              )}
              <div className="flex items-center gap-1 flex-wrap">
                {data.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="w-4 h-2 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-roboto text-text-primary whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {neutralityIndexValue !== null && (
            <div className="flex flex-col gap-1 items-center">
              {(() => {
                // Cap the displayed value at 120%
                const displayedValue =
                  neutralityIndexValue > 120 ? 120 : neutralityIndexValue;
                const isCapped = neutralityIndexValue > 120;

                let statusText = "";
                let statusColor = "";

                if (isCapped) {
                  // Value is > 120%, capped at 120% - status not applicable
                  statusText = "Status not applicable (value exceeds 120%).";
                  statusColor = "text-status-warning";
                } else if (displayedValue >= 100) {
                  // WNI >= 100% and <= 120%
                  statusText = "Water Neutral.";
                  statusColor = "text-status-info";
                } else {
                  // WNI < 100%
                  statusText =
                    "Water Negative (consumes more than it replenishes).";
                  statusColor = "text-status-danger";
                }

                return (
                  <span
                    className={`text-sm font-roboto font-normal ${statusColor}`}
                  >
                    {statusText}
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-col h-full">
          <span className="text-sm font-roboto text-text-secondary whitespace-nowrap truncate">
            {noDataMessage || defaultMessage}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnalysisPieChartCard;
