import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  subtitle?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  colors?: string[];
  unit?: string;
}

const getReportTypeColor = (reportTypeName: string): string => {
  const defaultColors = [
    "#5070de",
    "#b6d733",
    "#505472",
    "#fe994e",
    "#0ca9df",
    "#ffd209",
    "#fa6488",
    "#7a5db0",
    "#b8322d",
    "#40bf96",
    "#515670",
    "#7da6d2",
  ];

  const colorMap: Record<string, number> = {
    "Flow In": 0,
    "Total In": 0,
    "Flow Out": 1,
    "Total Out": 1,
    Percolation: 2,
    Evaporation: 3,
    Consumption: 4,
    Wastage: 5,
    Regeneration: 6,
    "Re-use": 7,
    Rainfall: 9,
    "Total Stock": 0,
    "Available Capacity": 11,
  };

  const colorIndex =
    colorMap[reportTypeName] ??
    reportTypeName.charCodeAt(0) % defaultColors.length;

  return defaultColors[colorIndex];
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  width = 300,
  showLegend = true,
  unit,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current && !chartInstance.current.isDisposed()) {
      try {
        chartInstance.current.dispose();
      } catch (error) {
        console.warn("Error disposing existing chart:", error);
      }
      chartInstance.current = null;
    }

    const element = chartRef.current;
    const hasDimensions = () => {
      return (
        element.clientWidth > 0 &&
        element.clientHeight > 0 &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    };

    const initChart = () => {
      if (!hasDimensions()) {
        requestAnimationFrame(() => {
          if (hasDimensions()) {
            const chart = echarts.init(element);
            chartInstance.current = chart;
            setupChart(chart);
          } else {
            setTimeout(() => {
              if (hasDimensions() && !chartInstance.current) {
                const chart = echarts.init(element);
                chartInstance.current = chart;
                setupChart(chart);
              }
            }, 100);
          }
        });
        return;
      }

      const chart = echarts.init(element);
      chartInstance.current = chart;
      setupChart(chart);
    };

    const setupChart = (chart: echarts.ECharts) => {
      const filteredData = data.filter((item) => item.value > 0);

      const chartData = filteredData.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color || getReportTypeColor(item.name),
        },
      }));

      const option = {
        title: {
          show: false,
        },
        tooltip: {
          trigger: "item",
          formatter: function (params: any) {
            const value =
              unit === "M^3"
                ? (Math.abs(params.value) / 1000).toFixed(2)
                : Math.abs(params.value).toFixed(1);
            const unitText = unit === "M^3" ? "m³" : unit || "";
            return `${params.name}: ${value} ${unitText} (${params.percent}%)`;
          },
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          borderColor: "transparent",
          borderRadius: 6,
          padding: [8, 12],
          textStyle: {
            color: "#fff",
            fontSize: 12,
            fontWeight: "normal",
          },
          position: function (
            point: number[],
            _params: any,
            _dom: HTMLElement,
            _rect: any,
            size: any,
          ) {
            const chartContainer = chartRef.current;
            if (!chartContainer) return [point[0] + 20, point[1] - 20];

            const containerRect = chartContainer.getBoundingClientRect();
            const tooltipWidth = size.contentSize[0];
            const tooltipHeight = size.contentSize[1];

            const offsetX = 25;
            const offsetY = 25;

            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            let x: number;
            let y: number;

            if (point[0] > centerX) {
              x = point[0] + offsetX;

              if (x + tooltipWidth > containerRect.width) {
                x = point[0] - tooltipWidth - offsetX;
              }
            } else {
              x = point[0] - tooltipWidth - offsetX;

              if (x < 0) {
                x = point[0] + offsetX;
              }
            }

            if (point[1] > centerY) {
              y = point[1] + offsetY;

              if (y + tooltipHeight > containerRect.height) {
                y = point[1] - tooltipHeight - offsetY;
              }
            } else {
              y = point[1] - tooltipHeight - offsetY;

              if (y < 0) {
                y = point[1] + offsetY;
              }
            }

            if (x < 0) x = 10;
            if (x + tooltipWidth > containerRect.width) {
              x = containerRect.width - tooltipWidth - 10;
            }
            if (y < 0) y = 10;
            if (y + tooltipHeight > containerRect.height) {
              y = containerRect.height - tooltipHeight - 10;
            }

            return [x, y];
          },
          confine: true,
          extraCssText:
            "z-index: 0; max-width: none; white-space: nowrap; pointer-events: none;",
        },
        legend: {
          show: showLegend,
          orient: "horizontal",
          top: "top",
          left: "center",
          itemGap: 20,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            color: "#ffffff",
            fontSize: 12,
            fontFamily: "Roboto, sans-serif",
          },
          data: chartData.map((item) => item.name),
          formatter: function (name: string) {
            return name;
          },
        },
        series: [
          {
            name: title,
            type: "pie",
            radius: ["25%", "75%"],
            center: ["50%", "50%"],
            avoidLabelOverlap: false,
            minAngle: 0,
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 0,
            },
            label: {
              show: true,
              position: "inside",
              formatter: function (params: any) {
                const percent = params.percent || 0;
                if (percent > 0) {
                  return `${percent.toFixed(1)}%`;
                }
                return "";
              },
              fontSize: function (params: any) {
                const percent = params.percent || 0;
                if (percent < 1) {
                  return 10;
                } else if (percent < 2) {
                  return 11;
                } else if (percent < 5) {
                  return 13;
                }
                return 14;
              },
              fontWeight: "400",
              color: "#ffffff",
              fontFamily: "Roboto, sans-serif",
              textShadowColor: "rgba(0, 0, 0, 0.9)",
              textShadowBlur: 4,
              textShadowOffsetX: 1,
              textShadowOffsetY: 1,
              align: "center",
              verticalAlign: "middle",
              distance: 0,
              rotate: 0,
              overflow: "none",
              bleedMargin: 0,
              padding: [1, 1],
            },
            labelLine: {
              show: false,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
              label: {
                fontSize: 14,
                fontWeight: "normal",
              },
            },
            data: chartData,
          },
        ],
      };

      chart.setOption(option);

      const handleResize = () => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      };

      window.addEventListener("resize", handleResize);

      (chart as any)._handleResize = handleResize;
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        const chart = chartInstance.current;
        const handleResize = (chart as any)._handleResize;

        if (handleResize) {
          window.removeEventListener("resize", handleResize);
        }

        try {
          if (!chart.isDisposed()) {
            chart.dispose();
          }
        } catch (error) {
          console.warn("Chart disposal error:", error);
        }
        chartInstance.current = null;
      }
    };
  }, [data, title, subtitle, showLegend, unit]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, [height, width]);

  return (
    <div
      ref={chartRef}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        margin: "0 auto",
      }}
    />
  );
};

export default PieChart;
