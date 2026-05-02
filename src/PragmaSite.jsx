import { useEffect, useMemo, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*  Palette + typography tokens                                               */
/* -------------------------------------------------------------------------- */

const FONT_STACKS = {
  fraunces: '"Fraunces", "Iowan Old Style", Georgia, serif',
  inter: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  playfair: '"Playfair Display", "Iowan Old Style", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

const PALETTES = [
  {
    id: 'atelier-warmth',
    name: 'Atelier Warmth',
    blurb: 'Editorial · warm · human-centered',
    fonts: { display: FONT_STACKS.fraunces, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
    light: {
      bg: '#F7F4EC', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
      textPrimary: '#141413', textSecondary: '#5C5852',
      brand: '#A8451F', accent: '#7C5E3A',
      success: '#3F6B2E', warning: '#B45309', error: '#B3261E',
      border: '#E5DFD2',
    },
    dark: {
      bg: '#1A1815', surface: '#24211D', surfaceRaised: '#2F2C27',
      textPrimary: '#F2EEE4', textSecondary: '#A8A097',
      brand: '#E89372', accent: '#C9A876',
      success: '#7FB069', warning: '#E6B656', error: '#F0857F',
      border: '#2F2C27',
    },
  },
  {
    id: 'mono-indigo',
    name: 'Atelier Mono · Indigo',
    blurb: 'Precise · design-forward · technical',
    fonts: { display: FONT_STACKS.inter, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
    light: {
      bg: '#FAFAF9', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
      textPrimary: '#0E0E0E', textSecondary: '#525252',
      brand: '#4F46E5', accent: '#0E0E0E',
      success: '#16A34A', warning: '#D97706', error: '#DC2626',
      border: '#E5E5E5',
    },
    dark: {
      bg: '#0A0A0A', surface: '#171717', surfaceRaised: '#262626',
      textPrimary: '#FAFAFA', textSecondary: '#A1A1AA',
      brand: '#818CF8', accent: '#FAFAFA',
      success: '#4ADE80', warning: '#FBBF24', error: '#F87171',
      border: '#27272A',
    },
  },
  {
    id: 'forest-atelier',
    name: 'Forest Atelier',
    blurb: 'Sophisticated · premium · established',
    fonts: { display: FONT_STACKS.fraunces, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
    light: {
      bg: '#F8F6F1', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
      textPrimary: '#1A1F1B', textSecondary: '#586057',
      brand: '#1F4D3B', accent: '#8C7A5C',
      success: '#2E7D5B', warning: '#B45309', error: '#B91C1C',
      border: '#E5E0D5',
    },
    dark: {
      bg: '#121815', surface: '#1B2520', surfaceRaised: '#243029',
      textPrimary: '#ECE9DF', textSecondary: '#9CA59B',
      brand: '#5DA688', accent: '#C9B687',
      success: '#7FB069', warning: '#E6B656', error: '#F0857F',
      border: '#2A332D',
    },
  },
  {
    id: 'graphite-signal',
    name: 'Graphite & Signal',
    blurb: 'Technical · decisive · opinionated',
    fonts: { display: FONT_STACKS.inter, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
    light: {
      bg: '#F5F5F4', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
      textPrimary: '#1C1917', textSecondary: '#57534E',
      brand: '#18181B', accent: '#DB2777',
      success: '#059669', warning: '#D97706', error: '#DC2626',
      border: '#E4E4E7',
    },
    dark: {
      bg: '#0C0A09', surface: '#1C1917', surfaceRaised: '#292524',
      textPrimary: '#FAFAF9', textSecondary: '#A8A29E',
      brand: '#FAFAF9', accent: '#F472B6',
      success: '#34D399', warning: '#FBBF24', error: '#F87171',
      border: '#292524',
    },
  },
  {
    id: 'heritage-claret',
    name: 'Heritage Claret',
    blurb: 'Confident · editorial · literary',
    fonts: { display: FONT_STACKS.playfair, body: FONT_STACKS.inter, mono: FONT_STACKS.mono },
    light: {
      bg: '#F4EFEA', surface: '#FFFFFF', surfaceRaised: '#FFFFFF',
      textPrimary: '#1A1414', textSecondary: '#5C5050',
      brand: '#6B1F2E', accent: '#B8895C',
      success: '#3F6B2E', warning: '#B8762E', error: '#A11D1D',
      border: '#E5DCD2',
    },
    dark: {
      bg: '#1A1212', surface: '#251A1A', surfaceRaised: '#2E2424',
      textPrimary: '#F2EBE3', textSecondary: '#A89B91',
      brand: '#C97A88', accent: '#D4B58A',
      success: '#7FB069', warning: '#E6B656', error: '#F08585',
      border: '#2E2424',
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const NAV = [
  { label: 'Work', href: '#work' },
  { label: 'Approach', href: '#approach' },
  { label: 'Team', href: '#team' },
  { label: 'Writing', href: '#writing' },
  { label: 'Contact', href: '#contact' },
];

const APPROACH = [
  {
    n: '01',
    title: 'Listen',
    body: 'We start in your office, not ours. Two weeks, maybe three. We sit with the people who feel the problem every day — not just the ones who can describe it on a slide.',
  },
  {
    n: '02',
    title: 'Diagnose',
    body: 'We separate the system you have from the system you think you have. Then we write down — in plain language — what is actually broken, what to leave alone, and what would compound if rebuilt.',
  },
  {
    n: '03',
    title: 'Build',
    body: 'A small senior team ships in tight cycles. No subcontractors, no offshore handoffs. We work in your repo, on your stack, and we leave behind code your team can own.',
  },
];

const WORK = [
  {
    client: 'Northwind Capital',
    tag: 'Platform engineering',
    problem: 'A trading desk running on a fragile patchwork of overnight Excel jobs.',
    outcome: 'A real-time settlement platform now clears $4.2B daily without a single manual touch.',
    span: 'wide',
  },
  {
    client: 'Halden Health',
    tag: 'AI integration',
    problem: 'Clinicians spending more time on documentation than with patients.',
    outcome: 'Ambient transcription cut chart time by 41% across 312 providers.',
    span: 'narrow',
  },
  {
    client: 'Meridian Logistics',
    tag: 'Legacy modernization',
    problem: 'A 19-year-old dispatch system written in three abandoned languages.',
    outcome: 'Strangler-fig migration completed in eleven months, zero unplanned downtime.',
    span: 'narrow',
  },
  {
    client: 'Kestrel Robotics',
    tag: 'Internal tools',
    problem: 'Hardware engineers blocked by a weekly bottleneck of release approvals.',
    outcome: 'A bespoke release console reduced approval lead time from 5 days to 90 minutes.',
    span: 'wide',
  },
  {
    client: 'Atria Labs',
    tag: 'Technical due diligence',
    problem: 'A pre-acquisition target whose engineering claims needed independent scrutiny.',
    outcome: 'A 60-page assessment that reshaped a $180M term sheet — twice.',
    span: 'narrow',
  },
  {
    client: 'Olmstead & Pike',
    tag: 'Bespoke platforms',
    problem: 'A century-old practice without a modern way to assemble client deliverables.',
    outcome: 'A document system tuned to their craft, now used on every new engagement.',
    span: 'narrow',
  },
];

const SERVICES = [
  {
    n: '01',
    title: 'Bespoke platforms',
    body: 'Software built around your workflow, not the other way round. We design, ship, and document systems your team actually wants to use.',
  },
  {
    n: '02',
    title: 'Legacy modernization',
    body: 'We take the systems you cannot turn off and rebuild them piece by piece — without the rewrite-and-pray that usually ends careers.',
  },
  {
    n: '03',
    title: 'AI & data systems',
    body: 'Practical machine learning where it earns its keep. We are skeptical by default, which is why our deployments tend to stay deployed.',
  },
  {
    n: '04',
    title: 'Technical due diligence',
    body: 'Independent reads on engineering quality for investors and acquirers. Plain English, defensible findings, no theatre.',
  },
];

const TEAM = [
  {
    initials: 'EM',
    name: 'Elena Marchetti',
    role: 'Principal · Platform engineering',
    bio: 'Fifteen years building systems that have to stay up. Previously at Stripe and the FT.',
  },
  {
    initials: 'SK',
    name: 'Soren Kelleher',
    role: 'Principal · AI & data systems',
    bio: 'Stanford ML, then a decade of putting models into production for healthcare and capital markets.',
  },
  {
    initials: 'AO',
    name: 'Adaeze Okonkwo',
    role: 'Principal · Design & systems',
    bio: 'Designs the seam between people and software. Formerly Stripe Design and IDEO.',
  },
  {
    initials: 'JL',
    name: 'Jonas Lindqvist',
    role: 'Principal · Diligence',
    bio: 'Twenty years running engineering teams. Now reads codebases for a living.',
  },
];

const WRITING = [
  {
    date: 'April 2026',
    title: 'The case against the rewrite',
    excerpt: 'A rewrite is almost always a refusal to understand the system you already have.',
  },
  {
    date: 'March 2026',
    title: 'On opinionated consultancies',
    excerpt: 'When a consultancy stops having opinions, you have hired a body shop wearing a suit.',
  },
  {
    date: 'February 2026',
    title: 'Diligence is not a checklist',
    excerpt: 'The interesting findings live in the gap between what the team says and what the repo says.',
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function applyTokensToRoot(palette, mode) {
  const tokens = palette[mode];
  const root = document.documentElement;
  root.style.setProperty('--bg', tokens.bg);
  root.style.setProperty('--surface', tokens.surface);
  root.style.setProperty('--surface-raised', tokens.surfaceRaised);
  root.style.setProperty('--text-primary', tokens.textPrimary);
  root.style.setProperty('--text-secondary', tokens.textSecondary);
  root.style.setProperty('--brand', tokens.brand);
  root.style.setProperty('--accent', tokens.accent);
  root.style.setProperty('--success', tokens.success);
  root.style.setProperty('--warning', tokens.warning);
  root.style.setProperty('--error', tokens.error);
  root.style.setProperty('--border', tokens.border);
  root.style.setProperty('--font-display', palette.fonts.display);
  root.style.setProperty('--font-body', palette.fonts.body);
  root.style.setProperty('--font-mono', palette.fonts.mono);
  root.style.colorScheme = mode;
}

function previewTokens(palette, mode) {
  const t = palette[mode];
  return { bg: t.bg, brand: t.brand, accent: t.accent, text: t.textPrimary, border: t.border };
}

/* -------------------------------------------------------------------------- */
/*  Inline icons                                                              */
/* -------------------------------------------------------------------------- */

const Sun = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const Moon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Check = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRight = (props) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Wordmark                                                                  */
/* -------------------------------------------------------------------------- */

function Wordmark({ small = false }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        letterSpacing: small ? '0.06em' : '0.04em',
        fontSize: small ? '0.95rem' : '1.15rem',
        color: 'var(--text-primary)',
      }}
    >
      Pragma
      <span style={{ color: 'var(--brand)' }}>.</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function PragmaSite() {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [mode, setMode] = useState('light');
  const userOverrodeMode = useRef(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const palette = PALETTES[paletteIndex];

  // Inject Google Fonts once.
  useEffect(() => {
    const id = 'pragma-google-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?' +
      [
        'family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700',
        'family=Inter:wght@300;400;500;600;700',
        'family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500',
        'family=JetBrains+Mono:wght@400;500',
      ].join('&') +
      '&display=swap';
    document.head.appendChild(link);
  }, []);

  // Initial mode from prefers-color-scheme + subscribe to changes.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setMode(mq.matches ? 'dark' : 'light');
    const onChange = (e) => {
      if (!userOverrodeMode.current) setMode(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Apply tokens whenever palette or mode changes.
  useEffect(() => {
    applyTokensToRoot(palette, mode);
  }, [palette, mode]);

  const toggleMode = () => {
    userOverrodeMode.current = true;
    setMode((m) => (m === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        transition: 'background-color 280ms ease, color 280ms ease',
      }}
    >
      <ScopedStyles />
      <Header mode={mode} onToggleMode={toggleMode} />
      <main>
        <Hero />
        <Approach />
        <SelectedWork />
        <Services />
        <Team />
        <Writing />
        <Contact />
      </main>
      <Footer />
      <PaletteSwitcher
        palettes={PALETTES}
        activeIndex={paletteIndex}
        mode={mode}
        open={paletteOpen}
        onToggle={() => setPaletteOpen((v) => !v)}
        onSelect={(i) => setPaletteIndex(i)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scoped styles                                                             */
/* -------------------------------------------------------------------------- */

function ScopedStyles() {
  return (
    <style>{`
      .display { font-family: var(--font-display); }
      .mono { font-family: var(--font-mono); }
      .eyebrow {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .rule {
        height: 1px;
        background: var(--border);
        width: 100%;
      }
      .surface {
        background: var(--surface);
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        transition: transform 250ms ease, border-color 250ms ease, background-color 280ms ease;
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: var(--brand);
      }
      .link {
        color: var(--text-primary);
        text-decoration: none;
        transition: color 200ms ease;
      }
      .link:hover { color: var(--brand); }
      .link-accent {
        color: var(--brand);
        text-decoration: none;
        border-bottom: 1px solid color-mix(in srgb, var(--brand) 35%, transparent);
        transition: border-color 200ms ease;
      }
      .link-accent:hover {
        border-bottom-color: var(--brand);
      }
      .btn-primary {
        background: var(--brand);
        color: var(--surface);
        font-family: var(--font-body);
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.02em;
        padding: 14px 22px;
        border: 1px solid var(--brand);
        display: inline-flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        transition: transform 200ms ease, opacity 200ms ease;
      }
      .btn-primary:hover { transform: translateY(-1px); opacity: 0.92; }
      .btn-ghost {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border);
        font-family: var(--font-body);
        font-weight: 500;
        font-size: 13px;
        padding: 10px 14px;
        cursor: pointer;
        transition: border-color 200ms ease, color 200ms ease;
      }
      .btn-ghost:hover { border-color: var(--brand); color: var(--brand); }
      .input {
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--border);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 16px;
        padding: 14px 0;
        width: 100%;
        outline: none;
        transition: border-color 200ms ease;
      }
      .input:focus { border-bottom-color: var(--brand); }
      .input::placeholder { color: var(--text-secondary); opacity: 0.7; }
      .display-xl {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2.75rem, 7.2vw, 6.25rem);
        line-height: 0.98;
        letter-spacing: -0.02em;
      }
      .display-l {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(2rem, 4.4vw, 3.5rem);
        line-height: 1.04;
        letter-spacing: -0.015em;
      }
      .display-m {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.5rem, 2.6vw, 2.1rem);
        line-height: 1.1;
        letter-spacing: -0.01em;
      }
      .numeral {
        font-family: var(--font-display);
        font-weight: 300;
        font-size: clamp(2.5rem, 6vw, 5rem);
        line-height: 1;
        color: var(--text-secondary);
        opacity: 0.55;
        letter-spacing: -0.02em;
      }
      .tag {
        font-family: var(--font-mono);
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--text-secondary);
        border: 1px solid var(--border);
        padding: 5px 9px;
        display: inline-block;
        border-radius: 999px;
      }
      .secondary { color: var(--text-secondary); }
      .reveal {
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 700ms ease, transform 700ms ease;
      }
      .reveal.in {
        opacity: 1;
        transform: none;
      }
      .nav-link {
        font-size: 14px;
        color: var(--text-primary);
        text-decoration: none;
        position: relative;
      }
      .nav-link:hover { color: var(--brand); }
      @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; animation: none !important; }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reveal-on-scroll wrapper                                                   */
/* -------------------------------------------------------------------------- */

function Reveal({ children, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function Header({ mode, onToggleMode }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'color-mix(in srgb, var(--bg) 86%, transparent)',
        backdropFilter: 'saturate(140%) blur(8px)',
        WebkitBackdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#top" className="link" aria-label="Pragma — home">
            <Wordmark />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="nav-link">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMode}
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                width: 36,
                height: 36,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 999,
                transition: 'border-color 200ms ease, color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand)';
                e.currentTarget.style.color = 'var(--brand)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              {mode === 'dark' ? <Sun /> : <Moon />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="top" className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 pt-20 md:pt-28 lg:pt-36 pb-24 md:pb-32 lg:pb-40">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-2">
          <Reveal>
            <div className="eyebrow">Index · 01</div>
            <div className="mt-2 secondary text-sm">Pragma — Studio note №14</div>
          </Reveal>
        </div>
        <div className="col-span-12 md:col-span-10">
          <Reveal>
            <h1 className="display-xl">
              Tailor-made technology,
              <br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--brand)' }}>deeply</span>{' '}
              understood.
            </h1>
          </Reveal>
          <Reveal>
            <p className="mt-10 max-w-[44ch] text-lg md:text-xl secondary" style={{ lineHeight: 1.5 }}>
              We are a small senior team that goes to the root of the problem before writing a line of code — then builds software your team can hold in its hands and own outright.
            </p>
          </Reveal>
          <Reveal>
            <div className="mt-12 flex items-center gap-4 flex-wrap">
              <a href="#contact" className="btn-primary">
                Start a conversation <ArrowRight />
              </a>
              <a href="#approach" className="link" style={{ fontSize: 14, letterSpacing: '0.02em' }}>
                Read our approach →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Approach                                                                  */
/* -------------------------------------------------------------------------- */

function Approach() {
  return (
    <section id="approach" className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-24 md:py-32 lg:py-40">
      <div className="grid grid-cols-12 gap-6 mb-16 md:mb-24">
        <div className="col-span-12 md:col-span-2">
          <div className="eyebrow">02 · Approach</div>
        </div>
        <div className="col-span-12 md:col-span-10">
          <Reveal>
            <h2 className="display-l max-w-[20ch]">
              We do three things,<br />in sequence, with care.
            </h2>
          </Reveal>
        </div>
      </div>

      <div className="flex flex-col">
        {APPROACH.map((step, i) => (
          <Reveal key={step.n}>
            <div
              className="grid grid-cols-12 gap-6 py-10 md:py-14"
              style={{ borderTop: i === 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)' }}
            >
              <div className="col-span-12 md:col-span-2">
                <div className="numeral">{step.n}</div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <h3 className="display-m">{step.title}</h3>
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="text-base md:text-[17px] secondary" style={{ lineHeight: 1.6 }}>
                  {step.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Selected Work                                                             */
/* -------------------------------------------------------------------------- */

function SelectedWork() {
  return (
    <section id="work" className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-24 md:py-32 lg:py-40">
      <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
        <div className="col-span-12 md:col-span-2">
          <div className="eyebrow">03 · Selected work</div>
        </div>
        <div className="col-span-12 md:col-span-7">
          <Reveal>
            <h2 className="display-l max-w-[24ch]">A few engagements we are allowed to talk about.</h2>
          </Reveal>
        </div>
        <div className="col-span-12 md:col-span-3 md:text-right">
          <Reveal>
            <p className="secondary text-sm" style={{ lineHeight: 1.6 }}>
              Names changed where confidentiality required. Outcomes verified with the client.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 md:gap-6">
        {WORK.map((w, i) => (
          <Reveal
            key={w.client}
            className={
              w.span === 'wide'
                ? 'col-span-12 md:col-span-8'
                : 'col-span-12 md:col-span-4'
            }
          >
            <a href="#contact" className="card block p-7 md:p-9 h-full group">
              <div className="flex items-center justify-between mb-10">
                <span className="tag">{w.tag}</span>
                <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="display-m mb-5">{w.client}</h3>
              <p className="secondary text-sm md:text-[15px]" style={{ lineHeight: 1.55 }}>
                <span style={{ color: 'var(--text-primary)' }}>Problem.</span> {w.problem}
              </p>
              <p className="secondary text-sm md:text-[15px] mt-2.5" style={{ lineHeight: 1.55 }}>
                <span style={{ color: 'var(--text-primary)' }}>Outcome.</span> {w.outcome}
              </p>
              <div
                className="mt-8 flex items-center gap-2 eyebrow"
                style={{ color: 'var(--brand)' }}
              >
                Read the case <ArrowRight />
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Services                                                                  */
/* -------------------------------------------------------------------------- */

function Services() {
  return (
    <section
      id="services"
      className="py-24 md:py-32 lg:py-40"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-2">
            <div className="eyebrow">04 · Services</div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <Reveal>
              <h2 className="display-l max-w-[22ch]">
                Four practices, run by the same small team that does the work.
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-x-6 gap-y-12 md:gap-y-16">
          {SERVICES.map((s) => (
            <Reveal key={s.n} className="col-span-12 md:col-span-6">
              <div className="flex items-baseline gap-5 mb-4">
                <span className="numeral" style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>
                  {s.n}
                </span>
                <h3 className="display-m">{s.title}</h3>
              </div>
              <p className="secondary text-base md:text-[17px] max-w-[44ch]" style={{ lineHeight: 1.6 }}>
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Team                                                                      */
/* -------------------------------------------------------------------------- */

function Team() {
  return (
    <section id="team" className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-24 md:py-32 lg:py-40">
      <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
        <div className="col-span-12 md:col-span-2">
          <div className="eyebrow">05 · Team</div>
        </div>
        <div className="col-span-12 md:col-span-10">
          <Reveal>
            <h2 className="display-l max-w-[22ch]">
              The people you hire are the people who do the work.
            </h2>
          </Reveal>
          <Reveal>
            <p className="mt-6 max-w-[52ch] secondary" style={{ lineHeight: 1.6 }}>
              No subcontractors. No bench warmers. The principal you meet in the first week is the principal who writes the diagnosis and ships the build.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {TEAM.map((p) => (
          <Reveal key={p.name} className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="card p-7 h-full">
              <div
                aria-hidden
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 18,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                  marginBottom: 28,
                }}
              >
                {p.initials}
              </div>
              <h3 className="display-m" style={{ fontSize: '1.35rem' }}>
                {p.name}
              </h3>
              <div className="eyebrow mt-2">{p.role}</div>
              <p className="secondary text-sm mt-5" style={{ lineHeight: 1.55 }}>
                {p.bio}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Writing                                                                   */
/* -------------------------------------------------------------------------- */

function Writing() {
  return (
    <section
      id="writing"
      className="py-24 md:py-32 lg:py-40"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-2">
            <div className="eyebrow">06 · Writing</div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <Reveal>
              <h2 className="display-l max-w-[22ch]">Notes from the studio.</h2>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            <Reveal>
              <a href="#" className="link-accent text-sm">
                All writing
              </a>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-col">
          {WRITING.map((post, i) => (
            <Reveal key={post.title}>
              <a
                href="#"
                className="grid grid-cols-12 gap-6 py-10 md:py-12 group"
                style={{
                  borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 250ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--brand) 4%, transparent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="col-span-12 md:col-span-2 eyebrow flex items-start">{post.date}</div>
                <div className="col-span-12 md:col-span-7">
                  <h3 className="display-m" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)' }}>
                    {post.title}
                  </h3>
                  <p className="mt-3 secondary text-sm md:text-base max-w-[55ch]" style={{ lineHeight: 1.55 }}>
                    {post.excerpt}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-3 md:text-right secondary text-sm self-end mt-2 md:mt-0">
                  <span style={{ color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    Read <ArrowRight />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                   */
/* -------------------------------------------------------------------------- */

function Contact() {
  const onSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <section
      id="contact"
      className="py-24 md:py-32 lg:py-40"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-2">
            <div className="eyebrow">07 · Contact</div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <Reveal>
              <h2 className="display-xl max-w-[18ch]">
                Tell us<br />what you are<br />
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--brand)' }}>working on.</span>
              </h2>
            </Reveal>
            <Reveal>
              <p className="mt-10 max-w-[52ch] secondary text-lg" style={{ lineHeight: 1.55 }}>
                A first conversation with us is unhurried. Forty-five minutes, no slides, no deck.{' '}
                <a href="mailto:hello@pragma.studio" className="link-accent">
                  hello@pragma.studio
                </a>
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2 hidden md:block" />
          <div className="col-span-12 md:col-span-10">
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-x-6 gap-y-2">
              <div className="col-span-12 md:col-span-6">
                <label htmlFor="f-name" className="eyebrow">Name</label>
                <input id="f-name" className="input" type="text" placeholder="Your name" required />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label htmlFor="f-company" className="eyebrow">Company</label>
                <input id="f-company" className="input" type="text" placeholder="Where you work" />
              </div>
              <div className="col-span-12 md:col-span-6 mt-6">
                <label htmlFor="f-email" className="eyebrow">Email</label>
                <input id="f-email" className="input" type="email" placeholder="you@company.com" required />
              </div>
              <div className="col-span-12 md:col-span-6 mt-6">
                <label htmlFor="f-budget" className="eyebrow">Engagement type</label>
                <input id="f-budget" className="input" type="text" placeholder="Diagnostic, build, diligence…" />
              </div>
              <div className="col-span-12 mt-6">
                <label htmlFor="f-brief" className="eyebrow">What you are working on</label>
                <textarea
                  id="f-brief"
                  className="input"
                  rows={4}
                  placeholder="A few sentences is plenty."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="col-span-12 mt-10">
                <button type="submit" className="btn-primary">
                  Send the brief <ArrowRight />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-4">
            <Wordmark small />
            <p className="mt-4 secondary text-sm max-w-[36ch]" style={{ lineHeight: 1.55 }}>
              A small consultancy that builds software the way good things have always been built — slowly, with care, by the people who will sign their name to it.
            </p>
          </div>
          <div className="col-span-6 md:col-span-2 md:col-start-7">
            <div className="eyebrow mb-4">Studio</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#approach" className="link">Approach</a></li>
              <li><a href="#work" className="link">Work</a></li>
              <li><a href="#team" className="link">Team</a></li>
              <li><a href="#writing" className="link">Writing</a></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="eyebrow mb-4">Elsewhere</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="link">LinkedIn</a></li>
              <li><a href="#" className="link">Are.na</a></li>
              <li><a href="#" className="link">RSS</a></li>
            </ul>
          </div>
          <div className="col-span-12 md:col-span-2">
            <div className="eyebrow mb-4">Contact</div>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@pragma.studio" className="link">hello@pragma.studio</a></li>
              <li className="secondary">London · New York</li>
            </ul>
          </div>
        </div>
        <div className="rule mt-12" />
        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 secondary text-xs">
          <div>© 2026 Pragma. All work bespoke.</div>
          <div className="mono" style={{ letterSpacing: '0.08em' }}>
            v0.1 · DESIGN RESEARCH
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating palette switcher                                                 */
/* -------------------------------------------------------------------------- */

function PaletteSwitcher({ palettes, activeIndex, mode, open, onToggle, onSelect }) {
  const active = palettes[activeIndex];
  const activePreview = useMemo(() => previewTokens(active, mode), [active, mode]);

  return (
    <div
      style={{
        position: 'fixed',
        right: 'clamp(16px, 2vw, 28px)',
        bottom: 'clamp(16px, 2vw, 28px)',
        zIndex: 60,
        fontFamily: 'var(--font-body)',
      }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Palette switcher"
          style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 14,
            padding: 14,
            width: 320,
            marginBottom: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            transition: 'background-color 280ms ease, color 280ms ease, border-color 280ms ease',
          }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="eyebrow">Palettes · 5</div>
            <div className="eyebrow" style={{ color: 'var(--brand)' }}>{mode}</div>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {palettes.map((p, i) => {
              const preview = previewTokens(p, mode);
              const isActive = i === activeIndex;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 10px',
                      background: isActive
                        ? 'color-mix(in srgb, var(--brand) 8%, transparent)'
                        : 'transparent',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'background-color 200ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = 'color-mix(in srgb, var(--text-primary) 5%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Swatches preview={preview} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          marginTop: 2,
                        }}
                      >
                        {p.blurb}
                      </span>
                    </span>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        background: isActive ? 'var(--brand)' : 'transparent',
                        color: isActive ? 'var(--surface)' : 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-hidden
                    >
                      {isActive && <Check />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            className="rule"
            style={{ background: 'var(--border)', margin: '10px 0' }}
          />
          <div className="px-1 pt-1 pb-0 secondary" style={{ fontSize: 11, lineHeight: 1.5 }}>
            Choices are session-only. Hand the winning tokens to your developer.
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? 'Close palette switcher' : 'Open palette switcher'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px 10px 12px',
          background: 'var(--surface-raised)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 500,
          transition: 'background-color 280ms ease, color 280ms ease, border-color 280ms ease',
        }}
      >
        <Swatches preview={activePreview} compact />
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Palette
          </span>
          <span style={{ fontSize: 13 }}>{active.name}</span>
        </span>
      </button>
    </div>
  );
}

function Swatches({ preview, compact = false }) {
  const size = compact ? 14 : 18;
  const stroke = '1px solid color-mix(in srgb, var(--text-primary) 14%, transparent)';
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--text-primary) 8%, transparent)',
      }}
    >
      <span style={{ width: size, height: size, background: preview.bg, display: 'inline-block' }} />
      <span style={{ width: size, height: size, background: preview.brand, display: 'inline-block' }} />
      <span style={{ width: size, height: size, background: preview.accent, display: 'inline-block' }} />
    </span>
  );
}
