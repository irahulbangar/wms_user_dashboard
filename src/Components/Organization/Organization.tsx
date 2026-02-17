import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/store";
import { getPlantsByUserId, setPlants } from "../../../store/plantSlice";
import { Error } from "../../utils/toast";
import DateSelection from "../Dashboard/DateSelection";
import AnalysisPieChartCard from "../Department/AnalysisPieChartCard";
import { calculateWaterBalanceData } from "../../utils/waterBalanceHelpers";
import {
  calculateOrganizationStorageBalance,
  calculatePlantWaterBalance,
  getOrganizationStorageBalanceColors,
  getPlantWaterBalanceColors,
} from "../../utils/balanceCalculations";
import { getPlantReport } from "../../../store/plantSlice";
import type { PlantReportData } from "../../../model/plant-report.interface";
import { getDateRange } from "../../utils/utils";
import { Warning } from "../../utils/toast";
import { FileTextIcon } from "lucide-react";
import { useLineChart } from "../Dashboard/hooks/useLineChart";
import WaterBalanceTable from "../Department/WaterBalanceTable";
import {
  getDeviceByOrganizationIdAndPlantId,
  setDevices,
} from "../../../store/deviceSlice";
import { PlantBalanceCard } from "./PlantBalanceCard";
import type { PlantResult } from "../../../model/plant.interface";
import LineChartSkeleton from "../Dashboard/LineChartSkeleton";
import { getReportTypeColor } from "../../utils/deviceHelpers";

const Organization = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const getDateTypeLabel = () => {
    if (!dateSelectionType) return "";
    return (
      dateSelectionType.charAt(0).toUpperCase() + dateSelectionType.slice(1)
    );
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };
  const initialMonthYear = useRef(getCurrentMonthYear());
  const [monthYear, setMonthYear] = useState(initialMonthYear.current);
  const [dateSelectionType, setDateSelectionType] = useState<
    "daily" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [dailyDate, setDailyDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [yearlyDate, setYearlyDate] = useState(() => {
    return String(new Date().getFullYear());
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const [durationType, setDurationType] = useState<
    "min" | "hour" | "day" | "month"
  >(() => {
    const defaultDateType = "monthly" as
      | "daily"
      | "monthly"
      | "yearly"
      | "custom";
    switch (defaultDateType) {
      case "daily":
        return "hour";
      case "monthly":
        return "day";
      case "yearly":
        return "month";
      case "custom":
        return "day";
      default:
        return "hour";
    }
  });

  useEffect(() => {
    switch (dateSelectionType) {
      case "daily":
        setDurationType("hour");
        break;
      case "monthly":
        setDurationType("day");
        break;
      case "yearly":
        setDurationType("month");
        break;
      case "custom":
        setDurationType("day");
        break;
      default:
        setDurationType("hour");
    }
  }, [dateSelectionType]);
  const [plantReportData, setPlantReportData] = useState<
    Record<number, PlantReportData | null>
  >({});
  const lastFetchedDevicesParamsRef = useRef<string>("");
  const hasFetchedForOrganizationRef = useRef<string | null>(null);
  const { devices } = useAppSelector((state) => state.device);
  const { plants } = useAppSelector((state) => state.plant);
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const plantId = localStorage.getItem("plantId");
  const organizationId = localStorage.getItem("organizationId");

  const aggregatedWaterBalanceData = useMemo(() => {
    if (!plantReportData || Object.keys(plantReportData).length === 0) {
      return null;
    }

    const aggregated: Record<string, number> = {
      Flow_in: 0,
      Flow_out: 0,
      Percolation: 0,
      Evaporation: 0,
      Consumption: 0,
      Wastage: 0,
      Regeneration: 0,
      "Re-use": 0,
      Rainfall: 0,
    };

    const neutralityIndexValues: number[] = [];

    Object.values(plantReportData).forEach((plantReport) => {
      if (!plantReport) return;

      const entries = Object.entries(plantReport);

      entries.forEach(([dateKey, data]) => {
        try {
          const entryDate = new Date(dateKey);
          let shouldInclude = false;

          switch (dateSelectionType) {
            case "daily": {
              const selectedDate = new Date(dailyDate + "T00:00:00");
              shouldInclude =
                entryDate.getFullYear() === selectedDate.getFullYear() &&
                entryDate.getMonth() === selectedDate.getMonth() &&
                entryDate.getDate() === selectedDate.getDate();
              break;
            }
            case "monthly": {
              const [year, month] = monthYear.split("-");
              shouldInclude =
                entryDate.getFullYear() === Number(year) &&
                entryDate.getMonth() === Number(month) - 1;
              break;
            }
            case "yearly": {
              const year = Number(yearlyDate);
              shouldInclude = entryDate.getFullYear() === year;
              break;
            }
            case "custom": {
              const startDate = new Date(customStartDate + "T00:00:00");
              const endDate = new Date(customEndDate + "T23:59:59");
              shouldInclude = entryDate >= startDate && entryDate <= endDate;
              break;
            }
          }

          if (shouldInclude && data && typeof data === "object") {
            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "Storage" &&
                key !== "Flow" &&
                typeof value === "number" &&
                !isNaN(value)
              ) {
                if (key === "Neutrality-Index") {
                  neutralityIndexValues.push(value);
                } else {
                  aggregated[key] = (aggregated[key] || 0) + value;
                }
              }
            });
          }
        } catch (error) {
          console.warn("Error processing date entry:", dateKey, error);
        }
      });
    });

    const averageNeutralityIndex =
      neutralityIndexValues.length > 0
        ? neutralityIndexValues.reduce((sum, val) => sum + val, 0) /
          neutralityIndexValues.length
        : 0;

    const hasData = Object.values(aggregated).some((value) => value > 0);

    if (!hasData) {
      return null;
    }

    return {
      flow_in: aggregated.Flow_in || 0,
      flow_out: aggregated.Flow_out || 0,
      percolation: aggregated.Percolation || 0,
      evaporation: aggregated.Evaporation || 0,
      consumption: aggregated.Consumption || 0,
      wastage: aggregated.Wastage || 0,
      regeneration: aggregated.Regeneration || 0,
      reuse: aggregated["Re-use"] || 0,
      rainfall: aggregated.Rainfall || 0,
      neutrality: averageNeutralityIndex,
    };
  }, [
    plantReportData,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const aggregatedDaywiseData = useMemo(() => {
    if (!plantReportData || Object.keys(plantReportData).length === 0) {
      return null;
    }

    const daywiseData: Record<string, Record<string, number>> = {};

    const getDateKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minutes = date.getMinutes();

      switch (durationType) {
        case "min": {
          const roundedMinutes = Math.floor(minutes / 15) * 15;
          const roundedMins = String(roundedMinutes).padStart(2, "0");
          return `${year}-${month}-${day} ${hour}:${roundedMins}`;
        }
        case "hour": {
          return `${year}-${month}-${day} ${hour}:00`;
        }
        case "day": {
          return `${year}-${month}-${day}`;
        }
        case "month": {
          return `${year}-${month}`;
        }
        default:
          return `${year}-${month}-${day}`;
      }
    };

    Object.values(plantReportData).forEach((plantReport) => {
      if (!plantReport) return;

      Object.entries(plantReport).forEach(([dateKey, data]) => {
        try {
          const entryDate = new Date(dateKey);
          let shouldInclude = false;

          switch (dateSelectionType) {
            case "daily": {
              const selectedDate = new Date(dailyDate + "T00:00:00");
              shouldInclude =
                entryDate.getFullYear() === selectedDate.getFullYear() &&
                entryDate.getMonth() === selectedDate.getMonth() &&
                entryDate.getDate() === selectedDate.getDate();
              break;
            }
            case "monthly": {
              const [year, month] = monthYear.split("-");
              shouldInclude =
                entryDate.getFullYear() === Number(year) &&
                entryDate.getMonth() === Number(month) - 1;
              break;
            }
            case "yearly": {
              const year = Number(yearlyDate);
              shouldInclude = entryDate.getFullYear() === year;
              break;
            }
            case "custom": {
              const startDate = new Date(customStartDate + "T00:00:00");
              const endDate = new Date(customEndDate + "T23:59:59");
              shouldInclude = entryDate >= startDate && entryDate <= endDate;
              break;
            }
          }

          if (shouldInclude && data && typeof data === "object") {
            const groupKey = getDateKey(entryDate);

            if (!daywiseData[groupKey]) {
              daywiseData[groupKey] = {
                flow_in: 0,
                flow_out: 0,
                percolation: 0,
                evaporation: 0,
                consumption: 0,
                wastage: 0,
                regeneration: 0,
                reuse: 0,
                rainfall: 0,
                neutrality: 0,
              };
            }

            if (!daywiseData[groupKey]._neutralityCount) {
              (daywiseData[groupKey] as any)._neutralityCount = 0;
              (daywiseData[groupKey] as any)._neutralitySum = 0;
            }

            const keyMap: Record<string, keyof (typeof daywiseData)[string]> = {
              Flow_in: "flow_in",
              Flow_out: "flow_out",
              Percolation: "percolation",
              Evaporation: "evaporation",
              Consumption: "consumption",
              Wastage: "wastage",
              Regeneration: "regeneration",
              "Re-use": "reuse",
              Rainfall: "rainfall",
              "Neutrality-Index": "neutrality",
            };

            Object.entries(data).forEach(([key, value]) => {
              if (
                key !== "Storage" &&
                key !== "Flow" &&
                typeof value === "number" &&
                !isNaN(value)
              ) {
                if (key === "Neutrality-Index") {
                  (daywiseData[groupKey] as any)._neutralitySum += value;
                  (daywiseData[groupKey] as any)._neutralityCount += 1;
                } else {
                  const mappedKey = keyMap[key];
                  if (mappedKey) {
                    daywiseData[groupKey][mappedKey] += value;
                  }
                }
              }
            });
          }
        } catch (error) {
          console.warn(
            "Error processing date entry for daywise data:",
            dateKey,
            error,
          );
        }
      });
    });

    Object.keys(daywiseData).forEach((groupKey) => {
      const dayData = daywiseData[groupKey] as any;
      if (dayData._neutralityCount && dayData._neutralityCount > 0) {
        dayData.neutrality = dayData._neutralitySum / dayData._neutralityCount;
      }
      delete dayData._neutralityCount;
      delete dayData._neutralitySum;
    });

    const hasData =
      Object.keys(daywiseData).length > 0 &&
      Object.values(daywiseData).some((dayData) =>
        Object.values(dayData).some((value) => value > 0),
      );

    return hasData ? daywiseData : null;
  }, [
    plantReportData,
    dateSelectionType,
    durationType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const lineChartRef = useLineChart({
    daywiseData: aggregatedDaywiseData,
    unit: devices?.[0]?.unit || "",
  });

  const aggregatedReportNameWise = aggregatedWaterBalanceData;

  const totalNetBalance = useMemo(() => {
    if (!aggregatedWaterBalanceData) return 0;

    const waterBalanceInData =
      (aggregatedWaterBalanceData.flow_in || 0) +
      (aggregatedWaterBalanceData.rainfall || 0) +
      (aggregatedWaterBalanceData.regeneration || 0) +
      (aggregatedWaterBalanceData.reuse || 0);

    const waterBalanceOutData =
      (aggregatedWaterBalanceData.flow_out || 0) +
      (aggregatedWaterBalanceData.percolation || 0) +
      (aggregatedWaterBalanceData.consumption || 0) +
      (aggregatedWaterBalanceData.wastage || 0) +
      (aggregatedWaterBalanceData.evaporation || 0);

    return waterBalanceInData - waterBalanceOutData;
  }, [aggregatedWaterBalanceData]);

  const organizationPlants = useMemo(() => {
    if (!organizationId || !plants || plants.length === 0) return [];
    return plants.filter(
      (plant) => plant.organization_id === Number(organizationId),
    );
  }, [plants, organizationId]);

  const fetchPlantReportData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    if (!organizationId || organizationPlants.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { fromDate, toDate } = getDateRange(
      dateSelectionType,
      dailyDate,
      monthYear,
      yearlyDate,
      customStartDate,
      customEndDate,
    );

    try {
      const plantPromises = organizationPlants.map((plant) =>
        dispatch(
          getPlantReport({
            plant_id: plant.plant_id,
            department_id: 0,
            system_id: 0,
            from_date: fromDate,
            to_date: toDate,
            duration: durationType,
          }),
        ).unwrap(),
      );

      const results = await Promise.all(plantPromises);
      const plantDataMap: Record<number, PlantReportData | null> = {};

      results.forEach((res, index) => {
        const plant = organizationPlants[index];
        if (res.success && res.data?.report) {
          plantDataMap[plant.plant_id] = res.data.report;
        } else {
          plantDataMap[plant.plant_id] = null;
        }
      });

      setPlantReportData(plantDataMap);
    } catch (err: unknown) {
      console.log(err);
      Error((err as Error)?.message || "Failed to get plant reports");
    } finally {
      setIsLoading(false);
    }
  }, [
    dispatch,
    organizationId,
    organizationPlants,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
    durationType,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!organizationId || organizationPlants.length === 0) {
      hasFetchedForOrganizationRef.current = null;
      return;
    }

    const plantIds = organizationPlants
      .map((plant) => plant.plant_id)
      .sort((a, b) => a - b)
      .join(",");
    const orgKey = `${organizationId}-${plantIds}`;

    if (hasFetchedForOrganizationRef.current !== orgKey) {
      hasFetchedForOrganizationRef.current = orgKey;
      fetchPlantReportData();
    }
  }, [organizationId, organizationPlants, fetchPlantReportData]);

  const waterBalanceData = useMemo(() => {
    return calculateWaterBalanceData(
      aggregatedReportNameWise,
      devices,
      calculatePlantWaterBalance,
      organizationId,
      !!(devices && devices.length > 0 && plantId),
    );
  }, [aggregatedReportNameWise, devices, plantId, organizationId]);

  const waterBalanceColors = useMemo(() => getPlantWaterBalanceColors(), []);

  const storageBalanceData = useMemo(
    () => calculateOrganizationStorageBalance(devices, organizationId || 0),
    [devices, organizationId],
  );

  const storageBalanceColors = useMemo(
    () => getOrganizationStorageBalanceColors(),
    [],
  );

  const waterNeutralityIndexColors = useMemo(() => {
    return [
      getReportTypeColor("Percolation"),
      getReportTypeColor("Wastage"),
      getReportTypeColor("Consumption"),
      getReportTypeColor("Regeneration"),
      getReportTypeColor("Evaporation"),
      getReportTypeColor("Re-use"),
    ];
  }, []);

  const waterNeutralityIndexData = useMemo(() => {
    if (!aggregatedWaterBalanceData) {
      return [];
    }
    const hasData =
      (aggregatedWaterBalanceData.percolation || 0) > 0 ||
      (aggregatedWaterBalanceData.wastage || 0) > 0 ||
      (aggregatedWaterBalanceData.consumption || 0) > 0 ||
      (aggregatedWaterBalanceData.regeneration || 0) > 0 ||
      (aggregatedWaterBalanceData.evaporation || 0) > 0 ||
      (aggregatedWaterBalanceData.reuse || 0) > 0;

    if (!hasData) {
      return [];
    }

    return [
      {
        name: "Percolation",
        value: aggregatedWaterBalanceData.percolation || 0,
        color: waterNeutralityIndexColors[0],
      },
      {
        name: "Wastage",
        value: aggregatedWaterBalanceData.wastage || 0,
        color: waterNeutralityIndexColors[1],
      },
      {
        name: "Consumption",
        value: aggregatedWaterBalanceData.consumption || 0,
        color: waterNeutralityIndexColors[2],
      },
      {
        name: "Regeneration",
        value: aggregatedWaterBalanceData.regeneration || 0,
        color: waterNeutralityIndexColors[3],
      },
      {
        name: "Evaporation",
        value: aggregatedWaterBalanceData.evaporation || 0,
        color: waterNeutralityIndexColors[4],
      },
      {
        name: "Re-use",
        value: aggregatedWaterBalanceData.reuse || 0,
        color: waterNeutralityIndexColors[5],
      },
    ];
  }, [aggregatedWaterBalanceData, waterNeutralityIndexColors]);

  const waterNeutralityIndexValue = useMemo(() => {
    if (!aggregatedWaterBalanceData) return 0;
    return aggregatedWaterBalanceData.neutrality || 0;
  }, [aggregatedWaterBalanceData]);

  const hasWaterNeutralityDataArray = useMemo(() => {
    return (
      waterNeutralityIndexData &&
      waterNeutralityIndexData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices &&
      devices.length > 0
    );
  }, [waterNeutralityIndexData, aggregatedWaterBalanceData, devices]);

  const hasStorageDataArray = useMemo(() => {
    return (
      storageBalanceData &&
      storageBalanceData.length > 0 &&
      devices &&
      devices.length > 0
    );
  }, [storageBalanceData, devices]);

  const waterQualityColors = useMemo(() => {
    return [
      getReportTypeColor("PH"),
      getReportTypeColor("EC"),
      getReportTypeColor("TDS"),
      getReportTypeColor("COD"),
      getReportTypeColor("BOD"),
    ];
  }, []);

  const waterQualityData = useMemo(() => {
    return [
      {
        name: "PH",
        value: 0.01,
        color: waterQualityColors[0],
      },
      {
        name: "EC",
        value: 0.01,
        color: waterQualityColors[1],
      },
      {
        name: "TDS",
        value: 0.01,
        color: waterQualityColors[2],
      },
      {
        name: "COD",
        value: 0.01,
        color: waterQualityColors[3],
      },
      {
        name: "BOD",
        value: 0.01,
        color: waterQualityColors[4],
      },
    ];
  }, [waterQualityColors]);

  const plantBalances = useMemo(() => {
    return Object.entries(plantReportData)
      .map(([plantIdStr, plantReport]) => {
        const plantIdNum = Number(plantIdStr);
        const plant = organizationPlants.find((p) => p.plant_id === plantIdNum);

        if (!plantReport) {
          return null;
        }

        const aggregated: Record<string, number> = {
          Flow_in: 0,
          Flow_out: 0,
          Percolation: 0,
          Evaporation: 0,
          Consumption: 0,
          Wastage: 0,
          Regeneration: 0,
          "Re-use": 0,
          Rainfall: 0,
        };

        Object.entries(plantReport).forEach(([dateKey, data]) => {
          try {
            const entryDate = new Date(dateKey);
            let shouldInclude = false;

            switch (dateSelectionType) {
              case "daily": {
                const selectedDate = new Date(dailyDate + "T00:00:00");
                shouldInclude =
                  entryDate.getFullYear() === selectedDate.getFullYear() &&
                  entryDate.getMonth() === selectedDate.getMonth() &&
                  entryDate.getDate() === selectedDate.getDate();
                break;
              }
              case "monthly": {
                const [year, month] = monthYear.split("-");
                shouldInclude =
                  entryDate.getFullYear() === Number(year) &&
                  entryDate.getMonth() === Number(month) - 1;
                break;
              }
              case "yearly": {
                const year = Number(yearlyDate);
                shouldInclude = entryDate.getFullYear() === year;
                break;
              }
              case "custom": {
                const startDate = new Date(customStartDate + "T00:00:00");
                const endDate = new Date(customEndDate + "T23:59:59");
                shouldInclude = entryDate >= startDate && entryDate <= endDate;
                break;
              }
            }

            if (shouldInclude && data && typeof data === "object") {
              Object.entries(data).forEach(([key, value]) => {
                if (
                  key !== "Storage" &&
                  key !== "Flow" &&
                  key !== "Neutrality-Index" &&
                  typeof value === "number" &&
                  !isNaN(value)
                ) {
                  aggregated[key] = (aggregated[key] || 0) + value;
                }
              });
            }
          } catch (error) {
            console.warn(
              "Error processing plant balance date entry:",
              dateKey,
              error,
            );
          }
        });

        const totalIn =
          (aggregated.Flow_in || 0) +
          (aggregated.Rainfall || 0) +
          (aggregated.Regeneration || 0) +
          (aggregated["Re-use"] || 0);
        const totalOut =
          (aggregated.Flow_out || 0) +
          (aggregated.Percolation || 0) +
          (aggregated.Consumption || 0) +
          (aggregated.Wastage || 0) +
          (aggregated.Evaporation || 0);

        const plantDevice = devices.find((d) => d.plant_id === plantIdNum);
        return {
          id: plantIdNum,
          name: plant?.plant_name || `Plant ${plantIdNum}`,
          totalIn,
          totalOut,
          balance: totalIn - totalOut || 0,
          unit: plantDevice?.unit || "",
          organizationId: plant?.organization_id || organizationId,
          plantId: plant?.plant_id || plantIdNum,
        };
      })
      .filter((balance) => balance !== null)
      .sort((a, b) => (a?.id || 0) - (b?.id || 0)) as Array<{
      id: number;
      name: string;
      totalIn: number;
      totalOut: number;
      balance: number;
      unit: string;
      organizationId: string | null;
      plantId: number;
    }>;
  }, [
    plantReportData,
    organizationPlants,
    organizationId,
    devices,
    dateSelectionType,
    dailyDate,
    monthYear,
    yearlyDate,
    customStartDate,
    customEndDate,
  ]);

  const fetchPlants = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    const hasExistingPlants = plants && plants.length > 0;
    if (!hasExistingPlants) {
      setIsLoading(true);
    }
    dispatch(getPlantsByUserId())
      .unwrap()
      .then((res) => {
        if (res.success) {
          const currentPlantIds = plants
            .map((p) => p.plant_id)
            .sort()
            .join(",");
          const newPlantIds = res.data
            .map((p) => p.plant_id)
            .sort()
            .join(",");

          if (currentPlantIds !== newPlantIds) {
            dispatch(setPlants(res.data));
          }

          const userRole = user?.role || user?.plantsList?.[0]?.role;
          if (userRole === "org_admin" && res.data && res.data.length > 0) {
            const firstPlant = res.data[0];
            if (firstPlant && firstPlant.plant_id) {
              const currentPlantId = localStorage.getItem("plantId");
              if (!currentPlantId) {
                localStorage.setItem("plantId", firstPlant.plant_id.toString());
              }
            }
          }
        } else {
          Error(res.message || "Failed to fetch plants");
        }
      })
      .catch((err: unknown) => {
        Error((err as Error)?.message || "Failed to fetch plants");
      })
      .finally(() => {
        if (!hasExistingPlants) {
          setIsLoading(false);
        }
      });
  }, [dispatch, user, isAuthenticated]);

  const fetchDevices = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }
    if (organizationId && plantId) {
      setIsLoading(true);
      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          organizationId: Number(organizationId),
          plantId: Number(plantId),
        }),
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res.data));
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
    fetchPlants();
    if (organizationId && plantId) {
      const paramsKey = `${organizationId}-${plantId}`;

      if (paramsKey !== lastFetchedDevicesParamsRef.current) {
        lastFetchedDevicesParamsRef.current = paramsKey;
        fetchDevices();
      }
    }
  }, [organizationId, plantId, fetchDevices, fetchPlants]);

  const hasWaterBalanceDataArray = useMemo(() => {
    return (
      waterBalanceData &&
      waterBalanceData.length > 0 &&
      aggregatedWaterBalanceData !== null &&
      devices &&
      devices.length > 0
    );
  }, [waterBalanceData, aggregatedWaterBalanceData, devices]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center gap-3 flex-col md:flex-row">
        <DateSelection
          dateSelectionType={dateSelectionType}
          setDateSelectionType={setDateSelectionType}
          dailyDate={dailyDate}
          setDailyDate={setDailyDate}
          monthYear={monthYear}
          setMonthYear={setMonthYear}
          yearlyDate={yearlyDate}
          setYearlyDate={setYearlyDate}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          durationType={durationType}
          setDurationType={setDurationType}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (!organizationId || organizationPlants.length === 0) {
                Warning(
                  "Please select an organization with plants to fetch data",
                );
                return;
              }
              fetchPlantReportData();
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-status-info to-status-info text-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto font-normal whitespace-nowrap"
            title="Get Data"
          >
            <FileTextIcon className="w-5 h-5" />
            Get Data
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto mt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnalysisPieChartCard
            title="Water Balance"
            data={waterBalanceData}
            colors={waterBalanceColors}
            isLoading={isLoading || !hasWaterBalanceDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={null}
          />
          <AnalysisPieChartCard
            title="Water Neutrality Index"
            data={waterNeutralityIndexData}
            colors={waterNeutralityIndexColors}
            isLoading={isLoading || !hasWaterNeutralityDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={waterNeutralityIndexValue}
          />
          <AnalysisPieChartCard
            title="Storage Analysis"
            data={storageBalanceData}
            colors={storageBalanceColors}
            isLoading={isLoading || !hasStorageDataArray}
            noDataMessage="No data found"
            neutralityIndexValue={null}
          />
          {/* Static Water Quality Card */}
          <div className="bg-card rounded-lg px-4 py-1 shadow-md flex flex-col items-center h-full">
            <h3 className="text-text-primary text-base font-normal font-roboto whitespace-nowrap">
              Water Quality
            </h3>
            <div className="flex items-center justify-start flex-col h-full w-full">
              <div className="flex flex-col items-center justify-center mt-3">
                <div className="w-[150px] h-[150px] rounded-full bg-input-bg flex items-center justify-center">
                  <span className="text-text-secondary text-sm font-roboto">
                    No Data Available
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap justify-center mt-4">
                {waterQualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div
                      className="w-4 h-2 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-roboto text-text-primary whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
              Water Balance {dateSelectionType && getDateTypeLabel()}
            </h3>
          </div>
          {isLoading ? (
            <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
              <LineChartSkeleton />

              <WaterBalanceTable
                reportData={null}
                totalNetBalance={0}
                unit={devices[0]?.unit || ""}
                isLoading={true}
              />
            </div>
          ) : (
            <div className="flex gap-4 md:flex-row flex-col md:items-stretch">
              <div className="h-[300px] md:h-auto md:min-h-[300px] w-full bg-card rounded-lg p-2">
                <div ref={lineChartRef} className="w-full h-full"></div>
              </div>
              <WaterBalanceTable
                reportData={
                  aggregatedReportNameWise as unknown as Record<
                    string,
                    number
                  > | null
                }
                totalNetBalance={totalNetBalance}
                unit={devices[0]?.unit || ""}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        <PlantBalanceCard
          plantBalances={plantBalances}
          plants={devices as unknown as PlantResult[]}
          organizationId={organizationId}
          plantId={plantId}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
export default Organization;
