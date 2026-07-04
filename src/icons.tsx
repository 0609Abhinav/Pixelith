import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconShell(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props} />
  );
}

export function ApertureIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.2 4.8 14 11.3" />
      <path d="M15.8 5 11.4 11.1" />
      <path d="m19.2 10.1-7.8.3" />
      <path d="M15.9 19.2 10.1 12.7" />
      <path d="M8.1 19.1 12.6 12.9" />
      <path d="m4.8 13.8 7.7-.3" />
    </IconShell>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.2-1.8h4.4L15.4 6h2.1A2.5 2.5 0 0 1 20 8.5v7A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-7Z" />
      <circle cx="12" cy="12" r="3.5" />
    </IconShell>
  );
}

export function FilmIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5v14M16 5v14M4 9h4M16 9h4M4 13h4M16 13h4" />
    </IconShell>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m6.5 15 3.6-3.6a1 1 0 0 1 1.4 0L14 15" />
      <circle cx="10" cy="9" r="1.25" />
    </IconShell>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="m12 4 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </IconShell>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4 4" />
    </IconShell>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 4 13.8 9.2 19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z" />
      <path d="M5 18l.9 2.5L8.5 21l-2.6.9L5 24l-.9-2.5L1.5 21l2.6-.9L5 18Z" />
    </IconShell>
  );
}

