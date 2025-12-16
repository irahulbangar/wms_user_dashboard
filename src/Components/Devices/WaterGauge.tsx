import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface WaterGaugeProps {
  maxValue: number;
  lpmValue: number;
  maxLpmLimit: number;
  unit: string;
}

const WaterGauge: React.FC<WaterGaugeProps> = ({
  maxValue,
  lpmValue,
  maxLpmLimit,
  unit,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);
      chartInstance.current = myChart;

      const option = {
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 360,
            radius: "90%",
            min: 0,
            max: maxLpmLimit,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: false,
              clip: false,
              itemStyle: {
                color: "#37a2da",
                borderWidth: 0,
              },
            },
            axisLine: {
              lineStyle: {
                width: 12,
                color: [[1, "#E5E7EB"]],
              },
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            title: {
              show: false,
            },
            detail: {
              show: true,
              offsetCenter: ["0%", "0%"],
              formatter: "{value}",
              fontSize: 24,
              fontWeight: "normal",
              color: "#6B7280",
            },
            data: [
              {
                value: 0,
                name: "",
              },
            ],
          },
        ],
        graphic: [
          {
            type: "text",
            left: "center",
            top: "35%",
            style: {
              text: "",
              fontSize: 20,
              fontWeight: "normal",
              fill: "#6B7280",
            },
            offset: [30, 0],
          },
          {
            type: "text",
            left: "center",
            top: "55%",
            style: {
              text: "LPM",
              fontSize: 16,
              fontWeight: "normal",
              fill: "#6B7280",
            },
          },
        ],
      };

      myChart.setOption(option);

      const interval = setInterval(() => {
        myChart.setOption({
          series: [
            {
              data: [
                {
                  value: lpmValue,
                  name: "",
                },
              ],
            },
          ],
          graphic: [
            {
              style: {
                // text: newValue.toString(),
              },
            },
          ],
        });
      }, 3000);

      return () => {
        clearInterval(interval);
        try {
          if (myChart && !myChart.isDisposed()) {
            myChart.dispose();
          }
        } catch (error) {
          console.warn("Chart disposal error:", error);
        }
      };
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "200px",
          top: "35px",
          position: "relative",
        }}
      />
      <div className="flex flex-col items-center">
        <span className="text-text-primary font-normal text-base">
          Total Water Consumption
        </span>
        <span className="text-text-primary font-normal text-base">
          {maxValue}{" "}
          {unit === "M^3" ? (
            <>
              m<sup>3</sup>
            </>
          ) : (
            unit
          )}
        </span>
      </div>
    </div>
  );
};

export default WaterGauge;
