import React from "react";
import { Handle, Position } from "@xyflow/react";

interface SinkNodeProps {
  data: {
    label: string;
    flowRate: number;
    isActive: boolean;
    totalizerReading: number;
    unit: string;
  };
}

const SinkNode: React.FC<SinkNodeProps> = ({ data }) => {
  return (
    <div className="relative">
      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white text-status-danger px-2 py-1 rounded text-xs font-medium shadow-sm">
        SINK
      </div>

      <div className="bg-linear-to-br from-status-danger to-status-danger rounded-lg shadow-lg p-3 min-w-[140px] h-20 text-white relative">
        <Handle
          type="target"
          position={Position.Left}
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

export default SinkNode;
