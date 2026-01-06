import { Variants } from "framer-motion";

// Smooth easing functions for buttery animations - faster but smooth
export const smoothEase = [0.4, 0, 0.2, 1]; // Custom cubic bezier
export const quickEase = [0.25, 0.1, 0.25, 1]; // Faster easing
export const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.6,
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

// Fade in animation - faster
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: quickEase,
    },
  },
};

// Slide up animation - faster with swoop
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: quickEase,
    },
  },
};

// Swoop in animation
export const swoopIn: Variants = {
  initial: { opacity: 0, y: 30, x: -20, rotate: -2 },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.35,
      ease: quickEase,
    },
  },
};

// Slide down animation (for dropdowns)
export const slideDown: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: smoothEase,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
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

// Stagger children animation - faster
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: quickEase,
    },
  },
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: smoothEase,
  },
};

export const hoverLift = {
  y: -4,
  transition: {
    duration: 0.2,
    ease: smoothEase,
  },
};

// Button animations - faster
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.15,
      ease: quickEase,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.08,
    },
  },
};

// Card animations - faster
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 15, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: quickEase,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
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

