import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import type { PhmcDeviceResultItem } from "../../../model/phmc-device.interface";

interface CombinedGraphProps {
  data: PhmcDeviceResultItem[];
  title?: string;
}

const CombinedGraph: React.FC<CombinedGraphProps> = ({
  data = [],
  title = "Voltage & Current Monitoring",
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const myChart = echarts.init(chartRef.current);

      const timeLabels = data.map((item) => {
        if (item.from_time) {
          const date = new Date(item.from_time);
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${hours}:${minutes}`;
        }
        return "";
      });

      const voltageRData = data.map((item) =>
        item.last_record?.voltage_r ? item.last_record.voltage_r / 10 : 0
      );
      const voltageYData = data.map((item) =>
        item.last_record?.voltage_y ? item.last_record.voltage_y / 10 : 0
      );
      const voltageBData = data.map((item) =>
        item.last_record?.voltage_b ? item.last_record.voltage_b / 10 : 0
      );

      const currentRData = data.map((item) => item.last_record?.Current_r || 0);
      const currentYData = data.map((item) => item.last_record?.Current_y || 0);
      const currentBData = data.map((item) => item.last_record?.Current_b || 0);

      const option = {
        title: {
          text: title,
          left: "center",
          textStyle: {
            color: "#6B7280",
            fontSize: 18,
            fontWeight: "normal",
            fontFamily: "Roboto, sans-serif",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          formatter: function (params: any) {
            const dataIndex = params[0].dataIndex;
            const item = data[dataIndex];
            let result = `Time: ${params[0].axisValue}<br/>`;
            if (item?.from_time) {
              const date = new Date(item.from_time);
              const dateStr = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              result += `Date: ${dateStr}<br/>`;
            }
            result += `<br/>`;

            const voltageData = params.filter((param: any) =>
              param.seriesName.includes("Voltage")
            );
            const currentData = params.filter((param: any) =>
              param.seriesName.includes("Current")
            );

            if (voltageData.length > 0) {
              result += `<strong>Voltage:</strong><br/>`;
              voltageData.forEach((param: any) => {
                result += `${param.seriesName}: ${param.value}V<br/>`;
              });
            }

            if (currentData.length > 0) {
              result += `<strong>Current:</strong><br/>`;
              currentData.forEach((param: any) => {
                result += `${param.seriesName}: ${param.value}A<br/>`;
              });
            }

            return result;
          },
        },
        legend: {
          data: [
            "Voltage R",
            "Voltage Y",
            "Voltage B",
            "Current R",
            "Current Y",
            "Current B",
          ],
          top: 30,
          textStyle: {
            fontFamily: "Roboto, sans-serif",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "15%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: timeLabels,
          axisLabel: {
            fontFamily: "Roboto, sans-serif",
            fontSize: 11,
            rotate: 45,
            interval: 0,
          },
          name: "Time (HH:MM)",
          nameLocation: "middle",
          nameGap: 30,
        },
        yAxis: [
          {
            type: "value",
            name: "Voltage (V)",
            nameLocation: "middle",
            nameGap: 50,
            position: "left",
            axisLabel: {
              formatter: "{value}V",
              fontFamily: "Roboto, sans-serif",
              fontSize: 12,
            },
            axisLine: {
              lineStyle: {
                color: "#999",
              },
            },
          },
          {
            type: "value",
            name: "Current (A)",
            nameLocation: "middle",
            nameGap: 50,
            position: "right",
            axisLabel: {
              formatter: "{value}A",
              fontFamily: "Roboto, sans-serif",
              fontSize: 12,
            },
            axisLine: {
              lineStyle: {
                color: "#999",
              },
            },
          },
        ],
        series: [
          {
            name: "Voltage R",
            type: "line",
            yAxisIndex: 0,
            data: voltageRData,
            smooth: true,
            lineStyle: {
              color: "#ef4444",
              width: 2,
            },
            itemStyle: {
              color: "#ef4444",
            },
            symbol: "circle",
            symbolSize: 4,
          },
          {
            name: "Voltage Y",
            type: "line",
            yAxisIndex: 0,
            data: voltageYData,
            smooth: true,
            lineStyle: {
              color: "#eab308",
              width: 2,
            },
            itemStyle: {
              color: "#eab308",
            },
            symbol: "circle",
            symbolSize: 4,
          },
          {
            name: "Voltage B",
            type: "line",
            yAxisIndex: 0,
            data: voltageBData,
            smooth: true,
            lineStyle: {
              color: "#3b82f6",
              width: 2,
            },
            itemStyle: {
              color: "#3b82f6",
            },
            symbol: "circle",
            symbolSize: 4,
          },
          {
            name: "Current R",
            type: "line",
            yAxisIndex: 1,
            data: currentRData,
            smooth: true,
            lineStyle: {
              color: "#ef4444",
              width: 2,
              type: "dashed",
            },
            itemStyle: {
              color: "#ef4444",
            },
            symbol: "diamond",
            symbolSize: 4,
          },
          {
            name: "Current Y",
            type: "line",
            yAxisIndex: 1,
            data: currentYData,
            smooth: true,
            lineStyle: {
              color: "#eab308",
              width: 2,
              type: "dashed",
            },
            itemStyle: {
              color: "#eab308",
            },
            symbol: "diamond",
            symbolSize: 4,
          },
          {
            name: "Current B",
            type: "line",
            yAxisIndex: 1,
            data: currentBData,
            smooth: true,
            lineStyle: {
              color: "#3b82f6",
              width: 2,
              type: "dashed",
            },
            itemStyle: {
              color: "#3b82f6",
            },
            symbol: "diamond",
            symbolSize: 4,
          },
        ],
      };

      myChart.setOption(option);

      const handleResize = () => {
        myChart.resize();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        try {
          if (myChart && !myChart.isDisposed()) {
            myChart.dispose();
          }
        } catch (error) {
          console.warn("Chart disposal error:", error);
        }
      };
    }
  }, [data, title]);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary border border-border-primary rounded-lg p-4 mb-4">
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "400px",
        }}
      />
    </div>
  );
};

export default CombinedGraph;
