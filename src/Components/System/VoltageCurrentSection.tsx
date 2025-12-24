import type { DevicesResult } from "../../../model/devices.interface";

interface VoltageCurrentSectionProps {
  device: DevicesResult;
}

const VoltageCurrentSection = ({ device }: VoltageCurrentSectionProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            R Volt
          </span>
          <span className="text-status-danger font-roboto truncate text-sm">
            {((Number(device?.last_record?.voltage_r) || 0) / 10).toFixed(1)} V
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            Y Volt
          </span>
          <span className="text-status-warning font-roboto truncate text-sm">
            {((Number(device?.last_record?.voltage_y) || 0) / 10).toFixed(1)} V
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            B Volt
          </span>
          <span className="text-status-info font-roboto truncate text-sm">
            {((Number(device?.last_record?.voltage_b) || 0) / 10).toFixed(1)} V
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            R Current
          </span>
          <span className="text-status-danger font-roboto truncate text-sm">
            {((Number(device?.last_record?.Current_r) || 0) / 10).toFixed(1)} V
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            Y Current
          </span>
          <span className="text-status-warning font-roboto truncate text-sm">
            {((Number(device?.last_record?.Current_y) || 0) / 10).toFixed(1)} V
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-text-secondary font-roboto whitespace-nowrap text-sm">
            B Current
          </span>
          <span className="text-status-info font-roboto truncate text-sm">
            {((Number(device?.last_record?.Current_b) || 0) / 10).toFixed(1)} V
          </span>
        </div>
      </div>
    </>
  );
};

export default VoltageCurrentSection;
