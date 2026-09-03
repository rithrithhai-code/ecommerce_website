import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Reveals need IntersectionObserver. Where it is missing — an old browser, a non-DOM host —
 * content renders statically instead of being stranded at opacity 0.
 */
function canReveal(): boolean {
  return typeof window !== "undefined" && "IntersectionObserver" in window;
}

/**
 * Scroll-reveal wrapper. `once: true` means content animates in as it enters the viewport and
 * then stays put, and users who prefer reduced motion get the plain static tree.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion || !canReveal()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct children by `step` seconds. */
export function RevealGroup({
  children,
  className,
  step = 0.07,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  const reduceMotion = useReducedMotion();
  const reveal = canReveal() && !reduceMotion;

  return (
    <div className={className}>
      {children.map((child, index) =>
        !reveal ? (
          <div key={index}>{child}</div>
        ) : (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px 0px" }}
            transition={{ duration: 0.55, delay: index * step, ease: [0.16, 1, 0.3, 1] }}
          >
            {child}
          </motion.div>
        ),
      )}
    </div>
  );
}
