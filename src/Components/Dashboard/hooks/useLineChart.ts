import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface ExtendedECharts extends echarts.ECharts {
  _resizeObserver?: ResizeObserver;
  _handleResize?: () => void;
}

interface DaywiseWaterBalanceData {
  flow_in?: number;
  flow_out?: number;
  percolation?: number;
  evaporation?: number;
  consumption?: number;
  wastage?: number;
  regeneration?: number;
  reuse?: number;
  rainfall?: number;
  neutrality?: number | null;
}

interface TooltipFormatterParam {
  axisValueLabel?: string;
  axisValue?: string;
  seriesName: string;
  data: number;
  marker: string;
}

interface UseLineChartProps {
  daywiseData?: Record<string, DaywiseWaterBalanceData> | null;
  unit?: string;
}

const getReportTypeColor = (reportType: string): string => {
  const colors: Record<string, string> = {
    "Flow In": "#5070de",
    "Flow Out": "#b6d733",
    Percolation: "#505472",
    Evaporation: "#fe994e",
    Consumption: "#0ca9df",
    Wastage: "#ffd209",
    Regeneration: "#fa6488",
    "Re-use": "#7a5db0",
    Rainfall: "#40bf96",
    "Water Neutrality Index": "#a2eac6",
  };
  return colors[reportType] || "#6B7280";
};

// Helper function to ensure negative values are treated as 0
// const ensureNonNegative = (value: number | undefined | null): number => {
//   if (value === undefined || value === null || isNaN(Number(value))) {
//     return 0;
//   }
//   const numValue = Number(value);
//   return numValue < 0 ? 0 : numValue;
// };

export const useLineChart = ({ daywiseData, unit }: UseLineChartProps = {}) => {
  const lineChartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const element = lineChartRef.current;
    if (!element) return;
    const hasDimensions = () => {
      return (
        element.clientWidth > 0 &&
        element.clientHeight > 0 &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    };

    const setupChart = (chart: echarts.ECharts) => {
      let dates: string[] = [];
      const dataSeries: Record<string, number[]> = {
        flowIn: [],
        flowOut: [],
        percolation: [],
        evaporation: [],
        consumption: [],
        wastage: [],
        regeneration: [],
        reuse: [],
        rainfall: [],
      };

      // Formula: ((Regeneration + Reuse + Percolation) / (Consumption + Evaporation + Wastage)) * 100
      const neutralityIndexData: number[] = [];

      if (daywiseData && Object.keys(daywiseData).length > 0) {
        const sortedDates = Object.keys(daywiseData).sort();

        const firstDateKey = sortedDates[0];
        let dateFormat: "min" | "hour" | "day" | "month" = "day";

        if (
          firstDateKey.includes(":") &&
          firstDateKey.split(" ").length === 2
        ) {
          const timePart = firstDateKey.split(" ")[1];
          if (timePart.split(":")[1] !== "00") {
            dateFormat = "min";
          } else {
            dateFormat = "hour";
          }
        } else if (firstDateKey.split("-").length === 2) {
          dateFormat = "month";
        } else {
          dateFormat = "day";
        }

        dates = sortedDates.map((dateStr) => {
          if (dateFormat === "min" || dateFormat === "hour") {
            const [datePart, timePart] = dateStr.split(" ");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minutes] = timePart.split(":").map(Number);
            const date = new Date(year, month - 1, day, hour, minutes || 0);
            const monthName = date.toLocaleDateString("en-US", {
              month: "short",
            });

            if (dateFormat === "min") {
              return `${monthName} ${day} ${String(hour).padStart(
                2,
                "0"
              )}:${String(minutes || 0).padStart(2, "0")}`;
            } else {
              return `${monthName} ${day} ${String(hour).padStart(2, "0")}:00`;
            }
          } else if (dateFormat === "month") {
            const [year, month] = dateStr.split("-").map(Number);
            const date = new Date(year, month - 1, 1);
            const monthName = date.toLocaleDateString("en-US", {
              month: "short",
            });
            return `${monthName} ${year}`;
          } else {
            const [year, month, day] = dateStr.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            const monthName = date.toLocaleDateString("en-US", {
              month: "short",
            });
            return `${monthName} ${day}`;
          }
        });

        sortedDates.forEach((dateStr) => {
          const dayData = daywiseData[dateStr];
          dataSeries.flowIn.push(dayData?.flow_in || 0);
          dataSeries.flowOut.push(dayData?.flow_out || 0);
          dataSeries.percolation.push(dayData?.percolation || 0);
          dataSeries.evaporation.push(dayData?.evaporation || 0);
          dataSeries.consumption.push(dayData?.consumption || 0);
          dataSeries.wastage.push(dayData?.wastage || 0);
          dataSeries.regeneration.push(dayData?.regeneration || 0);
          dataSeries.reuse.push(dayData?.reuse || 0);
          dataSeries.rainfall.push(dayData?.rainfall || 0);

          let neutralityValue = 0;

          if (
            dayData?.neutrality !== undefined &&
            dayData.neutrality !== null &&
            !isNaN(Number(dayData.neutrality))
          ) {
            const neutrality = Number(dayData.neutrality);
            neutralityValue = neutrality > 1 ? neutrality : neutrality * 100;
          } else {
            // Calculate neutrality from the formula using the same day's data
            const regeneration = Number(dayData?.regeneration || 0);
            const reuse = Number(dayData?.reuse || 0);
            const percolation = Number(dayData?.percolation || 0);
            const consumption = Number(dayData?.consumption || 0);
            const evaporation = Number(dayData?.evaporation || 0);
            const wastage = Number(dayData?.wastage || 0);

            // Calculate numerator: Regeneration + Reuse + Percolation
            const numerator = regeneration + reuse + percolation;

            // Calculate denominator: Consumption + Evaporation + Wastage
            const denominator = consumption + evaporation + wastage;

            // Calculate neutrality percentage, handle division by zero
            if (denominator > 0) {
              neutralityValue = (numerator / denominator) * 100;
            } else if (numerator > 0) {
              // If denominator is 0 but numerator > 0, set to a high value (e.g., 1000%)
              neutralityValue = 1000;
            } else {
              // Both are 0, neutrality is 0
              neutralityValue = 0;
            }
          }

          // Cap neutrality value at 120% for display
          const cappedNeutralityValue =
            neutralityValue > 120 ? 120 : neutralityValue;
          neutralityIndexData.push(cappedNeutralityValue);
        });
      }

      const allValues = Object.values(dataSeries).flat();
      const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
      const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
      const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;
      const yAxisMin =
        minValue < 0
          ? Math.floor(Math.min(minValue * 1.1, minValue * 1.05))
          : 0;

      // Y-axis max is always 120% since values are capped at 120%
      const neutralityYAxisMax = 120;

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross" },
          backgroundColor: "rgba(0,0,0,0.85)",
          borderColor: "transparent",
          borderRadius: 6,
          padding: [8, 12],
          textStyle: { color: "#fff", fontSize: 12 },
          formatter: function (params: TooltipFormatterParam[]) {
            if (!params || !params.length) return "";
            const date = params[0].axisValueLabel || params[0].axisValue;
            const availableLines = params
              .filter((p) => {
                if (p.seriesName === "Water Neutrality Index") {
                  return p.data !== null && p.data !== undefined;
                }
                return p.data !== null && p.data !== undefined && p.data !== 0;
              })
              .map((p) => {
                if (p.seriesName === "Water Neutrality Index") {
                  return `${p.marker} ${p.seriesName}: ${p.data.toFixed(2)}%`;
                }
                return `${p.marker} ${
                  p.seriesName
                }: ${p.data.toLocaleString()}`;
              });

            if (availableLines.length === 0) {
              return `${date}<br/>No data available`;
            }

            return `${date}<br/>${availableLines.join("<br/>")}`;
          },
        },
        grid: {
          left: "3%",
          right: "8%",
          bottom: "15%",
          top: "5%",
        },
        xAxis: {
          type: "category",
          data: dates,
          name: "Date",
          nameLocation: "middle",
          nameGap: 30,
          nameTextStyle: {
            color: "#64748b",
            fontSize: 12,
            fontWeight: 500,
          },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            fontSize: 10,
            color: "#94a3b8",
            rotate: dates.length > 10 ? 45 : 0,
          },
        },
        yAxis: [
          {
            type: "value",
            min: yAxisMin,
            max: yAxisMax,
            name: (() => {
              if (unit === "M^3") return "Water Quantity (m³)";
              if (unit) return `Water Quantity (${unit})`;
              return "Water Quantity";
            })(),
            nameLocation: "middle",
            nameGap: 40,
            position: "left",
            nameTextStyle: {
              color: "#64748b",
              fontSize: 12,
              fontWeight: 500,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              fontSize: 10,
              color: "#94a3b8",
              formatter: (value: number) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              },
            },
            splitLine: {
              lineStyle: {
                color: "#e2e8f0",
              },
            },
            scale: false,
            boundaryGap: ["5%", "5%"],
          },
          {
            type: "value",
            min: 0,
            max: neutralityYAxisMax,
            name: "Water Neutrality Index (%)",
            nameLocation: "middle",
            nameGap: 50,
            position: "right",
            nameTextStyle: {
              color: "#64748b",
              fontSize: 12,
              fontWeight: 500,
            },
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              fontSize: 10,
              color: "#94a3b8",
              formatter: (value: number) => {
                return `${value}%`;
              },
            },
            splitLine: {
              show: false,
            },
          },
        ],
        legend: {
          show: true,
          bottom: 0,
          left: "center",
          textStyle: {
            color: "#64748b",
            fontSize: 10,
          },
          itemWidth: 12,
          itemHeight: 8,
          itemGap: 12,
          type: "scroll",
          orient: "horizontal",
          pageButtonItemGap: 5,
          pageButtonGap: 10,
          pageButtonPosition: "end",
          pageFormatter: "{current}/{total}",
          pageIconColor: "#64748b",
          pageIconInactiveColor: "#94a3b8",
          pageIconSize: 12,
          pageTextStyle: {
            color: "#64748b",
            fontSize: 10,
          },
        },
        series: [
          {
            name: "Flow In",
            type: "line",
            data: dataSeries.flowIn,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            boundaryGap: false,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Flow In"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Flow In"),
              borderWidth: 1,
            },
          },
          {
            name: "Flow Out",
            type: "line",
            data: dataSeries.flowOut,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Flow Out"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Flow Out"),
              borderWidth: 1,
            },
          },
          {
            name: "Percolation",
            type: "line",
            data: dataSeries.percolation,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Percolation"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Percolation"),
              borderWidth: 1,
            },
          },
          {
            name: "Evaporation",
            type: "line",
            data: dataSeries.evaporation,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Evaporation"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Evaporation"),
              borderWidth: 1,
            },
          },
          {
            name: "Consumption",
            type: "line",
            data: dataSeries.consumption,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Consumption"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Consumption"),
              borderWidth: 1,
            },
          },
          {
            name: "Wastage",
            type: "line",
            data: dataSeries.wastage,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Wastage"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Wastage"),
              borderWidth: 1,
            },
          },
          {
            name: "Regeneration",
            type: "line",
            data: dataSeries.regeneration,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Regeneration"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Regeneration"),
              borderWidth: 1,
            },
          },
          {
            name: "Re-use",
            type: "line",
            data: dataSeries.reuse,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Re-use"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Re-use"),
              borderWidth: 1,
            },
          },
          {
            name: "Rainfall",
            type: "line",
            data: dataSeries.rainfall,
            smooth: false,
            symbol: "circle",
            symbolSize: 4,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Rainfall"),
              width: 1,
              type: "line",
            },
            itemStyle: {
              color: getReportTypeColor("Rainfall"),
              borderWidth: 1,
            },
          },
          {
            name: "Water Neutrality Index",
            type: "line",
            yAxisIndex: 1,
            data: neutralityIndexData.length > 0 ? neutralityIndexData : [],
            smooth: false,
            symbol: "circle",
            symbolSize: 5,
            showSymbol: true,
            emphasis: { focus: "series" },
            lineStyle: {
              color: getReportTypeColor("Water Neutrality Index"),
              width: 1,
              type: "dashed",
            },
            itemStyle: {
              color: getReportTypeColor("Water Neutrality Index"),
              borderWidth: 1,
            },
            z: 10,
          },
        ],
      };

      chart.setOption(option, { notMerge: false, lazyUpdate: false });

      if (chart && !chart.isDisposed()) {
        chart.resize();
      }

      const handleResize = () => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        if (
          isMountedRef.current &&
          chart &&
          !chart.isDisposed() &&
          lineChartRef.current
        ) {
          handleResize();
        }
      });

      if (lineChartRef.current && lineChartRef.current.parentNode) {
        try {
          resizeObserver.observe(lineChartRef.current);
        } catch (error) {
          console.warn("Error observing element:", error);
        }
      }

      window.addEventListener("resize", handleResize);

      (chart as ExtendedECharts)._resizeObserver = resizeObserver;
      (chart as ExtendedECharts)._handleResize = handleResize;
    };

    if (
      chartInstanceRef.current &&
      !chartInstanceRef.current.isDisposed() &&
      hasDimensions()
    ) {
      setupChart(chartInstanceRef.current);
      requestAnimationFrame(() => {
        if (
          chartInstanceRef.current &&
          !chartInstanceRef.current.isDisposed() &&
          lineChartRef.current
        ) {
          chartInstanceRef.current.resize();
        }
      });
      return;
    }

    if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
      try {
        if (lineChartRef.current && lineChartRef.current.parentNode) {
          chartInstanceRef.current.dispose();
        }
      } catch (error) {
        console.warn("Error disposing existing chart:", error);
      }
      chartInstanceRef.current = null;
    }

    const initChart = () => {
      if (
        !isMountedRef.current ||
        !lineChartRef.current ||
        !lineChartRef.current.parentNode
      ) {
        return;
      }

      if (!hasDimensions()) {
        requestAnimationFrame(() => {
          if (
            !isMountedRef.current ||
            !lineChartRef.current ||
            !lineChartRef.current.parentNode
          ) {
            return;
          }
          if (hasDimensions()) {
            if (
              !chartInstanceRef.current ||
              chartInstanceRef.current.isDisposed()
            ) {
              const chart = echarts.init(element);
              chartInstanceRef.current = chart;
              setupChart(chart);
            } else {
              setupChart(chartInstanceRef.current);
            }
          } else {
            setTimeout(() => {
              if (
                !isMountedRef.current ||
                !lineChartRef.current ||
                !lineChartRef.current.parentNode
              ) {
                return;
              }
              if (hasDimensions()) {
                if (
                  !chartInstanceRef.current ||
                  chartInstanceRef.current.isDisposed()
                ) {
                  const chart = echarts.init(element);
                  chartInstanceRef.current = chart;
                  setupChart(chart);
                } else {
                  setupChart(chartInstanceRef.current);
                }
              }
            }, 100);
          }
        });
        return;
      }

      if (!chartInstanceRef.current || chartInstanceRef.current.isDisposed()) {
        const chart = echarts.init(element);
        chartInstanceRef.current = chart;
        setupChart(chart);
      } else {
        setupChart(chartInstanceRef.current);
      }
    };

    initChart();

    return () => {
      isMountedRef.current = false;

      if (chartInstanceRef.current) {
        const chart = chartInstanceRef.current as ExtendedECharts;
        const resizeObserver = chart._resizeObserver;
        const handleResize = chart._handleResize;

        if (resizeObserver) {
          try {
            resizeObserver.disconnect();
          } catch {
            // Already disconnected
          }
        }

        if (handleResize) {
          try {
            window.removeEventListener("resize", handleResize);
          } catch {
            // Already removed
          }
        }

        try {
          if (
            !chart.isDisposed() &&
            element &&
            element.parentNode &&
            document.body.contains(element)
          ) {
            chart.dispose();
          }
        } catch {
          // Chart may already be disposed or element removed
          // Silently ignore to prevent React errors
        }
        chartInstanceRef.current = null;
      }
    };
  }, [daywiseData, unit]);

  return lineChartRef;
};
