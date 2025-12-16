interface GroupNodeProps {
  data: {
    label: string;
    unit?: string;
    totalStock: number;
    totalCapacity: number;
    totalIn: number;
    totalOut: number;
    totalBalance: number;
    plantTotalIn?: number;
    plantTotalOut?: number;
    plantTotalBalance?: number;
    systemTotalIn?: number;
    systemTotalOut?: number;
    systemTotalBalance?: number;
    groupType?: "plant" | "department" | "system";
    isSidebarOpen?: boolean;
  };
  id: string;
}

const GroupNode = ({ data, id }: GroupNodeProps) => {
  const isSidebarOpen = data.isSidebarOpen || false;

  const unit = data.unit;
  const isPlantGroup = id.startsWith("plant-") || data.groupType === "plant";
  const isSystemGroup = id.startsWith("system-") || data.groupType === "system";

  return (
    <div
      className={`relative w-full h-full bg-transparent rounded-lg ${
        isSidebarOpen ? "mr-100" : ""
      }`}
    >
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-primary border border-border-primary rounded-md px-3 py-1.5 shadow-sm">
        <span
          className="text-sm font-normal text-text-primary font-roboto truncate z-10 px-1"
          title={data.label}
        >
          {data.label}
        </span>
      </div>

      <div className="absolute top-[-6px] left-1/2 transform -translate-x-1/2 flex items-center justify-between w-full">
        <div className="flex items-start justify-between w-full gap-6 text-xs font-roboto">
          <div className="text-center flex items-start flex-col">
            <div className="flex items-center gap-1">
              <div className="text-text-secondary font-roboto whitespace-nowrap">
                Total Stock:
              </div>
              <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                {Number(data.totalStock || 0).toFixed(1)}{" "}
                {unit === "M^3" ? (
                  <>
                    m<sup>3</sup>
                  </>
                ) : (
                  unit
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-text-secondary font-roboto whitespace-nowrap">
                Total Capacity:
              </div>
              <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                {Number(data.totalCapacity || 0).toFixed(0)} {unit}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex flex-col">
              {isPlantGroup ? (
                <>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total In:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.plantTotalIn || 0) / 1000).toFixed(2)
                        : Number(data.plantTotalIn || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Out:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.plantTotalOut || 0) / 1000).toFixed(2)
                        : Number(data.plantTotalOut || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Bal:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.plantTotalBalance || 0) / 1000).toFixed(
                            2
                          )
                        : Number(data.plantTotalBalance || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                </>
              ) : isSystemGroup ? (
                <>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total In:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.systemTotalIn || 0) / 1000).toFixed(2)
                        : Number(data.systemTotalIn || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Out:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.systemTotalOut || 0) / 1000).toFixed(2)
                        : Number(data.systemTotalOut || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Bal:
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.systemTotalBalance || 0) / 1000).toFixed(
                            2
                          )
                        : Number(data.systemTotalBalance || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total In :
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.totalIn || 0) / 1000).toFixed(2)
                        : Number(data.totalIn || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Out :
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.totalOut || 0) / 1000).toFixed(2)
                        : Number(data.totalOut || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <div className="text-text-secondary font-roboto whitespace-nowrap">
                      Total Bal :
                    </div>
                    <div className="font-normal text-text-primary font-roboto truncate whitespace-nowrap">
                      {unit === "M^3"
                        ? (Number(data.totalBalance || 0) / 1000).toFixed(2)
                        : Number(data.totalBalance || 0).toFixed(1)}{" "}
                      {unit === "M^3" ? (
                        <>
                          m<sup>3</sup>
                        </>
                      ) : (
                        unit
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupNode;
