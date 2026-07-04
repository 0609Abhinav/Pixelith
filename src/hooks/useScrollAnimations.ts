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
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Fade-in + slide-up for all [data-scroll] elements
      const scrollElements = containerRef.current!.querySelectorAll('[data-scroll]');
      scrollElements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 40%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Parallax for [data-parallax] elements
      const parallaxElements = containerRef.current!.querySelectorAll('[data-parallax]');
      parallaxElements.forEach((el) => {
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

      // Scale-in for [data-scale] elements
      const scaleElements = containerRef.current!.querySelectorAll('[data-scale]');
      scaleElements.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Horizontal reveal for [data-reveal] elements
      const revealElements = containerRef.current!.querySelectorAll('[data-reveal]');
      revealElements.forEach((el) => {
        const direction = el.getAttribute('data-reveal') || 'left';
        const xFrom = direction === 'left' ? -80 : 80;
        gsap.fromTo(
          el,
          { x: xFrom, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Stagger children for [data-stagger] containers
      const staggerContainers = containerRef.current!.querySelectorAll('[data-stagger]');
      staggerContainers.forEach((container) => {
        const children = container.children;
        gsap.fromTo(
          children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Text split animation for [data-text-reveal] elements
      const textElements = containerRef.current!.querySelectorAll('[data-text-reveal]');
      textElements.forEach((el) => {
        const text = el.textContent || '';
        const words = text.split(' ');
        el.textContent = '';
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline';
        
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.textContent = word + (i < words.length - 1 ? ' ' : '');
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          span.style.transform = 'translateY(20px)';
          wrapper.appendChild(span);
        });
        el.appendChild(wrapper);

        gsap.to(wrapper.children, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      });

    }, containerRef);

    return () => ctx.revert();
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
