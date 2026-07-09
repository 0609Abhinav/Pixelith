import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminSummary,
  fetchSeo,
  fetchSite,
  loginAdmin,
  searchContent,
  submitBooking,
  submitContact,
} from './api';
import { fallbackSite } from './fallback';
import type { Album, BlogPost, Category, FaqItem, Photo, PricingPlan, SearchResults, Service, SiteData, StatItem, Testimonial } from './types';
import { SmartImage } from './components/SmartImage';
import { InteractiveCard } from './components/InteractiveCard';
import { CinematicHero } from './components/HeroScene';
import { ScrollProgress } from './components/ScrollProgress';
import { SmoothCursor } from './components/SmoothCursor';
import { useScrollAnimations } from './hooks/useScrollAnimations';
import { uniqueBy, takeUnique } from './media';
import { ApertureIcon, CameraIcon, FilmIcon, ImageIcon, LayersIcon, SearchIcon, SparklesIcon } from './icons';
import { useStudioStore } from './store';

const routeItems = [
  { path: '/', label: 'Home', icon: CameraIcon, desktop: true },
  { path: '/portfolio', label: 'Portfolio', icon: ImageIcon, desktop: true },
  { path: '/gallery', label: 'Gallery', icon: LayersIcon, desktop: true },
  { path: '/albums', label: 'Albums', icon: FilmIcon, desktop: true },
  { path: '/services', label: 'Services', icon: SparklesIcon, desktop: true },
  { path: '/blog', label: 'Blog', icon: ApertureIcon, desktop: true },
  { path: '/booking', label: 'Booking', icon: CameraIcon, desktop: true },
  { path: '/contact', label: 'Contact', icon: SearchIcon, desktop: true },
  { path: '/categories', label: 'Categories', icon: LayersIcon, desktop: false },
  { path: '/pricing', label: 'Pricing', icon: SparklesIcon, desktop: false },
  { path: '/about', label: 'About', icon: ApertureIcon, desktop: false },
  { path: '/experience', label: 'Experience', icon: CameraIcon, desktop: false },
  { path: '/awards', label: 'Awards', icon: FilmIcon, desktop: false },
  { path: '/testimonials', label: 'Testimonials', icon: ImageIcon, desktop: false },
  { path: '/faq', label: 'FAQ', icon: SearchIcon, desktop: false },
  { path: '/search', label: 'Search', icon: SearchIcon, desktop: false },
] as const;

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

function TooltipNavLink({ path, label, Icon }: { path: string, label: string, Icon: any }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink to={path} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} style={{ padding: '8px' }}>
        <Icon size={20} strokeWidth={1.5} />
        <span className="sr-only">{label}</span>
      </NavLink>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              padding: '4px 8px',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              fontSize: '10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              whiteSpace: 'nowrap',
              zIndex: 50,
              pointerEvents: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function useSiteData() {
  return useQuery({
    queryKey: ['site'],
    queryFn: fetchSite,
    placeholderData: fallbackSite,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 6000),
  });
}

function getSeoFallback(site: SiteData, path: string) {
  const fallbackImage =
    path === '/blog'
      ? site.blogs[0]?.image ?? site.hero.image
      : path === '/albums'
        ? site.albums[0]?.cover ?? site.hero.image
        : path === '/gallery'
          ? site.photos[1]?.image ?? site.hero.image
          : path === '/portfolio'
            ? site.photos[0]?.image ?? site.hero.image
            : site.hero.image;

  return {
    title: `${site.brand.name} | Premium Photography`,
    description: site.hero.summary,
    canonical: `https://darkvampire.studio${path}`,
    openGraphImage: fallbackImage,
    twitterCard: 'summary_large_image' as const,
  };
}

function buildStructuredData(site: SiteData, path: string) {
  const baseUrl = 'https://darkvampire.studio';
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.brand.name,
    url: baseUrl,
    logo: site.hero.image,
    sameAs: [site.brand.developer.instagram, site.brand.developer.linkedin, site.brand.developer.x],
  };
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.brand.developer.name,
    url: site.brand.developer.url,
    jobTitle: 'Photography Studio Founder',
    worksFor: {
      '@type': 'Organization',
      name: site.brand.name,
    },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: path.replace('/', '') || 'Home',
        item: `${baseUrl}${path}`,
      },
    ],
  };

  if (path === '/blog') {
    return [
      organization,
      person,
      breadcrumb,
      ...site.blogs.map((post) => ({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image,
        datePublished: post.date,
        author: {
          '@type': 'Person',
          name: site.brand.developer.name,
        },
        publisher: {
          '@type': 'Organization',
          name: site.brand.name,
          logo: site.hero.image,
        },
      })),
    ];
  }

  return [organization, person, breadcrumb];
}

function App() {
  const location = useLocation();
  const siteQuery = useSiteData();
  const site = siteQuery.data ?? fallbackSite;
  const theme = useStudioStore((state) => state.theme);
  const toggleTheme = useStudioStore((state) => state.toggleTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const scrollRef = useScrollAnimations([location.pathname, loadingComplete]);

  const seoQuery = useQuery({
    queryKey: ['seo', location.pathname],
    queryFn: () => fetchSeo(location.pathname),
    placeholderData: getSeoFallback(site, location.pathname),
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const seo = seoQuery.data;
    if (!seo) {
      return;
    }
    document.title = seo.title;
    const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', seo.description);
    }
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);
    let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', seo.openGraphImage);
    let twitterCard = document.querySelector('meta[name="twitter:card"]') as HTMLMetaElement | null;
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', seo.twitterCard);

    let scriptLd = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
    if (!scriptLd) {
      scriptLd = document.createElement('script');
      scriptLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptLd);
    }
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "PhotographyBusiness",
      "name": seo.title,
      "description": seo.description,
      "image": seo.openGraphImage,
      "url": seo.canonical,
    };
    scriptLd.textContent = JSON.stringify(jsonLd);
  }, [seoQuery.data]);

  useEffect(() => {
    const scriptId = 'structured-data';
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(buildStructuredData(site, location.pathname));
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [location.pathname, site]);

  useEffect(() => {
    setMenuOpen(false);
    setActivePhoto(null);
    setActiveAlbum(null);
  }, [location.pathname]);

  return (
    <div className="app-shell" ref={scrollRef}>
      {!loadingComplete && (
        <CinematicHero
          heroImage={site.hero.image}
          onComplete={() => setLoadingComplete(true)}
        />
      )}
      <ScrollProgress />
      <SmoothCursor />
      
      <div className="background-orb background-orb-one" />
      <div className="background-orb background-orb-two" />
      <header className="topbar">
        <Link className="brand" to="/" aria-label={site.brand.name}>
          <span className="brand-mark brand-mark-icon" aria-hidden="true">
            <span className="brand-mark-core" />
          </span>
        </Link>
        <nav className="nav nav-desktop flex items-center gap-4" aria-label="Primary">
          {routeItems.filter(item => item.desktop).map(({ path, label, icon: Icon }) => (
            <TooltipNavLink key={path} path={path} label={label} Icon={Icon} />
          ))}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} type="button" aria-expanded={menuOpen} aria-controls="site-menu">
            <span className="menu-icon" aria-hidden="true" />
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </header>
      <div id="site-menu" className={menuOpen ? 'menu-panel open' : 'menu-panel'}>
        <div className="menu-panel-inner">
          <div className="menu-panel-head">
            <span className="eyebrow">Explore</span>
            <p>Everything is organized into a single elegant navigation drawer.</p>
          </div>
          <div className="menu-links">
{routeItems.map(({ path, label }) => (
              <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="menu-panel-foot">
            <Link className="button button-primary" to="/booking">
              Book now
            </Link>
            <Link className="button button-secondary" to="/contact">
              Contact studio
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.main key={location.pathname} className="page" {...pageTransition}>
          <Routes>
            <Route path="/" element={<HomePage site={site} onOpenAlbum={setActiveAlbum} />} />
            <Route path="/portfolio" element={<CollectionPage site={site} title="Portfolio" description="Curated hero images, editorial selects, and campaign-ready frames." items={site.photos} onOpenPhoto={setActivePhoto} />} />
            <Route path="/gallery" element={<GalleryPage site={site} onOpenPhoto={setActivePhoto} />} />
            <Route path="/albums" element={<AlbumsPage site={site} onOpenAlbum={setActiveAlbum} />} />
            <Route path="/categories" element={<CategoriesPage site={site} />} />
            <Route path="/services" element={<ServicesPage site={site} />} />
            <Route path="/pricing" element={<PricingPage site={site} />} />
            <Route path="/about" element={<StoryPage site={site} />} />
            <Route path="/experience" element={<ExperiencePage site={site} />} />
            <Route path="/achievements" element={<AchievementsPage site={site} />} />
            <Route path="/awards" element={<AwardsPage site={site} />} />
            <Route path="/testimonials" element={<TestimonialsPage site={site} />} />
            <Route path="/blog" element={<BlogPage site={site} />} />
            <Route path="/faq" element={<FaqPage site={site} />} />
            <Route path="/booking" element={<BookingPage site={site} />} />
            <Route path="/contact" element={<ContactPage site={site} />} />
            <Route path="/privacy" element={<LegalPage title="Privacy Policy" content="We only use the information you submit to respond to enquiries, manage bookings, and improve the experience of the platform." />} />
            <Route path="/terms" element={<LegalPage title="Terms of Use" content="Use this platform responsibly, respect the image licensing attached to each work, and contact the studio before reproducing any assets." />} />
            <Route path="/search" element={<SearchPage site={site} />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<DashboardPage site={site} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.main>
      </AnimatePresence>

      {activePhoto && <PhotoModal photo={activePhoto} onClose={() => setActivePhoto(null)} />}
      {activeAlbum && (
        <AlbumModal
          album={activeAlbum}
          site={site}
          onClose={() => setActiveAlbum(null)}
          onOpenPhoto={(photo) => {
            setActiveAlbum(null);
            setActivePhoto(photo);
          }}
        />
      )}
      <Footer site={site} />
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="section-heading">
      <span data-animate className="eyebrow">
        {eyebrow}
      </span>
      <h2 data-animate>{title}</h2>
      <p data-animate>{description}</p>
    </div>
  );
}

function Hero({ site }: { site: SiteData }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow" data-animate data-scroll>
          {site.hero.eyebrow}
        </span>
        <h1 data-animate data-scroll>{site.hero.headline}</h1>
        <p data-animate data-scroll>{site.hero.summary}</p>
        <div className="hero-actions" data-animate data-scroll>
          <Link className="button button-primary" to={site.hero.primaryCta.href} data-magnetic>
            {site.hero.primaryCta.label}
          </Link>
          <Link className="button button-secondary" to={site.hero.secondaryCta.href} data-magnetic>
            {site.hero.secondaryCta.label}
          </Link>
        </div>
        <div className="stat-row" data-stagger>
          {site.stats.map((stat) => (
            <article key={stat.label} className="stat-card" data-animate>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="hero-visual" data-animate data-scale>
        <div className="hero-visual-frame">
          <div className="hero-grid-lines" />
          <div className="hero-capsule hero-capsule-top">
            <span>Studio motion</span>
            <strong>Editorial precision</strong>
          </div>
          <div className="hero-capsule hero-capsule-bottom">
            <span>Camera ritual</span>
            <strong>Light first</strong>
          </div>
          <div className="hero-glass-card">
            <SmartImage src={site.hero.image} alt="Cinematic studio preview" ratio="4/5" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ site, onOpenAlbum }: { site: SiteData; onOpenAlbum: (album: Album) => void }) {
  const processSteps = [
    {
      title: 'Discovery that feels bespoke',
      body: 'We shape the brief, mood, references, and deliverables around the client rather than forcing a template onto the work.',
    },
    {
      title: 'Direction with cinematic control',
      body: 'Every shoot is guided by light, framing, and composition so the final gallery feels curated instead of simply documented.',
    },
    {
      title: 'Delivery built for conversion',
      body: 'Albums, blog stories, and booking flows are presented to turn visual interest into real studio enquiries.',
    },
  ];

  return (
    <>
      <Hero site={site} />
      <SectionTitle eyebrow="Featured work" title="Selected frames that feel like a magazine cover." description="A polished mix of wedding, portrait, fashion, and commercial imagery presented with editorial rhythm." />
      <CollectionStrip items={site.photos} />
      <SectionTitle eyebrow="Categories" title="Each genre is curated as its own experience." description="Every category can be expanded or replaced from the admin system without redesigning the interface." />
      <CardGrid
        items={site.categories}
        renderItem={(category) => (
          <InteractiveCard className="card">
            <span className="card-kicker">{category.slug}</span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </InteractiveCard>
        )}
      />
      <SectionTitle eyebrow="Albums" title="Story-driven sets with a strong visual identity." description="Albums act like curated chapters instead of static folders." />
      <CardGrid
        items={site.albums.slice(0, 4)}
        renderItem={(album) => <AlbumCard key={album.title} album={album} onOpen={() => onOpenAlbum(album)} />}
      />
      <SectionTitle eyebrow="Services" title="Offers shaped around premium client needs." description="Packages, retainers, and bespoke direction are all editable from the backend." />
      <CardGrid items={site.services} renderItem={(service) => <ServiceCard key={service.title} service={service} />} />
      <SectionTitle eyebrow="Testimonials" title="Experience designed to feel calm and high-touch." description="The platform presents social proof with the same level of care as the imagery itself." />
      <CardGrid items={site.testimonials} renderItem={(testimonial) => <TestimonialCard key={testimonial.name} testimonial={testimonial} />} />
      <SectionTitle eyebrow="Client work" title="Trusted by brands that want their imagery to feel expensive." description="A compact logo wall gives the homepage a more complete enterprise feel." />
      <ClientStrip clients={site.clients} />
      <SectionTitle eyebrow="Studio process" title="A premium workflow that keeps clients confident from first call to final delivery." description="The site is written to explain not just what the studio creates, but how it creates value." />
      <CardGrid
        items={processSteps}
        renderItem={(step) => (
          <InteractiveCard className="card">
            <span className="card-kicker">Process</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </InteractiveCard>
        )}
      />
      <SectionTitle eyebrow="Latest thinking" title="Editorial notes from the studio." description="Blogs are fed from the same content source as the rest of the platform." />
      <CardGrid items={site.blogs} renderItem={(post) => <BlogCard key={post.title} post={post} />} />
      <SectionTitle eyebrow="FAQ" title="Questions that clients ask before they book." description="The FAQ area can be edited from the CMS and reused on every service page." />
      <FaqList items={site.faqs.slice(0, 4)} />
    </>
  );
}

function CollectionPage({
  title,
  description,
  items,
  onOpenPhoto,
}: {
  site: SiteData;
  title: string;
  description: string;
  items: Photo[];
  onOpenPhoto?: (photo: Photo) => void;
}) {
  return (
    <PageFrame title={title} description={description}>
      <MasonryGrid>
        {items.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onOpen={onOpenPhoto ? () => onOpenPhoto(photo) : undefined} />
        ))}
      </MasonryGrid>
    </PageFrame>
  );
}

function GalleryPage({ site, onOpenPhoto }: { site: SiteData; onOpenPhoto: (photo: Photo) => void }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...new Set(site.photos.map((photo) => photo.category))];
  const filtered = filter === 'All' ? site.photos : site.photos.filter((photo) => photo.category === filter);
  const categoryCounts = categories.slice(1).map((category) => ({
    category,
    count: site.photos.filter((photo) => photo.category === category).length,
  }));

  return (
    <PageFrame title="Gallery" description="An infinite-feel masonry layout with metadata, tags, and a premium lightbox-ready structure.">
      <div className="gallery-stats">
        <article className="gallery-stat">
          <span>Images</span>
          <strong>{site.photos.length}</strong>
        </article>
        <article className="gallery-stat">
          <span>Albums</span>
          <strong>{site.albums.length}</strong>
        </article>
        <article className="gallery-stat">
          <span>Categories</span>
          <strong>{site.categories.length}</strong>
        </article>
      </div>
      <div className="filter-row">
        {categories.map((option) => (
          <button key={option} className={option === filter ? 'chip active' : 'chip'} onClick={() => setFilter(option)} type="button">
            {option}
          </button>
        ))}
      </div>
      <div className="category-pills">
        {categoryCounts.map((entry) => (
          <span key={entry.category} className="category-pill">
            {entry.category} <strong>{entry.count}</strong>
          </span>
        ))}
      </div>
      <MasonryGrid>
        {filtered.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onOpen={() => onOpenPhoto(photo)} />
        ))}
      </MasonryGrid>
    </PageFrame>
  );
}

function AlbumsPage({ site, onOpenAlbum }: { site: SiteData; onOpenAlbum: (album: Album) => void }) {
  return (
    <PageFrame title="Albums" description="Every album reads like a chapter with a distinct palette, pacing, and emotional arc.">
      <CardGrid items={site.albums} renderItem={(album) => <AlbumCard key={album.title} album={album} onOpen={() => onOpenAlbum(album)} />} />
    </PageFrame>
  );
}

function CategoriesPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Categories" description="Organize the portfolio by genre, campaign type, or niche specialty.">
      <CardGrid
        items={site.categories}
        renderItem={(category) => (
          <InteractiveCard key={category.slug} className="card category-card">
            <span className="card-kicker">{category.slug}</span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <Link className="text-link" to={`/portfolio?category=${encodeURIComponent(category.name)}`}>
              View collection
            </Link>
          </InteractiveCard>
        )}
      />
    </PageFrame>
  );
}

function ServicesPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Services" description="Studio offerings presented with premium clarity and clear client outcomes.">
      <CardGrid items={site.services} renderItem={(service) => <ServiceCard key={service.title} service={service} />} />
    </PageFrame>
  );
}

function PricingPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Pricing" description="A refined pricing system that can flex for sessions, campaigns, and custom retainers.">
      <div className="pricing-grid">
        {site.pricing.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </PageFrame>
  );
}

function StoryPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="About" description="A concise, editorial story about the studio and the ideas behind its visual language.">
      <div className="split-layout">
        <div className="stack">
          <p className="lead">
            Darkvampire was built around a simple belief: premium photography should feel calm, expressive, and unmistakably intentional.
          </p>
          <p>
            The platform is designed to help a modern studio present work, sell services, accept bookings, and evolve content without rebuilding the site every season.
          </p>
          <Link className="button button-primary" to="/booking">
            Start a booking
          </Link>
        </div>
        <div className="timeline">
          {site.timeline.map((item) => (
            <article key={item.year} className="timeline-item">
              <strong>{item.year}</strong>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

function ExperiencePage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Experience" description="A quick view of the studio's creative depth, client retention, and service capacity.">
      <div className="experience-grid">
        {site.experience.map((item) => (
          <article key={item.label} className="experience-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}

function AchievementsPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Achievements" description="Selected milestones and recognition that support premium positioning.">
      <CardGrid
        items={site.awards}
        renderItem={(award) => (
          <InteractiveCard key={award.name} className="card">
            <span className="card-kicker">{award.year}</span>
            <h3>{award.name}</h3>
            <p>{award.issuer}</p>
          </InteractiveCard>
        )}
      />
    </PageFrame>
  );
}

function AwardsPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Awards" description="Recognition presented in a clean, editorial format.">
      <CardGrid
        items={site.awards}
        renderItem={(award) => (
          <InteractiveCard key={award.name} className="card">
            <span className="card-kicker">{award.issuer}</span>
            <h3>{award.name}</h3>
            <p>{award.year}</p>
          </InteractiveCard>
        )}
      />
    </PageFrame>
  );
}

function TestimonialsPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Testimonials" description="High-trust client voices with a premium presentation.">
      <CardGrid items={site.testimonials} renderItem={(testimonial) => <TestimonialCard key={testimonial.name} testimonial={testimonial} />} />
    </PageFrame>
  );
}

function BlogPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="Blog" description="Editorial articles and strategy notes for clients, collaborators, and future buyers.">
      <CardGrid items={site.blogs} renderItem={(post) => <BlogCard key={post.title} post={post} />} />
    </PageFrame>
  );
}

function FaqPage({ site }: { site: SiteData }) {
  return (
    <PageFrame title="FAQ" description="Concise answers to the questions that matter before a client enquires.">
      <FaqList items={site.faqs} />
    </PageFrame>
  );
}

function BookingPage({ site }: { site: SiteData }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    package: site.pricing[0]?.name ?? 'Signature',
    preferredDate: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      await submitBooking(form);
      setStatus('done');
      setForm({
        name: '',
        email: '',
        phone: '',
        package: site.pricing[0]?.name ?? 'Signature',
        preferredDate: '',
        message: '',
      });
    } catch {
      setStatus('error');
    }
  }

  return (
    <PageFrame title="Booking" description="Submit a session request that lands in the backend for later admin review.">
      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </label>
          <label>
            Package
            <select value={form.package} onChange={(event) => setForm({ ...form, package: event.target.value })}>
              {site.pricing.map((plan) => (
                <option key={plan.name} value={plan.name}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Preferred date
            <input type="date" value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} />
          </label>
          <label>
            Message
            <textarea rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </label>
          <button className="button button-primary" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Sending...' : 'Request booking'}
          </button>
          {status === 'done' && <p className="notice success">Your booking request was sent.</p>}
          {status === 'error' && <p className="notice error">Something went wrong. Try again in a moment.</p>}
        </form>
        <div className="side-panel">
          <h3>Available formats</h3>
          <ul className="bullet-list">
            {site.services.map((service) => (
              <li key={service.title}>
                <strong>{service.title}</strong>
                <span>{service.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageFrame>
  );
}

function ContactPage({ site }: { site: SiteData }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');
    try {
      await submitContact(form);
      setStatus('done');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <PageFrame title="Contact" description="A contact system ready for client enquiries, collaborations, and studio partnerships.">
      <div className="split-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Subject
            <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required />
          </label>
          <label>
            Message
            <textarea rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
          </label>
          <button className="button button-primary" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Sending...' : 'Send message'}
          </button>
          {status === 'done' && <p className="notice success">Your message was delivered.</p>}
          {status === 'error' && <p className="notice error">Something went wrong. Try again in a moment.</p>}
        </form>
        <div className="side-panel">
          <h3>Studio details</h3>
          <p>{site.footer.address}</p>
          <p>{site.footer.email}</p>
          <p>{site.footer.phone}</p>
          <p>{site.footer.hours}</p>
        </div>
      </div>
    </PageFrame>
  );
}

function SearchPage({ site }: { site: SiteData }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';
  const searchQuery = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchContent(query),
    enabled: query.trim().length > 0,
  });
  const emptyResults: SearchResults = { photos: [], albums: [], blogs: [] };
  const results: SearchResults = query.trim().length > 0 ? searchQuery.data ?? emptyResults : emptyResults;

  return (
    <PageFrame title="Search" description="Search across photos, albums, and blog posts in a single premium interface.">
      <div className="search-bar">
        <input
          value={query}
          onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})}
          placeholder="Search portfolios, albums, blogs..."
        />
        <button className="button button-secondary" onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)} type="button">
          Search
        </button>
      </div>
      {query.trim() === '' ? (
        <p className="muted">Try a term like "portrait", "fashion", or "campaign".</p>
      ) : (
        <div className="search-results">
          <ResultBlock title="Photos" items={results.photos} renderItem={(photo: Photo) => <PhotoCard key={photo.id} photo={photo} />} />
          <ResultBlock title="Albums" items={results.albums} renderItem={(album: Album) => <AlbumCard key={album.title} album={album} />} />
          <ResultBlock title="Blogs" items={results.blogs} renderItem={(post: BlogPost) => <BlogCard key={post.title} post={post} />} />
        </div>
      )}
      <div className="search-footer">
        <p>Showing live data from the backend. The default fallback is still available if the API is offline.</p>
      </div>
    </PageFrame>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const setAdminToken = useStudioStore((state) => state.setAdminToken);
  const [form, setForm] = useState({ email: 'admin@darkvampire.studio', password: 'admin123' });
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await loginAdmin(form.email, form.password);
      setAdminToken(response.accessToken);
      navigate('/admin');
    } catch {
      setError('Invalid admin credentials.');
    }
  }

  return (
    <PageFrame title="Admin Login" description="Secure access point for the dashboard and CMS controls.">
      <div className="auth-grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <button className="button button-primary" type="submit">
            Sign in
          </button>
          {error && <p className="notice error">{error}</p>}
        </form>
        <div className="side-panel">
          <h3>Default demo access</h3>
          <p>Email: admin@darkvampire.studio</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </PageFrame>
  );
}

function DashboardPage({ site }: { site: SiteData }) {
  const token = useStudioStore((state) => state.adminToken);
  const clearAdminToken = useStudioStore((state) => state.clearAdminToken);
  const summaryQuery = useQuery({
    queryKey: ['admin-summary', token],
    queryFn: () => fetchAdminSummary(token),
    enabled: Boolean(token),
  });

  if (!token) {
    return (
      <PageFrame title="Dashboard" description="Log in to view booking activity, contact messages, and CMS metrics.">
        <p className="muted">You are not signed in. Use the admin login page to continue.</p>
        <Link className="button button-primary" to="/admin/login">
          Go to login
        </Link>
      </PageFrame>
    );
  }

  const summary = summaryQuery.data;
  const dashboardMetrics: StatItem[] = summary?.metrics ?? site.stats;

  return (
    <PageFrame title="Dashboard" description="A SaaS-like admin overview for content, inquiries, and studio operations.">
      <div className="dashboard-toolbar">
        <button className="button button-secondary" onClick={clearAdminToken} type="button">
          Sign out
        </button>
      </div>
      <div className="experience-grid">
        {dashboardMetrics.map((item) => (
          <article key={item.label} className="experience-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
      <div className="dashboard-crm">
        <Panel title="CRM Pipeline">
          <div className="crm-list">
            <div className="crm-row"><span>New enquiries</span><strong>{summary?.counts?.contacts ?? 0}</strong></div>
            <div className="crm-row"><span>Pending bookings</span><strong>{summary?.counts?.bookings ?? 0}</strong></div>
            <div className="crm-row"><span>Featured clients</span><strong>{site.clients.length}</strong></div>
          </div>
        </Panel>
        <Panel title="Client Notes">
          <div className="crm-tags">
            {site.clients.slice(0, 6).map((client) => (
              <span key={client} className="tag-chip">{client}</span>
            ))}
          </div>
        </Panel>
      </div>
      <div className="dashboard-panels">
        <Panel title="Counts">
          <pre>{JSON.stringify(summary?.counts ?? {}, null, 2)}</pre>
        </Panel>
        <Panel title="Recent bookings">
          <pre>{JSON.stringify(summary?.recentBookings ?? [], null, 2)}</pre>
        </Panel>
        <Panel title="Recent contacts">
          <pre>{JSON.stringify(summary?.recentContacts ?? [], null, 2)}</pre>
        </Panel>
      </div>
    </PageFrame>
  );
}

function LegalPage({ title, content }: { title: string; content: string }) {
  return (
    <PageFrame title={title} description={content}>
      <div className="legal-copy">
        <p>{content}</p>
      </div>
    </PageFrame>
  );
}

function NotFoundPage() {
  return (
    <PageFrame title="404" description="This page drifted out of the spotlight.">
      <Link className="button button-primary" to="/">
        Return home
      </Link>
    </PageFrame>
  );
}

function PageFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="page-frame">
      <div className="page-intro">
        <span className="eyebrow">Darkvampire</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function CardGrid({
  items,
  renderItem,
}: {
  items: unknown[];
  renderItem: (item: any) => ReactNode;
}) {
  return <div className="card-grid">{items.map((item, index) => <div key={index} data-animate>{renderItem(item)}</div>)}</div>;
}

function MasonryGrid({ children }: { children: React.ReactNode }) {
  return <div className="masonry-grid">{children}</div>;
}

function CollectionStrip({ items }: { items: Photo[] }) {
  return (
    <div className="strip">
      {items.map((photo) => (
        <div key={photo.id} data-animate>
          <PhotoCard photo={photo} compact />
        </div>
      ))}
    </div>
  );
}

function PhotoCard({ photo, compact = false, onOpen }: { photo: Photo; compact?: boolean; onOpen?: () => void }) {
  return (
    <InteractiveCard className={compact ? 'media-card compact' : 'media-card gallery-card'}>
      <div onClick={onOpen} className="h-full w-full">
        <SmartImage src={photo.image} alt={photo.title} ratio="4/5" />
        <div className="media-content relative z-20">
        <span className="card-kicker">{photo.category}</span>
        <h3>{photo.title}</h3>
        <p>{photo.location}</p>
        <div className="tags-row">
          {photo.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
        {!compact && (
          <div className="detail-grid">
            <span>
              <strong>Camera</strong>
              {photo.camera}
            </span>
            <span>
              <strong>Lens</strong>
              {photo.lens}
            </span>
            <span>
              <strong>ISO</strong>
              {photo.iso}
            </span>
            <span>
              <strong>Exposure</strong>
              {photo.aperture} / {photo.shutter}
            </span>
            <span>
              <strong>Date</strong>
              {photo.date}
            </span>
            <span>
              <strong>Album</strong>
              {photo.album}
            </span>
          </div>
        )}
        {onOpen && (
          <button className="text-link gallery-open" type="button" onClick={onOpen}>
            Open detail
          </button>
        )}
      </div>
      </div>
    </InteractiveCard>
  );
}

function PhotoModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" type="button" onClick={onClose}>
          Close
        </button>
        <div className="modal-image">
          <SmartImage src={photo.image} alt={photo.title} ratio="4/5" />
        </div>
        <div className="modal-copy">
          <span className="card-kicker">{photo.category}</span>
          <h3>{photo.title}</h3>
          <p>{photo.location}</p>
          <div className="detail-grid modal-details">
            <span>
              <strong>Camera</strong>
              {photo.camera}
            </span>
            <span>
              <strong>Lens</strong>
              {photo.lens}
            </span>
            <span>
              <strong>ISO</strong>
              {photo.iso}
            </span>
            <span>
              <strong>Aperture</strong>
              {photo.aperture}
            </span>
            <span>
              <strong>Shutter</strong>
              {photo.shutter}
            </span>
            <span>
              <strong>Album</strong>
              {photo.album}
            </span>
          </div>
          <div className="tags-row">
            {photo.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}

function AlbumModal({
  album,
  site,
  onClose,
  onOpenPhoto,
}: {
  album: Album;
  site: SiteData;
  onClose: () => void;
  onOpenPhoto: (photo: Photo) => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const albumPhotos = site.photos.filter((photo) => photo.album === album.title);
  const relatedPhotos = site.photos
    .filter((photo) => photo.album === album.title || photo.category === albumPhotos[0]?.category)
    .slice(0, 8);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article className="modal-card album-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" type="button" onClick={onClose}>
          Close
        </button>
        <div className="modal-image">
          <SmartImage src={album.cover} alt={album.title} ratio="4/5" />
        </div>
        <div className="modal-copy">
          <span className="card-kicker">{album.year}</span>
          <h3>{album.title}</h3>
          <p>{album.description}</p>
          <div className="detail-grid modal-details">
            <span>
              <strong>Frames</strong>
              {album.count}
            </span>
            <span>
              <strong>Story arc</strong>
              {albumPhotos.length > 0 ? `${albumPhotos[0].category} focus` : 'Curated set'}
            </span>
            <span>
              <strong>Locations</strong>
              {new Set(albumPhotos.map((photo) => photo.location)).size}
            </span>
            <span>
              <strong>Photos</strong>
              {albumPhotos.length}
            </span>
          </div>
          <div className="album-related">
            <h4>Related images</h4>
            <div className="album-related-grid">
              {relatedPhotos.map((photo) => (
                <button key={photo.id} type="button" className="album-related-card" onClick={() => onOpenPhoto(photo)}>
                  <SmartImage src={photo.image} alt={photo.title} ratio="4/5" />
                  <span>{photo.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function AlbumCard({ album, onOpen }: { album: Album; onOpen?: () => void }) {
  return (
    <InteractiveCard className="album-card card album-clickable">
      <div onClick={onOpen} className="h-full w-full">
        <SmartImage src={album.cover} alt={album.title} ratio="4/5" />
        <span className="card-kicker">{album.year}</span>
        <h3>{album.title}</h3>
        <p>{album.description}</p>
        <div className="metadata">
          <span>{album.count} frames</span>
        </div>
        {onOpen && (
          <button className="text-link gallery-open" type="button" onClick={onOpen}>
            Open album
          </button>
        )}
      </div>
    </InteractiveCard>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <InteractiveCard className="card">
      <span className="card-kicker">{service.price}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </InteractiveCard>
  );
}

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <InteractiveCard className={plan.highlight ? 'pricing-card highlight' : 'pricing-card'}>
      <span className="card-kicker">{plan.highlight ? 'Most booked' : 'Plan'}</span>
      <h3>{plan.name}</h3>
      <strong>{plan.price}</strong>
      <ul>
        {plan.benefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>
    </InteractiveCard>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <InteractiveCard className="card testimonial-card">
      <div className="testimonial-header relative z-20">
        <SmartImage src={testimonial.avatar} alt={testimonial.name} ratio="1/1" />
        <div>
          <h3>{testimonial.name}</h3>
          <span>{testimonial.role}</span>
        </div>
      </div>
      <p className="relative z-20 mt-4">"{testimonial.quote}"</p>
    </InteractiveCard>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <InteractiveCard className="card blog-card">
      <SmartImage src={post.image} alt={post.title} ratio="16/9" />
      <div className="relative z-20 mt-4">
        <span className="card-kicker">{post.category}</span>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="blog-meta mt-2">
          <span className="muted">{post.date}</span>
        </div>
      </div>
    </InteractiveCard>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.question} className="faq-item">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function ResultBlock({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: unknown[];
  renderItem: (item: any) => ReactNode;
}) {
  return (
    <section>
      <h3 className="result-title">
        {title} <span>{items.length}</span>
      </h3>
      <div className="card-grid search-grid">{items.length > 0 ? items.map((item) => renderItem(item)) : <p className="muted">No matches found.</p>}</div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Footer({ site }: { site: SiteData }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>{site.brand.name}</h3>
          <p>{site.brand.tagline}</p>
        </div>
        <div>
          <span className="footer-label">Contact</span>
          <p>{site.footer.address}</p>
          <p>{site.footer.phone}</p>
          <p>{site.footer.email}</p>
        </div>
        <div>
          <span className="footer-label">Hours</span>
          <p>{site.footer.hours}</p>
          <div className="footer-links">
            <a href={site.brand.developer.github}>GitHub</a>
            <a href={site.brand.developer.linkedin}>LinkedIn</a>
            <a href={site.brand.developer.x}>X</a>
            <a href={site.brand.developer.instagram}>Instagram</a>
            <a href={site.brand.developer.portfolio}>Portfolio</a>
            <a href={`mailto:${site.brand.developer.email}`}>Email</a>
          </div>
        </div>
      </div>
      <div className="developer-credit">
        Designed &amp; Developed with <span aria-hidden="true">♥</span>{' '}
        <a href={site.brand.developer.url}>{site.brand.developer.name}</a>
      </div>
    </footer>
  );
}

function ClientStrip({ clients }: { clients: string[] }) {
  return (
    <div className="client-strip">
      {clients.map((client) => (
        <div key={client} className="client-chip">
          {client}
        </div>
      ))}
    </div>
  );
}

export default App;
