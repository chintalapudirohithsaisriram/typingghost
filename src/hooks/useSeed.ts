import { useEffect, useState } from "react";

/** Deterministic PRNG so server and client render the same text before hydration. */
export function seededRandom(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 1 on the server and first client render, a real random seed after hydration. */
export function useSeed() {
  const [seed, setSeed] = useState(1);
  useEffect(() => setSeed(Math.floor(Math.random() * 1e9) + 2), []);
  return seed;
}
