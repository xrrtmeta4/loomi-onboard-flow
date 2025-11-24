import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter = ({ value, className }: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      setShowPulse(true);
      
      // Animate the change
      const start = displayValue;
      const end = value;
      const duration = 500; // ms
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOutCubic);
        
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setTimeout(() => setShowPulse(false), 300);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-300 relative",
        isAnimating && "scale-110",
        className
      )}
    >
      {showPulse && (
        <span className="absolute inset-0 animate-ping opacity-75 text-primary">
          {displayValue.toLocaleString()}
        </span>
      )}
      <span className={cn(isAnimating && "text-primary font-extrabold")}>
        {displayValue.toLocaleString()}
      </span>
    </span>
  );
};
