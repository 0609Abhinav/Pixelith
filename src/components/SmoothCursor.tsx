import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Only show on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display = 'none';
      follower.style.display = 'none';
      return;
    }

    document.body.style.cursor = 'none';

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    };

    const onEnterInteractive = () => {
      gsap.to(cursor, { scale: 0.5, duration: 0.3 });
      gsap.to(follower, { scale: 1.8, opacity: 0.15, duration: 0.3 });
    };

    const onLeaveInteractive = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 0.3, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMove);

    const interactives = document.querySelectorAll('a, button, [data-magnetic], .nav-link, .card, .media-card');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive);
        el.removeEventListener('mouseleave', onLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#d8b77b',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div
        ref={followerRef}
        style={{
          position: 'fixed',
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(216, 183, 123, 0.4)',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: 0.3,
          willChange: 'transform',
        }}
      />
    </>
  );
}
