/* ==========================================================================
   GymSync — Animated Counter Hook
   Smoothly counts from 0 to target value
   ========================================================================== */
import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target, duration = 1500, startOnMount = true) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!startOnMount) return;
    const from = prevTarget.current;
    const to = target;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = from + (to - from) * ease;
      setValue(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    prevTarget.current = to;
    return () => cancelAnimationFrame(animRef.current);
  }, [target, duration, startOnMount]);

  return Math.round(value);
}

export function AnimatedNumber({ value, duration = 1500, prefix = '', suffix = '', decimals = 0, formatFn }) {
  const display = useAnimatedCounter(value, duration);
  let formatted;
  if (formatFn) {
    formatted = formatFn(decimals > 0 ? display : Math.round(display));
  } else if (decimals > 0) {
    formatted = display.toFixed(decimals);
  } else {
    formatted = Math.round(display).toLocaleString('en-IN');
  }
  return <>{prefix}{formatted}{suffix}</>;
}
