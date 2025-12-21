import type { SingleDeviceResult } from "../../../model/single-device.interface";

interface DwlrDeviceInfoProps {
  deviceData: SingleDeviceResult;
}

const DwlrDeviceInfo = ({ deviceData }: DwlrDeviceInfoProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const deviceInfo = [
    { label: "Device id", value: deviceData?.device_id },
    { label: "Uuid", value: deviceData?.hwid },
    { label: "Identifier", value: deviceData?.device_name },
    { label: "Device Status", value: deviceData?.device_status },
    { label: "Device Type", value: deviceData?.device_type },
    { label: "Device Family", value: deviceData?.device_family },
    { label: "Unit", value: deviceData?.unit },
    { label: "Plant Name", value: deviceData?.plant_name },
    { label: "Department Name", value: deviceData?.department_name },
    { label: "System Name", value: deviceData?.system_name },
    {
      label: "Latitude",
      value: deviceData?.plant_latitude
        ? parseFloat(deviceData.plant_latitude).toFixed(8)
        : "N/A",
    },
    {
      label: "Longitude",
      value: deviceData?.plant_longitude
        ? parseFloat(deviceData.plant_longitude).toFixed(8)
        : "N/A",
    },
    { label: "Location", value: deviceData?.plant_address },
    { label: "Installation Date", value: formatDate(deviceData?.created_at) },
  ];

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-secondary border-b border-border-primary">
              <th className="px-4 py-3 text-left text-sm font-normal text-text-primary font-roboto border-r border-border-primary">
                Parameters
              </th>
              <th className="px-4 py-3 text-left text-sm font-normal text-text-primary font-roboto">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {deviceInfo.map((info, index) => (
              <tr
                key={index}
                className="border-b border-border-primary hover:bg-secondary/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-normal text-text-secondary font-roboto border-r border-border-primary">
                  {info.label}
                </td>
                <td className="px-4 py-3 text-sm font-normal text-text-primary font-roboto">
                  {formatValue(info.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DwlrDeviceInfo;

