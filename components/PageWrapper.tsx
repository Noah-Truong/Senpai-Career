"use client";

import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedSection({
  children,
  className = "",
  bgColor = "white",
  animateOnView = false
}: {
  children: ReactNode;
  className?: string;
  bgColor?: "white" | "light";
  animateOnView?: boolean;
}) {
  return (
    <motion.section
      className={`py-16 md:py-20 ${className}`}
      style={{ backgroundColor: bgColor === "light" ? '#D7FFEF' : '#FFFFFF' }}
      initial="initial"
      animate={animateOnView ? undefined : "animate"}
      whileInView={animateOnView ? "animate" : undefined}
      viewport={animateOnView ? { once: true, amount: 0.2 } : undefined}
      variants={fadeIn}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedHeading({ 
  children, 
  className = "",
  size = "lg"
}: { 
  children: ReactNode; 
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl"
  };

  return (
    <motion.h1
      className={`${sizeClasses[size]} font-bold mb-6 ${className}`}
      style={{ color: '#111827' }}
      variants={slideUp}
    >
      {children}
    </motion.h1>
  );
}

export function AnimatedSubheading({ 
  children, 
  className = ""
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.h2
      className={`text-2xl md:text-3xl font-bold mb-8 ${className}`}
      style={{ color: '#111827' }}
      variants={slideUp}
    >
      {children}
    </motion.h2>
  );
}

export function AnimatedCard({ 
  children, 
  className = "",
  hover = true
}: { 
  children: ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={`bg-white border rounded p-6 ${className}`}
      style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      variants={staggerItem}
      whileHover={hover ? { y: -4, scale: 1.02, transition: { duration: 0.2 } } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({ 
  children, 
  className = ""
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.ul
      className={className}
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {children}
    </motion.ul>
  );
}

export function AnimatedListItem({ 
  children, 
  className = ""
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.li
      className={className}
      variants={staggerItem}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.li>
  );
}

