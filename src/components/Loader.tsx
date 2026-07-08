/**
 * CinematicLoader — DSLR shutter-inspired loading screen.
 * Shutter blades iris in → counter rises → blades iris out → done.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const BLADE_COUNT = 8;

function ShutterBlade({ index, progress }: { index: number; progress: number }) {
  const angle  = (index / BLADE_COUNT) * 360;
  // 0 = fully open, 1 = fully closed; we open as progress goes 0→100
  const scale  = 1 - progress / 100;
  return (
    <div
      className="loader-blade"
      style={{
        transform: `rotate(${angle}deg) scaleX(${Math.max(0.08, scale)})`,
        transformOrigin: '0% 50%',
        position:  'absolute',
        left:      '50%',
        top:       '50%',
        width:     '52%',
        height:    `${100 / BLADE_COUNT + 1.5}%`,
        marginTop: `-${50 / BLADE_COUNT + 0.75}%`,
        background: '#09090f',
        borderRadius: '0 4px 4px 0',
        transition: 'transform 0.14s ease-out',
      }}
    />
  );
}

export function CinematicLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase,    setPhase]    = useState<'loading' | 'flash' | 'done'>('loading');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cur = 0;
    intervalRef.current = setInterval(() => {
      cur += Math.floor(Math.random() * 12) + 4;
      if (cur >= 100) {
        cur = 100;
        clearInterval(intervalRef.current!);
        // brief flash (shutter click)
        setTimeout(() => setPhase('flash'), 250);
        setTimeout(() => setPhase('done'),  700);
        setTimeout(onComplete,              1350);
      }
      setProgress(cur);
    }, 110);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="loader-root"
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Full-screen flash */}
          <AnimatePresence>
            {phase === 'flash' && (
              <motion.div
                className="loader-flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.6 } }}
                transition={{ duration: 0.04 }}
              />
            )}
          </AnimatePresence>

          {/* Shutter iris */}
          <div className="loader-iris">
            {Array.from({ length: BLADE_COUNT }).map((_, i) => (
              <ShutterBlade key={i} index={i} progress={progress} />
            ))}
            {/* Centre circle */}
            <div className="loader-iris-center">
              <div className="loader-iris-inner">
                <svg viewBox="0 0 44 44" width={44} height={44} aria-hidden="true">
                  {/* Aperture icon */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line
                      key={i}
                      x1="22" y1="6"
                      x2="22" y2="22"
                      stroke="#c9a84c"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      transform={`rotate(${i * 60} 22 22)`}
                    />
                  ))}
                  <circle cx="22" cy="22" r="7" fill="none" stroke="#c9a84c" strokeWidth="1.8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress info */}
          <div className="loader-info">
            <motion.span
              className="loader-brand"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              DARK<span className="loader-brand-accent">VAMPIRE</span>
            </motion.span>
            <motion.div
              className="loader-counter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {String(progress).padStart(3, '0')}
              <span className="loader-pct">%</span>
            </motion.div>
            <div className="loader-bar-track">
              <motion.div
                className="loader-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.18 }}
              />
            </div>
            <motion.span
              className="loader-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Developing the frame…
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
