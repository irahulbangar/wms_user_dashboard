import { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  Factory,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DevicesResult } from "../../../model/devices.interface";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getDeviceByOrganizationIdAndPlantId } from "../../../store/deviceSlice";
import { getCurrentPlantId } from "../../utils/plantUtils";
import NoDataFound from "../NoDataFound";
import { Error } from "../../utils/toast";
import domtoimage from "dom-to-image";
import DeviceCard from "../System/DeviceCard";
import { isRecordTimeOld } from "../../utils/utils";

const Devices = () => {
  const navigate = useNavigate();
  const devicesRef = useRef<HTMLDivElement>(null);
  const [devices, setDevices] = useState<DevicesResult[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DevicesResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [collapsedSystems, setCollapsedSystems] = useState<Set<string>>(
    new Set()
  );
  const organizationId = localStorage.getItem("organizationId");
  const plantId = localStorage.getItem("plantId");
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId())
  )?.role;

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!devicesRef.current) return null;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const element = devicesRef.current;
      const rect = element.getBoundingClientRect();
      const scrollWidth = Math.max(element.scrollWidth || 0, rect?.width || 0);
      const scrollHeight = Math.max(
        element.scrollHeight || 0,
        rect?.height || 0
      );

      try {
        const svgDataUrl = await domtoimage.toSvg(element, {
          width: scrollWidth,
          height: scrollHeight,
          style: {
            width: `${scrollWidth}px`,
            height: `${scrollHeight}px`,
          },
          quality: 1,
          filter: (node: any) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "NAV" ||
              el.classList?.contains("search") ||
              (el.tagName === "BUTTON" && el.textContent?.includes("Search"))
            ) {
              return false;
            }
            return true;
          },
        });

        const img = new Image();
        img.crossOrigin = "anonymous";

        const dataUrl = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = 1.5;
            canvas.width = scrollWidth * scale;
            canvas.height = scrollHeight * scale;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(scale, scale);
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.85));
            } else {
              reject("Could not get canvas context");
            }
          };
          img.onerror = reject;
          img.src = svgDataUrl;
        });

        return dataUrl;
      } catch (svgError) {
        console.warn("SVG capture failed, trying PNG:", svgError);
        const jpegDataUrl = await domtoimage.toJpeg(element, {
          width: scrollWidth,
          height: scrollHeight,
          quality: 0.85,
          filter: (node: any) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "NAV" ||
              el.classList?.contains("search") ||
              (el.tagName === "BUTTON" && el.textContent?.includes("Search"))
            ) {
              return false;
            }
            return true;
          },
        });
        return jpegDataUrl;
      }
    } catch (error) {
      console.error("Failed to capture Devices screenshot:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    (window as any).__captureDevicesScreenshot = captureScreenshot;
    return () => {
      delete (window as any).__captureDevicesScreenshot;
    };
  }, [captureScreenshot]);

  const lastFetchedDevicesParamsRef = useRef<string | null>(null);

  const fetchDevices = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    if (plantId && organizationId) {
      const paramsKey = `${organizationId}-${plantId}`;
      if (lastFetchedDevicesParamsRef.current === paramsKey) {
        return;
      }

      lastFetchedDevicesParamsRef.current = paramsKey;
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          plantId: Number(plantId),
          organizationId: Number(organizationId),
        })
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            setDevices(res.data);
            setFilteredDevices(res.data);
          } else {
            Error(res.message || "Failed to get devices");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to get devices");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch, organizationId, plantId, isAuthenticated]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const handleStorageChange = () => {
      if (!isAuthenticated) {
        return;
      }
      const newPlantId = localStorage.getItem("plantId");
      const newOrganizationId = localStorage.getItem("organizationId");

      if (
        newPlantId &&
        newOrganizationId &&
        (newPlantId !== plantId || newOrganizationId !== organizationId)
      ) {
        const paramsKey = `${newOrganizationId}-${newPlantId}`;
        if (lastFetchedDevicesParamsRef.current === paramsKey) {
          return;
        }

        lastFetchedDevicesParamsRef.current = paramsKey;
        setIsLoading(true);
        dispatch(
          getDeviceByOrganizationIdAndPlantId({
            plantId: Number(newPlantId),
            organizationId: Number(newOrganizationId),
          })
        )
          .unwrap()
          .then((res) => {
            if (res.success) {
              setDevices(res.data);
              setFilteredDevices(res.data);
            } else {
              Error(res.message || "Failed to get devices");
            }
          })
          .catch((err) => {
            console.log(err);
            Error(err.message || "Failed to get devices");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener("plantChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("plantChanged", handleStorageChange);
    };
  }, [dispatch, plantId, organizationId, isAuthenticated]);

  useEffect(() => {
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(
        (device) =>
          device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (device.hwid &&
            device.hwid.toLowerCase().includes(searchTerm.toLowerCase())) ||
          device.device_status
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          device.device_type_id.toString().includes(searchTerm) ||
          device.device_family_id.toString().includes(searchTerm) ||
          device.device_status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm]);

  const groupDevicesBySystem = (devices: DevicesResult[]) => {
    const grouped: { [key: string]: DevicesResult[] } = {};

    devices.forEach((device) => {
      if (device.device_family_type === "virtual") {
        const virtualKey = "virtual-devices";
        if (!grouped[virtualKey]) {
          grouped[virtualKey] = [];
        }
        grouped[virtualKey].push(device);
      } else {
        const systemId = device.system_id?.toString() || "unknown";
        if (!grouped[systemId]) {
          grouped[systemId] = [];
        }
        grouped[systemId].push(device);
      }
    });

    return grouped;
  };

  const groupedDevices = groupDevicesBySystem(filteredDevices);

  const toggleSystemCollapse = (systemId: string) => {
    setCollapsedSystems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(systemId)) {
        newSet.delete(systemId);
      } else {
        newSet.add(systemId);
      }
      return newSet;
    });
  };

  const handleViewDevice = (device: DevicesResult) => {
    const deviceType = device?.device_family_type?.toLowerCase() || "";

    if (deviceType.includes("virtual")) {
      return;
    }

    if (deviceType.includes("fm") || deviceType.includes("FM")) {
      const route = `/device-details/fm-device/${device?.device_id}`;
      navigate(route);
    } else if (deviceType.includes("tank") || deviceType.includes("Tank")) {
      const route = `/device-details/tank-device/${device?.device_id}`;
      navigate(route);
    } else if (deviceType.includes("brwhms") || deviceType.includes("Brwhms")) {
      const route = `/device-details/brwhms-device/${device?.device_id}`;
      navigate(route);
    } else if (deviceType.includes("arg") || deviceType.includes("Arg")) {
      const route = `/device-details/arg-device/${device?.device_id}`;
      navigate(route);
    } else if (deviceType.includes("phmc") || deviceType.includes("Phmc")) {
      const route = `/device-details/phmc-device/${device?.device_id}`;
      navigate(route);
    } else {
      const route = `/device-details/fm-device/${device?.device_id}`;
      navigate(route);
    }
  };

  return (
    <div ref={devicesRef} className="flex flex-col gap-3 w-full h-full">
      <div className="flex items-center justify-between flex-col md:flex-row gap-3">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg w-fit">
          {userRole === "org_admin" && (
            <>
              <button
                onClick={() => {
                  const organizationId = localStorage.getItem("organizationId");
                  if (organizationId) {
                    navigate(`/organization/${organizationId}`);
                  }
                }}
                className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-text-primary font-normal font-roboto">
                  Organization
                </span>
              </button>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </>
          )}
          <button
            onClick={() => {
              const plantId = getCurrentPlantId();
              if (plantId) {
                navigate(`/plant/${plantId}`);
              }
            }}
            className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
          >
            {userRole === "org_user" && <Factory className="w-4 h-4" />}
            <span className="text-text-primary font-normal font-roboto">
              Plant
            </span>
          </button>
          <ChevronRight className="w-4 h-4 text-text-muted" />
          <span className="text-text-primary font-normal font-roboto">
            Devices
          </span>
        </nav>

        <div className="flex items-start md:items-center justify-end gap-2 md:gap-4 flex-col md:flex-row w-full">
          <div className="shrink-0 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search device"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-auto w-85 pl-10 pr-4 py-1.5 text-text-secondary bg-primary border border-border-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilteredDevices(devices);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 h-full overflow-y-auto">
        {isLoading ? (
          <div className="relative overflow-x-auto pb-0 flex-1 gap-2 flex flex-col">
            {[1, 2].map((systemIndex) => (
              <div key={systemIndex}>
                <div className="bg-primary px-4 pt-1 pb-3 rounded-md">
                  <div className="bg-primary flex items-start md:items-center justify-between flex-col md:flex-row">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-secondary/50 rounded">
                        <div className="w-5 h-5 bg-input-bg rounded animate-pulse"></div>
                      </div>
                      <div>
                        <div className="h-6 w-48 bg-input-bg rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
                        <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
                        <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
                        <div className="h-3 w-16 bg-input-bg rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((deviceIndex) => (
                      <div
                        key={deviceIndex}
                        className="rounded-lg px-3 py-2 bg-secondary shadow-sm border border-border-primary"
                      >
                        <div className="flex items-center justify-between mb-3 gap-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-3 h-3 rounded-full bg-input-bg animate-pulse shrink-0"></div>
                            <div className="h-4 w-32 bg-input-bg rounded animate-pulse"></div>
                          </div>
                          <div className="h-5 w-16 bg-input-bg rounded-lg animate-pulse"></div>
                        </div>

                        <div className="space-y-3 mb-2">
                          <div className="bg-overlay/20 rounded-lg py-2 px-3">
                            <div className="flex items-center gap-2 justify-center mb-3">
                              <div className="w-10 h-10 bg-input-bg rounded animate-pulse"></div>
                            </div>

                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="h-4 w-28 bg-input-bg rounded animate-pulse"></div>
                              <div className="h-4 w-20 bg-input-bg rounded animate-pulse"></div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                              <div className="h-4 w-16 bg-input-bg rounded animate-pulse"></div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="h-4 w-12 bg-input-bg rounded animate-pulse"></div>
                              <div className="h-4 w-20 bg-input-bg rounded animate-pulse"></div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="h-4 w-16 bg-input-bg rounded animate-pulse"></div>
                              <div className="h-4 w-24 bg-input-bg rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-input-bg rounded-full animate-pulse"></div>
                              <div className="h-3 w-20 bg-input-bg rounded animate-pulse"></div>
                            </div>
                            <div className="h-3 w-24 bg-input-bg rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-x-auto pb-0 flex-1 gap-2 flex flex-col">
            {Object.keys(groupedDevices).length > 0 ? (
              Object.entries(groupedDevices).map(
                ([systemId, systemDevices]) => {
                  return (
                    <div key={systemId}>
                      <div
                        className={`bg-primary px-4 pt-1 pb-3 ${
                          !collapsedSystems?.has(systemId) ? "rounded-md" : ""
                        }`}
                      >
                        <div className="bg-primary flex items-start md:items-center justify-between flex-col md:flex-row">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSystemCollapse(systemId)}
                              className="p-1 hover:bg-secondary/50 bg-secondary/50 cursor-pointer rounded transition-colors"
                            >
                              {collapsedSystems?.has(systemId) ? (
                                <ChevronDown className="w-5 h-5 text-text-primary" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-text-primary" />
                              )}
                            </button>
                            <div>
                              <h3 className="text-lg font-normal text-text-primary font-roboto">
                                {systemId === "virtual-devices"
                                  ? "Virtual Devices"
                                  : systemDevices[0]?.system_name ||
                                    "Unknown System"}
                              </h3>
                              <p className="text-sm text-text-secondary font-roboto">
                                {systemDevices?.length} device
                                {systemDevices?.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-status-success rounded-full"></div>
                              <span className="text-xs text-text-secondary font-roboto">
                                {systemDevices?.filter(
                                  (d) =>
                                    d.device_status?.toLowerCase() ===
                                      "active" &&
                                    !isRecordTimeOld(d?.last_record?.time)
                                ).length || 0}{" "}
                                Active
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-status-danger rounded-full"></div>
                              <span className="text-xs text-text-secondary font-roboto">
                                {systemDevices?.filter(
                                  (d) =>
                                    d.device_status?.toLowerCase() ===
                                      "inactive" ||
                                    isRecordTimeOld(d?.last_record?.time)
                                ).length || 0}{" "}
                                Inactive
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-status-warning rounded-full"></div>
                              <span className="text-xs text-text-secondary font-roboto">
                                {systemDevices?.filter(
                                  (d) =>
                                    d.device_status?.toLowerCase() !==
                                      "active" &&
                                    d.device_status?.toLowerCase() !==
                                      "inactive"
                                ).length || 0}{" "}
                                Other
                              </span>
                            </div>
                          </div>
                        </div>

                        {!collapsedSystems?.has(systemId) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                            {systemDevices?.map((device, index) => (
                              <DeviceCard
                                key={index}
                                device={device}
                                onViewDevice={handleViewDevice}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="text-text-primary text-center font-roboto text-sm w-full h-full">
                <NoDataFound
                  icon={
                    <Monitor className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  }
                  title={"No devices data found"}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Devices;
