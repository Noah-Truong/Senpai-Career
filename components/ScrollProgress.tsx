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
      className="fixed top-0 left-0 right-0 h-1 z-[9999] origin-left pointer-events-none"
      style={{
        background: "linear-gradient(90deg, #f26aa3 0%, #f59fc1 35%, #6fd3ee 70%, #4cc3e6 100%)",
        scaleX,
        boxShadow: "0 2px 4px rgba(242, 106, 163, 0.3)",
      }}
    />
  );
}

