import React from "react";
import { Handle, Position } from "@xyflow/react";

interface ResultantNodeProps {
  data: {
    label: string;
    unit?: string;
    report_value?: number;
    isActive?: boolean;
    reportType?: string;
  };
}

const ResultantNode: React.FC<ResultantNodeProps> = ({ data }) => {
  const reportType = data.reportType || "N/A";

  const reportValue =
    typeof data.report_value === "number"
      ? data.report_value
      : typeof data.report_value === "string"
      ? parseFloat(data.report_value) || 0
      : 0;

  const formattedValue = isNaN(reportValue) ? 0 : reportValue.toFixed(2);

  return (
    <div
      className="relative w-auto min-w-[180px] bg-linear-to-br from-[#9cbd46] to-[#6b8615] text-white rounded-xl border border-[#6b8615]/50 shadow-lg shadow-[#6b8615]/30 py-2 px-4 z-10 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:shadow-[#6b8615]/40 hover:scale-105"
      title={`Device Name : ${
        data.label
      }\nReport Type : ${reportType}\nResult : ${formattedValue} ${
        data.unit === "M^3" ? "m³" : data.unit || ""
      }`}
    >
      <div className="flex flex-col items-center gap-1 w-full">
        <div className="text-white font-roboto font-medium px-1 text-lg w-full text-left">
          {data.label}
        </div>

        <div className="flex flex-col items-center gap-0.5 w-full">
          <div className="text-white font-roboto font-medium text-base leading-tight">
            {formattedValue}
            {data.unit && (
              <span className="text-white font-normal text-base italic">
                {data.unit === "M^3" ? "m³" : data.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-secondary border-2 border-border-secondary"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-secondary border-2 border-border-secondary"
      />
    </div>
  );
};

export default ResultantNode;
