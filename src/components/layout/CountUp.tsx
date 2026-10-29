import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "motion/react";

export interface CountUpProps {
  to?: number;
  value?: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  to,
  value,
  from = 0,
  duration = 1.5,
  suffix = "",
  prefix = "",
  className = "",
}: CountUpProps) {
  const target = to ?? value ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? target : from);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(target);
      return;
    }

    if (!isInView) return;

    const controls = animate(from, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [isInView, target, from, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export default CountUp;

