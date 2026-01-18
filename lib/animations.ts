import { Variants } from "framer-motion";

// Check for reduced motion preference
export const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Optimized easing functions - faster and more performant
export const smoothEase: [number, number, number, number] = prefersReducedMotion ? [1, 0, 1, 1] : [0.25, 0.1, 0.25, 1];
export const quickEase: [number, number, number, number] = prefersReducedMotion ? [1, 0, 1, 1] : [0.25, 0.1, 0.25, 1];
export const instantEase: [number, number, number, number] = [1, 0, 1, 1]; // For reduced motion

export const springConfig = prefersReducedMotion ? {
  type: "tween" as const,
  duration: 0.1,
} : {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// Page transition variants - optimized for performance
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.3,
      ease: smoothEase,
      staggerChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -10,
    transition: {
      duration: prefersReducedMotion ? 0.05 : 0.2,
      ease: smoothEase,
    },
  },
};

// Fade in animation - simplified for better performance
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.25,
      ease: quickEase,
    },
  },
};

// Slide up animation - reduced complexity
export const slideUp: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 15
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.25,
      ease: quickEase,
    },
  },
};

// Simplified swoop animation
export const swoopIn: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.3,
      ease: quickEase,
    },
  },
};

// Optimized dropdown animation
export const slideDown: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -5,
    scale: prefersReducedMotion ? 1 : 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.2,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : -5,
    scale: prefersReducedMotion ? 1 : 0.98,
    transition: {
      duration: prefersReducedMotion ? 0.05 : 0.15,
      ease: smoothEase,
    },
  },
};

// Scale animation (for buttons, cards)
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Optimized stagger animations - reduced stagger delay
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.04,
      delayChildren: prefersReducedMotion ? 0 : 0.02,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.2,
      ease: quickEase,
    },
  },
};

// Simplified hover animations - only when motion is preferred
export const hoverScale = prefersReducedMotion ? {} : {
  scale: 1.02,
  transition: {
    duration: 0.15,
    ease: smoothEase,
  },
};

export const hoverLift = prefersReducedMotion ? {} : {
  y: -2,
  transition: {
    duration: 0.15,
    ease: smoothEase,
  },
};

// Optimized button animations
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: prefersReducedMotion ? {} : {
    scale: 1.01,
    y: -1,
    transition: {
      duration: 0.12,
      ease: quickEase,
    },
  },
  tap: prefersReducedMotion ? {} : {
    scale: 0.97,
    transition: {
      duration: 0.06,
    },
  },
};

// Optimized card animations - reduced scale changes for better performance
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 12,
    scale: prefersReducedMotion ? 1 : 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: prefersReducedMotion ? 0.1 : 0.22,
      ease: quickEase,
    },
  },
  hover: prefersReducedMotion ? {} : {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.18,
      ease: quickEase,
    },
  },
};

// Icon animations
export const iconVariants: Variants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Notification badge animation
export const badgeVariants: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
};

// List item animations
export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Avatar animation
export const avatarVariants: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

// Modal/Overlay animations
export const modalVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: smoothEase,
    },
  },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
};

