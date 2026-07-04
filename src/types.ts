export type SocialLink = {
  label: string;
  href: string;
};

export type HeroLink = {
  label: string;
  href: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type Category = {
  name: string;
  slug: string;
  description: string;
};

export type Photo = {
  id: string;
  title: string;
  category: string;
  album: string;
  location: string;
  camera: string;
  lens: string;
  iso: string;
  aperture: string;
  shutter: string;
  date: string;
  tags: string[];
  image: string;
};

export type Album = {
  title: string;
  year: number;
  cover: string;
  count: number;
  description: string;
};

export type Service = {
  title: string;
  price: string;
  description: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  benefits: string[];
  highlight: boolean;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar: string;
};

export type BlogPost = {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  image: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  description: string;
};

export type AwardItem = {
  name: string;
  issuer: string;
  year: number;
};

export type ExperienceItem = {
  label: string;
  value: string;
};

export type FooterData = {
  address: string;
  phone: string;
  email: string;
  hours: string;
  social: Record<string, string>;
};

export type SiteData = {
  brand: {
    name: string;
    tagline: string;
    accent: string;
    developer: {
      name: string;
      url: string;
      email: string;
      github: string;
      linkedin: string;
      x: string;
      instagram: string;
      portfolio: string;
    };
  };
  hero: {
    eyebrow: string;
    headline: string;
    summary: string;
    primaryCta: HeroLink;
    secondaryCta: HeroLink;
    image: string;
  };
  stats: StatItem[];
  categories: Category[];
  photos: Photo[];
  albums: Album[];
  services: Service[];
  pricing: PricingPlan[];
  testimonials: Testimonial[];
  blogs: BlogPost[];
  faqs: FaqItem[];
  timeline: TimelineItem[];
  awards: AwardItem[];
  experience: ExperienceItem[];
  clients: string[];
  footer: FooterData;
};

export type SearchResults = {
  photos: Photo[];
  albums: Album[];
  blogs: BlogPost[];
};

export type SeoMeta = {
  title: string;
  description: string;
  canonical: string;
  openGraphImage: string;
  twitterCard: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
};
