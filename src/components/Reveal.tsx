'use client';

import { motion } from 'framer-motion';
import { revealProps } from '@/lib/motion';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Use to stagger siblings (hero blocks, card grids). */
  delay?: number;
  style?: React.CSSProperties;
  id?: string;
}

/** Section wrapper: whole landing-page section fades/slides up once on scroll into view. */
export function RevealSection(props: React.ComponentProps<typeof motion.section>) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      {...revealProps}
      {...props}
    />
  );
}

/** Client wrapper: fades/slides content up once when it scrolls into view. */
export function Reveal({ children, className, delay = 0, style, id }: RevealProps) {
  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      {...revealProps}
    >
      {children}
    </motion.div>
  );
}
