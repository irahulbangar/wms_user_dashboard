interface SystemHeaderProps {
  systemName: string;
  deviceCount: number;
  deviceStatusCounts: {
    active: number;
    inactive: number;
    other: number;
  };
}

const SystemHeader = ({
  systemName,
  deviceCount,
  deviceStatusCounts,
}: SystemHeaderProps) => {
  return (
    <div className="bg-primary px-4 pt-1 pb-3 rounded-md">
      <div className="bg-primary flex items-start md:items-center justify-between flex-col md:flex-row">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-normal text-text-primary font-roboto">
              {systemName || "Unknown System"}
            </h3>
            <p className="text-sm text-text-secondary font-roboto">
              {deviceCount} device{deviceCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-success rounded-full"></div>
            <span className="text-xs text-text-secondary font-roboto">
              {deviceStatusCounts.active} Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-danger rounded-full"></div>
            <span className="text-xs text-text-secondary font-roboto">
              {deviceStatusCounts.inactive} Inactive
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-status-warning rounded-full"></div>
            <span className="text-xs text-text-secondary font-roboto">
              {deviceStatusCounts.other} Other
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHeader;
