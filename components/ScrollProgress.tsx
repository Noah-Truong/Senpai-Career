"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-[-3px] left-0 right-0 h-1 z-[9999] origin-left pointer-events-none"
      style={{
        background: "#2563EB",
        scaleX,
        boxShadow: "0 2px 4px #1D4ED8",
      }}
    />
  );
}

