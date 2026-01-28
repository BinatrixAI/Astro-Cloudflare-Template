import { motion } from "motion/react";
import type { SVGProps } from "react";

interface AnimatedIconProps extends SVGProps<SVGSVGElement> {
  delay?: number;
}

/**
 * Example animated icon using motion/react.
 * Copy this pattern for creating custom animated SVG icons.
 */
export function AnimatedCheckIcon({ delay = 0, ...props }: AnimatedIconProps) {
  return (
    <motion.svg
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
        d="M20 6L9 17l-5-5"
      />
    </motion.svg>
  );
}

export function AnimatedSpinner({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </motion.svg>
  );
}
