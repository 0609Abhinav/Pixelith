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
  children?: never;
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

  let aspectClass = '';
  if (ratio === '4 / 5' || ratio === '4/5') aspectClass = 'aspect-[4/5]';
  else if (ratio === '16 / 9' || ratio === '16/9') aspectClass = 'aspect-video';
  else if (ratio === '1 / 1' || ratio === '1/1') aspectClass = 'aspect-square';

  return (
    <div 
      className={`smart-image relative overflow-hidden bg-gray-900/20 ${aspectClass} ${className}`.trim()} 
      style={!aspectClass ? { aspectRatio: ratio } as CSSProperties : {}}
    >
      {!loaded && <div className="absolute inset-0 bg-gray-800/40 animate-pulse backdrop-blur-md" aria-hidden="true" />}
      <img
        className="w-full h-full object-cover object-center transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        style={{ opacity: loaded ? 1 : 0 }}
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
