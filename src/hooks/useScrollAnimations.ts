import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook to animate elements as they scroll into view.
 * Attach `data-scroll` attribute to elements you want to animate.
 * Optional: `data-scroll-speed="0.5"` for parallax offset.
 */
export function useScrollAnimations(deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const revealOnEnter = (
        targets: Element | HTMLCollection | Element[],
        fromVars: gsap.TweenVars,
        toVars: gsap.TweenVars,
        trigger: Element,
        start = 'top 88%',
        stagger = 0
      ) => {
        ScrollTrigger.create({
          trigger,
          start,
          once: true,
          onEnter: () => {
            gsap.fromTo(targets, fromVars, {
              ...toVars,
              stagger,
              clearProps: 'transform,opacity,visibility',
            });
          },
        });
      };

      root.querySelectorAll('[data-animate]').forEach((el) => {
        revealOnEnter(
          el,
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.75, ease: 'power3.out' },
          el
        );
      });

      root.querySelectorAll('[data-scroll]').forEach((el) => {
        revealOnEnter(
          el,
          { y: 60, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
          el,
          'top 85%'
        );
      });

      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax') || '0.2');
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      root.querySelectorAll('[data-scale]').forEach((el) => {
        revealOnEnter(
          el,
          { scale: 0.9, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 1.1, ease: 'power2.out' },
          el,
          'top 85%'
        );
      });

      root.querySelectorAll('[data-reveal]').forEach((el) => {
        const direction = el.getAttribute('data-reveal') || 'left';
        const xFrom = direction === 'left' ? -80 : 80;
        revealOnEnter(
          el,
          { x: xFrom, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
          el,
          'top 80%'
        );
      });

      root.querySelectorAll('[data-stagger]').forEach((container) => {
        revealOnEnter(
          Array.from(container.children),
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' },
          container,
          'top 82%',
          0.12
        );
      });

      root.querySelectorAll('[data-text-reveal]').forEach((el) => {
        if (el.querySelector('[data-text-word]')) return;

        const text = el.textContent || '';
        const words = text.split(' ');
        el.textContent = '';
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline';

        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.dataset.textWord = 'true';
          span.textContent = word + (i < words.length - 1 ? ' ' : '');
          span.style.display = 'inline-block';
          wrapper.appendChild(span);
        });
        el.appendChild(wrapper);

        revealOnEnter(
          Array.from(wrapper.children),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' },
          el,
          'top 80%',
          0.04
        );
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const raf = window.requestAnimationFrame(refresh);
    const timeout = window.setTimeout(refresh, 350);
    window.addEventListener('load', refresh);
    root.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', refresh);
      img.addEventListener('error', refresh);
    });
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener('load', refresh);
      root.querySelectorAll('img').forEach((img) => {
        img.removeEventListener('load', refresh);
        img.removeEventListener('error', refresh);
      });
      ctx.revert();
    };
  }, deps);

  return containerRef;
}

/**
 * Smooth counter animation for stat numbers
 */
export function useCountUp(targetRef: React.RefObject<HTMLElement | null>, endValue: number, duration = 2) {
  useEffect(() => {
    if (!targetRef.current) return;
    const el = targetRef.current;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(
          { val: 0 },
          { val: endValue },
          {
            duration,
            ease: 'power2.out',
            onUpdate: function () {
              // @ts-ignore
              el.textContent = Math.floor(this.targets()[0].val).toLocaleString();
            },
          }
        );
      },
      once: true,
    });

    return () => trigger.kill();
  }, [endValue, duration]);
}

/**
 * Magnetic cursor effect for elements with [data-magnetic]
 */
export function useMagneticEffect() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-magnetic]');
    const handlers: Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> = [];

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const move = (e: MouseEvent) => {
        const rect = htmlEl.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(htmlEl, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      };
      const leave = () => {
        gsap.to(htmlEl, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      };
      htmlEl.addEventListener('mousemove', move);
      htmlEl.addEventListener('mouseleave', leave);
      handlers.push({ el: htmlEl, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        (el as HTMLElement).removeEventListener('mousemove', move);
        (el as HTMLElement).removeEventListener('mouseleave', leave);
      });
    };
  }, []);
}
