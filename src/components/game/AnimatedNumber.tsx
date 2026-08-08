import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { formatINR } from "@/lib/finance";

export function AnimatedRupee({
  value,
  className,
  duration = 0.6,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const controls = animate(from, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className}>{formatINR(display)}</span>;
}

export function AnimatedPercent({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const controls = animate(from, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {display >= 0 ? "+" : ""}
      {display.toFixed(2)}%
    </span>
  );
}
