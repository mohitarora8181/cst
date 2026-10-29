'use client';

import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

/** Fades/slides children in when scrolled into view. */
export function Reveal({ children, delay = 0, y = 24, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
export const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Grid/list whose direct <motion.*> children animate in sequence. */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
      {children}
    </motion.div>
  );
}

/** Animated number that counts up once visible. Non-numeric suffixes (K+, %) are preserved. */
export function CountUp({ value, className }: { value: string | number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const str = String(value);
  const match = str.match(/^([\d.,]+)(.*)$/);
  const isNumeric = Boolean(match);
  const target = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
  const suffix = match ? match[2] : '';
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v).toLocaleString('en-IN')}${suffix}`);

  useEffect(() => {
    if (!inView || !isNumeric) return;
    const controls = animate(mv, target, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, target, mv, isNumeric]);

  if (!isNumeric) return <span className={className}>{str}</span>;
  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}
