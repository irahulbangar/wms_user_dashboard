declare module "react-liquid-gauge" {
  interface LiquidGaugeProps {
    value: number | string;
    width?: number;
    height?: number;
    percent?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    waveAnimation?: boolean;
    waveAnimationDuration?: number;
    waveAnimationEasing?: string;
    waveAnimationDelay?: number;
    waveAnimationRepeat?: boolean;
    waveAnimationDirection?: string;
    waveAnimationFillMode?: string;
    waveAnimationIterationCount?: number;
    waveAnimationTimingFunction?: string;
    capacity?: number;
    unit?: string;
  }

  const LiquidGauge: React.FC<LiquidGaugeProps>;
  export default LiquidGauge;
}
