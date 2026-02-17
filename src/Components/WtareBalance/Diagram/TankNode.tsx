import { Handle, Position as HandlePosition } from "@xyflow/react";
import { isRecordTimeOld } from "../../../utils/utils";

interface TankNodeProps {
  data: {
    label: string;
    currentLevel: number;
    capacity: number;
    height: number;
    unit?: string;
    departmentConnection: string;
    plantConnection: string;
    organizationConnection: string;
    systemName: string;
    systemConnection: string;
    crossSectionArea: number;
    lastRecordTime: string;
  };
}

const TankNode = ({ data }: TankNodeProps) => {
  const crossSectionArea = data.crossSectionArea;
  const currentLevel =
    (Number(data.height) - Number(data.currentLevel)) * crossSectionArea;
  const capacity = Number(data.capacity) || 0;
  const unit = data.unit;
  const departmentConnection = data.departmentConnection;
  const plantConnection = data.plantConnection;
  const organizationConnection = data.organizationConnection;
  const systemName = data.systemName;
  const systemConnection = data.systemConnection;
  const percentage = (currentLevel / capacity) * 100;
  const fillHeight = Math.min(percentage, 100);
  const lastRecordTime = data.lastRecordTime || "";

  const recordTimeOld = isRecordTimeOld(lastRecordTime);

  const borderColor = recordTimeOld
    ? "border-status-danger"
    : "border-status-info";

  const connectionInfo = [
    `System Name : ${systemName}`,
    `Device Name : ${data.label}`,
    organizationConnection ? `Org Connn. : ${organizationConnection}` : null,
    plantConnection ? `Plant Conn. : ${plantConnection}` : null,
    departmentConnection ? `Dept Conn. : ${departmentConnection}` : null,
    systemConnection ? `System Conn. : ${systemConnection}` : null,
    `Current Level : ${currentLevel} ${unit}`,
    `Capacity : ${capacity} ${unit}`,
  ]
    .filter((line) => line !== null && line !== "")
    .join("\n");

  return (
    <div className={`relative ${borderColor}`}>
      <div
        className={`relative w-25 h-30 bg-primary/20 border rounded-md overflow-hidden ${borderColor}`}
        title={connectionInfo}
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute bottom-0 left-0 right-0 bg-status-info transition-all duration-500 ease-in-out"
            style={{
              height: `${fillHeight}%`,
              marginTop: "auto",
            }}
          />
        </div>

        <div className="text-left font-roboto text-sm text-wrap py-1 px-2 font-normal text-text-primary leading-4 z-10 relative">
          {data.label}
        </div>

        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30">
          <span className="text-xs font-normal text-text-primary bg-secondary/90 px-1 rounded">
            {percentage.toFixed(2)}%
          </span>
        </div>

        <Handle
          type="target"
          position={HandlePosition.Left}
          className="w-3 h-3 bg-status-info"
        />
        <Handle
          type="source"
          position={HandlePosition.Right}
          className="w-3 h-3 bg-status-info"
        />
      </div>
      <div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm flex items-center justify-center gap-1 whitespace-nowrap font-roboto text-text-primary truncate z-10 px-1"
        title={data.label}
      >
        {/* <div className="text-text-secondary font-roboto text-sm">
          Capacity :{" "}
        </div> */}
        <div className="text-text-primary font-roboto text-sm">
          {currentLevel.toFixed(0)}/{capacity} {unit}
        </div>
      </div>
    </div>
  );
};

export default TankNode;
