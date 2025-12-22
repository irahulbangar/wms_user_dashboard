import React from "react";
import { Handle, Position } from "@xyflow/react";

interface SourceNodeProps {
  data: {
    label: string;
    flowRate: number;
    isActive: boolean;
    totalizerReading: number;
    unit: string;
  };
}

const SourceNode: React.FC<SourceNodeProps> = ({ data }) => {
  return (
    <div className="relative">
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white text-status-success px-2 py-1 rounded text-xs font-medium shadow-sm">
        SOURCE
      </div>

      <div className="bg-linear-to-br from-status-success to-status-success rounded-lg shadow-lg p-3 min-w-[140px] h-20 text-white relative">
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-secondary border-2 border-border-secondary"
        />

        <div className="text-left flex flex-col justify-center items-center h-full">
          <div
            className="text-sm font-normal font-roboto mb-1 flex flex-wrap"
            title={data.label}
          >
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceNode;
