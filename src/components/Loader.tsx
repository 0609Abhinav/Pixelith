import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setIsDone(true), 400); // slight pause at 100
        setTimeout(onComplete, 1200); // notify parent after exit animation
      }
      setProgress(current);
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
          exit={{ y: '-100vh', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="flex flex-col items-center gap-6">
            <span className="text-6xl md:text-8xl font-light font-serif tracking-tighter mix-blend-difference">
              {progress}%
            </span>
            <div className="w-48 h-[1px] bg-white/20 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="uppercase tracking-[0.2em] text-xs text-white/50">
              Dark Vampire
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
