import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './cinematic-hero.css';

type CinematicHeroProps = {
  heroImage: string;
  onComplete: () => void;
};

export function CinematicHero({ heroImage, onComplete }: CinematicHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const cornersAltRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const bladeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const camera = cameraRef.current;
    const flash = flashRef.current;
    const image = imageRef.current;
    const corners = cornersRef.current;
    const cornersAlt = cornersAltRef.current;
    const lines = linesRef.current;
    const brand = brandRef.current;
    const counter = counterRef.current;
    const blades = bladeRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!root || !camera || !flash || !image || !corners || !cornersAlt || !lines || !brand || !counter || blades.length === 0) return;

    // Reset all elements to initial state
    gsap.set(camera, { opacity: 0, scale: 0.6, rotation: -15, y: 0 });
    gsap.set(flash, { opacity: 0 });
    gsap.set(image, { opacity: 0, scale: 1.3 });
    gsap.set([corners, cornersAlt], { opacity: 0, scale: 1.2 });
    gsap.set(counter, { opacity: 0 });
    gsap.set(lines, { opacity: 0 });
    gsap.set(brand, { opacity: 0, y: 20 });

    blades.forEach((blade, i) => {
      const angle = (i * 360) / blades.length;
      gsap.set(blade, {
        x: Math.cos((angle * Math.PI) / 180) * 40 - 30,
        y: Math.sin((angle * Math.PI) / 180) * 40 - 30,
        rotation: angle,
        opacity: 0,
      });
    });

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        gsap.to(root, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => {
            if (root) root.style.display = 'none';
            onComplete();
          },
        });
      },
    });

    // 1. Camera fades in with rotation (0 → 0.8s)
    tl.to(camera, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'power3.out' }, 0);

    // Counter appears
    tl.to(counter, { opacity: 1, duration: 0.3 }, 0.4);

    // 2. Viewfinder corners fade in (0.6 → 0.9s)
    tl.to([corners, cornersAlt], { opacity: 0.6, scale: 1, duration: 0.4, ease: 'power2.out' }, 0.6);

    // 3. Aperture blades CLOSE (shutter click) (0.8 → 1.2s)
    blades.forEach((blade, i) => {
      const angle = (i * 360) / blades.length;
      const closedX = Math.cos((angle * Math.PI) / 180) * 8 - 30;
      const closedY = Math.sin((angle * Math.PI) / 180) * 8 - 30;

      // Fade in blades
      tl.to(blade, { opacity: 1, duration: 0.15 }, 0.7 + i * 0.02);

      // Close blades
      tl.to(blade, { x: closedX, y: closedY, duration: 0.25, ease: 'power4.in' }, 0.85);
    });

    // 4. Shutter lines effect
    tl.to(lines, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 1 }, 1.1);

    // 5. FLASH! (1.2 → 1.5s)
    tl.to(flash, { opacity: 1, duration: 0.08, ease: 'power4.in' }, 1.2);
    tl.to(flash, { opacity: 0, duration: 0.5, ease: 'power2.out' }, 1.3);

    // 6. Open aperture blades back up
    blades.forEach((blade, i) => {
      const angle = (i * 360) / blades.length;
      tl.to(blade, {
        x: Math.cos((angle * Math.PI) / 180) * 50 - 30,
        y: Math.sin((angle * Math.PI) / 180) * 50 - 30,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, 1.5);
    });

    // 7. Image reveals underneath with zoom-out (1.4 → 2.5s)
    tl.to(image, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 1.4);

    // 8. Camera slides up and fades away (2.0 → 2.8s)
    tl.to(camera, { y: -200, opacity: 0, scale: 0.7, duration: 0.8, ease: 'power3.in' }, 2.0);

    // Hide corners
    tl.to([corners, cornersAlt], { opacity: 0, duration: 0.4 }, 2.2);
    tl.to(counter, { opacity: 0, duration: 0.3 }, 2.0);

    // 9. Brand watermark fades in (2.6 → 3.2s)
    tl.to(brand, { opacity: 0.7, y: 0, duration: 0.6, ease: 'power2.out' }, 2.6);

    // 10. Hold for a beat, then complete (3.5s)
    tl.to({}, { duration: 0.8 }, 3.2);

    return () => {
      tl.kill();
    };
  }, []);

  const NUM_BLADES = 7;

  return (
    <div ref={rootRef} className="cinematic-hero">
      {/* Revealed photo underneath */}
      <div ref={imageRef} className="hero-revealed-image">
        <img src={heroImage} alt="Featured photograph" />
        <div className="hero-vignette" />
      </div>

      {/* Viewfinder corners */}
      <div ref={cornersRef} className="viewfinder-corners" />
      <div ref={cornersAltRef} className="viewfinder-corners-alt" />

      {/* Shutter counter */}
      <div ref={counterRef} className="shutter-counter">
        1 / 1 &nbsp;&nbsp; ƒ/2.0 &nbsp;&nbsp; 1/500 &nbsp;&nbsp; ISO 640
      </div>

      {/* Shutter lines */}
      <div ref={linesRef} className="shutter-lines" />

      {/* Flash overlay */}
      <div ref={flashRef} className="shutter-flash" />

      {/* DSLR Camera SVG */}
      <div ref={cameraRef} className="camera-container">
        <svg
          className="camera-svg"
          viewBox="0 0 340 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camera body */}
          <rect x="30" y="60" width="280" height="160" rx="16" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />

          {/* Top plate */}
          <rect x="30" y="50" width="280" height="25" rx="8" fill="#222" stroke="#333" strokeWidth="1" />

          {/* Viewfinder hump */}
          <rect x="100" y="30" width="60" height="30" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <rect x="115" y="35" width="30" height="12" rx="3" fill="#0a0a0a" stroke="#444" strokeWidth="0.5" />

          {/* Hot shoe */}
          <rect x="148" y="26" width="44" height="6" rx="2" fill="#333" />

          {/* Mode dial (right) */}
          <circle cx="260" cy="52" r="14" fill="#222" stroke="#444" strokeWidth="1" />
          <circle cx="260" cy="52" r="10" fill="#1a1a1a" />
          <line x1="260" y1="42" x2="260" y2="46" stroke="#d8b77b" strokeWidth="1" />

          {/* Shutter button */}
          <circle cx="230" cy="48" r="8" fill="#333" stroke="#555" strokeWidth="1" />
          <circle cx="230" cy="48" r="5" fill="#444" />

          {/* Grip (right side) */}
          <rect x="275" y="65" width="30" height="150" rx="10" fill="#151515" stroke="#333" strokeWidth="1" />
          {/* Grip texture lines */}
          {[85, 95, 105, 115, 125, 135, 145, 155].map((y) => (
            <line key={y} x1="280" y1={y} x2="300" y2={y} stroke="#2a2a2a" strokeWidth="0.5" />
          ))}

          {/* Lens mount ring */}
          <circle cx="155" cy="145" r="62" fill="#111" stroke="#444" strokeWidth="2" />
          <circle cx="155" cy="145" r="56" fill="#0a0a0a" stroke="#333" strokeWidth="1" />

          {/* Lens barrel outer */}
          <circle cx="155" cy="145" r="50" fill="#161616" stroke="#2a2a2a" strokeWidth="1.5" />

          {/* Lens rings */}
          <circle cx="155" cy="145" r="44" fill="none" stroke="#222" strokeWidth="0.5" />
          <circle cx="155" cy="145" r="38" fill="none" stroke="#1e1e1e" strokeWidth="0.5" />

          {/* Lens front element */}
          <circle cx="155" cy="145" r="34" fill="#080818" stroke="#333" strokeWidth="1" />

          {/* Lens reflections */}
          <ellipse cx="145" cy="135" rx="12" ry="8" fill="url(#lensReflect)" opacity="0.3" />
          <ellipse cx="165" cy="155" rx="8" ry="5" fill="url(#lensReflect2)" opacity="0.15" />

          {/* Lens center element */}
          <circle cx="155" cy="145" r="22" fill="#050510" stroke="#2a2a2a" strokeWidth="0.5" />

          {/* Inner glass highlight */}
          <circle cx="155" cy="145" r="14" fill="#060614" opacity="0.9" />

          {/* Brand text on body */}
          <text x="65" y="100" fill="#555" fontFamily="Space Grotesk, sans-serif" fontSize="10" letterSpacing="0.15em">
            DARKVAMPIRE
          </text>

          {/* Small indicator LED */}
          <circle cx="55" cy="82" r="2.5" fill="#d8b77b" opacity="0.8" />

          {/* SD card slot indicator */}
          <rect x="45" y="170" width="12" height="18" rx="2" fill="none" stroke="#333" strokeWidth="0.5" />

          {/* Lens text */}
          <text x="120" y="205" fill="#333" fontFamily="Space Grotesk, sans-serif" fontSize="6" letterSpacing="0.1em">
            35mm ƒ/1.4
          </text>

          <defs>
            <radialGradient id="lensReflect" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#4466ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4466ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lensReflect2" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#d8b77b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d8b77b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Aperture blades overlaid on the lens center */}
        <div className="aperture-container">
          {Array.from({ length: NUM_BLADES }).map((_, i) => (
            <div
              key={i}
              ref={(el) => { bladeRefs.current[i] = el; }}
              className="aperture-blade"
            />
          ))}
        </div>
      </div>

      {/* Brand watermark */}
      <div ref={brandRef} className="hero-brand-watermark">
        Darkvampire Studio
      </div>
    </div>
  );
}
