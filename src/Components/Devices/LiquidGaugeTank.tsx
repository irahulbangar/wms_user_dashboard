import { useEffect, useState } from "react";
import LiquidGauge from "react-liquid-gauge";

interface LiquidGaugeTankProps {
  value: number;
  maxValue?: number;
  unit?: string;
  height?: number;
  width?: number;
  liquidColor?: string;
  backgroundColor?: string;
  animated?: boolean;
  animationDuration?: number;
  capacity: number;
}

const LiquidGaugeTank: React.FC<LiquidGaugeTankProps> = ({
  value = 0,
  maxValue = 100,
  unit = "",
  height = 300,
  width = 300,
  liquidColor = "#37a2da",
  backgroundColor = "#f8fafc",
  animated = true,
  animationDuration = 1000,
  capacity = 0,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  const sanitizedValue = (() => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return 0;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      return 0;
    }
    return numValue;
  })();

  const clampedValue = Math.max(0, Math.min(maxValue, Number(value)));

  useEffect(() => {
    if (animated) {
      const startValue = animatedValue;
      const endValue = clampedValue;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newValue = startValue + (endValue - startValue) * easeOutQuart;

        setAnimatedValue(newValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimatedValue(clampedValue);
    }
  }, [animated, clampedValue, animationDuration, animatedValue]);

  const gaugeConfig = {
    value: sanitizedValue,
    width: width,
    height: height,
    fontSize: Math.min(width, height) / 8,
    fontFamily: "Roboto, sans-serif",
    color: liquidColor,
    backgroundColor: backgroundColor,
    borderWidth: 2,
    borderColor: liquidColor,
    borderRadius: Math.min(width, height) / 20,
    waveAnimation: animated,
    waveAnimationDuration: animationDuration,
    waveAnimationEasing: "easeOutQuart",
    waveAnimationDelay: 0,
    waveAnimationRepeat: false,
    waveAnimationDirection: "normal",
    waveAnimationFillMode: "forwards",
    waveAnimationIterationCount: 1,
    waveAnimationTimingFunction: "easeOutQuart",
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative">
        <LiquidGauge {...gaugeConfig} />

        <div className="absolute -bottom-4 transform translate-x-1/2 translate-y-1/2 left-2 text-xs text-text-primary font-roboto">
          Capacity: {capacity}{" "}
          {unit === "M^3" ? (
            <>
              m<sup>3</sup>
            </>
          ) : (
            unit
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm font-roboto mt-4">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: liquidColor }}
          />
          <span className="text-text-secondary font-roboto">Current Level</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-overlay" />
          <span className="text-text-secondary font-roboto">Tank Capacity</span>
        </div>
      </div>
    </div>
  );
};

export default LiquidGaugeTank;
