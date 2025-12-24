import type { DevicesResult } from "../../../model/devices.interface";
import { fromatDateWithTime, isRecordTimeOld } from "../../utils/utils";
import {
  getDeviceLogo,
  getFlowText,
  getFlow,
  getTotalizerText,
  getTotalizer,
  getTotalizerString,
} from "../../utils/deviceHelpers";
import { useLocation } from "react-router-dom";
import VoltageCurrentSection from "./VoltageCurrentSection";

interface DeviceCardProps {
  device: DevicesResult;
  onViewDevice: (device: DevicesResult) => void;
}

const DeviceCard = ({ device, onViewDevice }: DeviceCardProps) => {
  const recordTimeOld = isRecordTimeOld(device?.last_record?.time);
  const location = useLocation();

  return (
    <div
      className={`rounded-lg px-3 py-2 hover:shadow-lg transition-all duration-200 shadow-sm border ${
        recordTimeOld
          ? "bg-status-danger/10 border-status-danger/20"
          : location.pathname.startsWith("/system/device/")
          ? "bg-primary border-border-primary"
          : "bg-secondary border-border-primary"
      }`}
    >
      <div className="flex items-center justify-between mb-3 gap-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              recordTimeOld
                ? "bg-status-danger animate-pulse"
                : device?.device_status?.toLowerCase() === "active"
                ? "bg-status-success animate-pulse"
                : device?.device_status?.toLowerCase() === "inactive"
                ? "bg-status-danger"
                : "bg-status-danger animate-pulse"
            }`}
          ></div>
          <span
            className="text-base font-normal text-text-primary cursor-pointer leading-normal"
            title={device?.device_name || "N/A"}
          >
            {device?.device_name}
          </span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded-lg text-[9px] capitalize font-roboto shrink-0 ${
            recordTimeOld
              ? "bg-status-danger/10 text-status-danger"
              : "bg-status-success/10 text-status-success"
          }`}
        >
          {recordTimeOld ? "Inactive" : "Active"}
        </span>
      </div>

      <div
        className="space-y-3 mb-2 cursor-pointer"
        onClick={() => onViewDevice(device)}
      >
        <div className="bg-overlay/20 rounded-lg py-2 px-3">
          <div className="flex items-center gap-2 justify-center">
            <img
              src={getDeviceLogo(device)}
              alt="Device Logo"
              className="w-10 h-10"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary font-roboto whitespace-nowrap">
              Device Family :
            </span>
            <span
              className="pl-1 text-sm font-normal text-text-primary font-roboto uppercase truncate"
              title={device?.device_family || "N/A"}
            >
              {device?.device_family_type || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary font-roboto whitespace-nowrap">
              Device Type :{" "}
            </span>
            <span
              className="pl-1 text-sm font-normal text-text-primary font-roboto truncate uppercase"
              title={device?.device_type || "N/A"}
            >
              {device?.device_type || "N/A"}
            </span>
          </div>

          {device?.device_family_type !== "phmc" &&
            device?.device_family_type !== "dwlr" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary font-roboto">
                    {getFlowText(device)}
                  </span>
                  <span
                    className="text-sm font-normal text-text-primary font-roboto truncate"
                    title={getFlow(device)}
                  >
                    {getFlow(device)}
                  </span>
                </div>
                {getTotalizerText(device) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary font-roboto">
                      {getTotalizerText(device)}
                    </span>
                    <span
                      className="pl-1 text-sm font-normal text-text-primary font-roboto truncate"
                      title={getTotalizerString(device)}
                    >
                      {getTotalizer(device)}
                    </span>
                  </div>
                )}
              </>
            )}

          {device?.device_family_type === "phmc" && (
            <VoltageCurrentSection device={device} />
          )}

          {device?.device_family_type === "dwlr" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-roboto">
                  Water Column :
                </span>
                <span className="text-sm font-normal text-text-primary font-roboto truncate">
                  {device?.last_record?.water_column?.toFixed(2)} mWc
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-roboto">
                  Water Ground :
                </span>
                <span className="text-sm font-normal text-text-primary font-roboto truncate">
                  {device?.last_record?.water_column_from_ground?.toFixed(2)}{" "}
                  mRL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-roboto">
                  Water Temperature :
                </span>
                <span className="text-sm font-normal text-text-primary font-roboto truncate">
                  {device?.last_record?.water_temperature?.toFixed(1)} °C
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary font-roboto">
                  Water Pressure :
                </span>
                <span className="text-sm font-normal text-text-primary font-roboto truncate">
                  {device?.last_record?.water_pressure?.toFixed(2)} Bar
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary flex items-center gap-1 font-roboto whitespace-nowrap">
            <div className="w-2 h-2 bg-status-info rounded-full"></div>
            Last Updated :
          </span>
          <span
            className="text-text-primary text-xs font-roboto whitespace-nowrap truncate"
            title={fromatDateWithTime(device?.updated_at)}
          >
            {fromatDateWithTime(device?.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
