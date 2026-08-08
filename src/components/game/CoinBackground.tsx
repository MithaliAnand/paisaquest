import { useMemo } from "react";
import { motion } from "motion/react";

type Coin = {
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
};

function makeCoins(count: number): Coin[] {
  const coins: Coin[] = [];
  for (let i = 0; i < count; i++) {
    const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    coins.push({
      left: r(1) * 100,
      size: 16 + r(2) * 34,
      delay: r(3) * 18,
      duration: 22 + r(4) * 26,
      opacity: 0.12 + r(5) * 0.28,
      drift: (r(6) - 0.5) * 90,
    });
  }
  return coins;
}

function CoinShape({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id={`cg-${size}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="oklch(0.95 0.07 90)" />
          <stop offset="60%" stopColor="oklch(0.84 0.12 85)" />
          <stop offset="100%" stopColor="oklch(0.7 0.11 72)" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill={`url(#cg-${size})`} />
      <circle cx="20" cy="20" r="14" fill="none" stroke="oklch(0.93 0.07 90)" strokeWidth="1.4" />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="oklch(0.62 0.1 68)"
        fontFamily="sans-serif"
      >
        ₹
      </text>
    </svg>
  );
}

export function CoinBackground({ count = 18 }: { count?: number }) {
  const coins = useMemo(() => makeCoins(count), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {coins.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${c.left}%`, opacity: c.opacity }}
          initial={{ y: "110vh", rotate: 0 }}
          animate={{ y: "-20vh", rotate: 360, x: [0, c.drift, 0] }}
          transition={{
            duration: c.duration,
            delay: c.delay,
            repeat: Infinity,
            ease: "linear",
            x: { duration: c.duration / 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <CoinShape size={c.size} />
        </motion.div>
      ))}
    </div>
  );
}
