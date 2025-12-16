import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface VoltageGaugeProps {
  value: number;
  maxValue?: number;
  unit?: string;
  phase: "R" | "Y" | "B";
  title?: string;
}

const VoltageGauge: React.FC<VoltageGaugeProps> = ({
  value = 0,
  maxValue = 500,
  unit = "V",
  phase,
  title,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const getPhaseColor = (phase: "R" | "Y" | "B") => {
    switch (phase) {
      case "R":
        return "#ef4444";
      case "Y":
        return "#eab308";
      case "B":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const phaseColor = getPhaseColor(phase);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);

      const option = {
        series: [
          {
            type: "gauge",
            startAngle: 180,
            endAngle: 360,
            radius: "85%",
            min: 0,
            max: maxValue,
            pointer: {
              show: false,
            },
            progress: {
              show: true,
              overlap: false,
              roundCap: false,
              clip: false,
              itemStyle: {
                color: phaseColor,
                borderWidth: 0,
              },
            },
            axisLine: {
              lineStyle: {
                width: 8,
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
              fontSize: 14,
              fontWeight: "semibold",
              display: "block",
              alignItems: "center",
              color: phaseColor,
            },
            data: [
              {
                value: value,
                name: "",
              },
            ],
          },
        ],
        graphic: [
          {
            type: "text",
            left: "center",
            top: "55%",
            style: {
              text: unit,
              fontSize: 14,
              fontWeight: "normal",
              fill: phaseColor,
              margin: 10,
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
                  value: value,
                  name: "",
                },
              ],
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
  }, [value, maxValue, unit, phaseColor]);

  return (
    <div className="bg-primary border border-border-primary rounded-lg py-2 h-full flex flex-col">
      <div className="text-center">
        <h3
          className="text-base font-normal font-roboto"
          style={{ color: phaseColor }}
        >
          {title}
        </h3>
      </div>

      <div className="flex items-center justify-center">
        <div
          ref={chartRef}
          style={{
            width: "140px",
            height: "70px",
            position: "relative",
          }}
        />
      </div>

      {/* <div className="text-center">
        <div className="text-2xl font-normal font-roboto" style={{ color: phaseColor }}>
          {value.toFixed(1)} {unit}
        </div>
      </div> */}
    </div>
  );
};

export default VoltageGauge;
