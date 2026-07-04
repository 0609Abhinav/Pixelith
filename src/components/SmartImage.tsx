import { useState, type CSSProperties } from 'react';

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
  ratio = '4 / 5',
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={`smart-image ${className}`.trim()} style={{ aspectRatio: ratio } as CSSProperties}>
      {!loaded && <div className="smart-image-placeholder" aria-hidden="true" />}
      <img
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
