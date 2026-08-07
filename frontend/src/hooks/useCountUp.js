import { useEffect, useRef, useState } from "react";

// Animates a number from its previous value up to `target` whenever it changes.
export default function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const reduceMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = fromRef.current;
    const delta = target - from;

    if (delta === 0) return;

    const effectiveDuration = reduceMotion ? 0 : duration;

    let start;
    let frame;

    const step = (timestamp) => {
      if (start === undefined) start = timestamp;
      const progress = effectiveDuration === 0
        ? 1
        : Math.min((timestamp - start) / effectiveDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(from + delta * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
