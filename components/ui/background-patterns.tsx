import { cn } from "@/lib/utils";

interface BackgroundPatternProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Grid with Dots Background
 * Clean grid lines with subtle dot intersections
 */
export const GridDotsBackground: React.FC<BackgroundPatternProps> = ({
  className,
  children
}) => {
  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),
            radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px, 32px 32px, 32px 32px",
          backgroundPosition: "0 0, 0 0, 16px 16px",
        }}
      />
      {children}
    </div>
  );
};

/**
 * Simple Grid Background
 * Minimalist grid lines only
 */
export const GridBackground: React.FC<BackgroundPatternProps> = ({
  className,
  children
}) => {
  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      {children}
    </div>
  );
};

/**
 * Soft Glow Background
 * Radial gradient glow effect
 */
export const SoftGlowBackground: React.FC<BackgroundPatternProps & {
  color?: string;
  opacity?: number;
}> = ({
  className,
  children,
  color = "#FFF991",
  opacity = 0.6
}) => {
  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          opacity,
          mixBlendMode: "multiply",
        }}
      />
      {children}
    </div>
  );
};

/**
 * Dot Matrix Background
 * Clean dot pattern (current m3-grid-bg replacement)
 */
export const DotMatrixBackground: React.FC<BackgroundPatternProps & {
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
}> = ({
  className,
  children,
  dotColor = "#cbd5e1",
  dotSize = 1,
  spacing = 32
}) => {
  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
        }}
      />
      {children}
    </div>
  );
};

export default GridDotsBackground;
