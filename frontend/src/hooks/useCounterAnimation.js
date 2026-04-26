// useCounterAnimation — animates a number from 0 to target value
// Uses requestAnimationFrame + easeOutQuart for smooth instrument-readout feel

import { useState, useEffect, useRef } from 'react';

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

export function useCounterAnimation(target, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTime.current) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        setValue(Math.floor(easeOutQuart(progress) * target));
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };
      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return value;
}
