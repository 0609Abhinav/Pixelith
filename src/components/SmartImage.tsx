import { useState, useEffect, type CSSProperties } from 'react';
import { registerImage } from '../media';

type SmartImageProps = {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
};

export function SmartImage({
  src,
  alt,
  ratio = '4/5',
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    registerImage(src);
  }, [src]);

  return (
    <div 
      className={`smart-image ${className}`.trim()} 
      style={{ aspectRatio: ratio, position: 'relative', overflow: 'hidden', background: 'rgba(20,22,30,0.3)' } as CSSProperties}
    >
      {!loaded && (
        <div 
          style={{ 
            position: 'absolute', inset: 0, 
            background: 'rgba(30,32,44,0.4)', 
            backdropFilter: 'blur(12px)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} 
          aria-hidden="true" 
        />
      )}
      <img
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: loaded ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease',
        }}
        src={failed ? 'https://images.unsplash.com/photo-1518831959646-742c3c57c0c8?auto=format&fit=crop&w=1200&q=80' : src}
        alt={alt}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        data-loaded={loaded ? 'true' : 'false'}
      />
    </div>
  );
}
