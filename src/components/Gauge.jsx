/* ==========================================================================
   GymSync — SVG Gauge Component (React)
   Animated circular gauge with color thresholds
   ========================================================================== */
import { useState, useEffect, useRef } from 'react';

const GAUGE_ARC = 270; // degrees of the arc
const ROTATION = 135;  // start rotation (bottom-left)

export default function Gauge({ value = 0, max = 100, label = '', size = 140, strokeWidth = 10, unit = '%' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef(null);
  const prevValue = useRef(0);

  const radius = (size - strokeWidth) / 2 - 5;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (GAUGE_ARC / 360) * circumference;

  // Animate value changes
  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    const start = performance.now();
    const duration = 600;

    function animate(now) {
      const progress = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = from + (to - from) * ease;
      setDisplayValue(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    prevValue.current = to;
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  // Color based on thresholds
  const getColor = (val) => {
    const pct = (val / max) * 100;
    if (pct < 60) return '#22c55e';
    if (pct < 80) return '#f97316';
    return '#ef4444';
  };

  const pct = displayValue / max;
  const dashOffset = arcLength - arcLength * pct;
  const color = getColor(displayValue);

  return (
    <div className="gauge-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATION}, ${size / 2}, ${size / 2})`}
        />
        {/* Foreground arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${ROTATION}, ${size / 2}, ${size / 2})`}
          style={{
            transition: 'stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
        {/* Value text */}
        <text
          x={size / 2} y={size / 2 - 2}
          textAnchor="middle" dominantBaseline="central"
          fill="#f1f5f9"
          style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {Math.round(displayValue)}{unit}
        </text>
        {/* Label text */}
        <text
          x={size / 2} y={size / 2 + 22}
          textAnchor="middle" dominantBaseline="central"
          fill="#94a3b8"
          style={{ fontSize: '0.7rem', fontFamily: "'Inter', sans-serif" }}
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
