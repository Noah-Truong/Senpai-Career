"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/lib/animations";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function AnimatedButton({ 
  children, 
  className = "", 
  onClick,
  href,
  type = "button",
  disabled = false
}: AnimatedButtonProps) {
  const motionProps = {
    variants: buttonVariants,
    whileHover: disabled ? {} : "hover",
    whileTap: disabled ? {} : "tap",
    className,
    disabled,
  };

  if (href) {
    return (
      <motion.a
        href={href}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}

