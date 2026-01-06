"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedTextProps {
  children: string;
  className?: string;
  key?: string | number;
}

export default function AnimatedText({ children, className = "", key }: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayText !== children) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayText(children);
        setIsAnimating(false);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setDisplayText(children);
    }
  }, [children, displayText]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${key || displayText}-${Date.now()}`}
        className={className}
        initial={{ opacity: 0, y: 8, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: -8, rotateX: 10 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ display: "inline-block" }}
      >
        {displayText}
      </motion.span>
    </AnimatePresence>
  );
}

