import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PALETTES } from '../PragmaSite.jsx';
import { insertVote } from '../lib/supabase.js';
import { getTheme, useColorScheme } from '../lib/useColorScheme.js';

const PAGE_FONT = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO_FONT = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

const RANKS_STORAGE_KEY = 'pragma-design-vote-ranks-v1';

function isValidRanks(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const validIds = new Set(PALETTES.map((p) => p.id));
  const seen = new Set();
  for (const [id, rank] of Object.entries(value)) {
    if (!validIds.has(id)) return false;
    if (!Number.isInteger(rank) || rank < 1 || rank > PALETTES.length) return false;
    if (seen.has(rank)) return false;
    seen.add(rank);
  }
  return true;
}

function readStoredRanks() {
  try {
    const raw = localStorage.getItem(RANKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return isValidRanks(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export default function Vote() {
  const navigate = useNavigate();
  const scheme = useColorScheme();
  const t = getTheme(scheme);
  const [ranks, setRanks] = useState(readStoredRanks);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (Object.keys(ranks).length === 0) {
        localStorage.removeItem(RANKS_STORAGE_KEY);
      } else {
        localStorage.setItem(RANKS_STORAGE_KEY, JSON.stringify(ranks));
      }
    } catch {}
  }, [ranks]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== RANKS_STORAGE_KEY) return;
      if (e.newValue == null) {
        setRanks({});
        return;
      }
      try {
        const parsed = JSON.parse(e.newValue);
        if (isValidRanks(parsed)) setRanks(parsed);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const allAssigned = useMemo(() => {
    const values = Object.values(ranks);
    return (
      Object.keys(ranks).length === PALETTES.length &&
      new Set(values).size === PALETTES.length &&
      values.every((v) => v >= 1 && v <= PALETTES.length)
    );
  }, [ranks]);

  useEffect(() => {
    const id = 'pragma-google-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }, []);

  function setRank(paletteId, rank) {
    setRanks((prev) => {
      const next = { ...prev };
      const previousHolder = Object.keys(next).find((id) => next[id] === rank && id !== paletteId);
      if (previousHolder) {
        if (next[paletteId]) {
          next[previousHolder] = next[paletteId];
        } else {
          delete next[previousHolder];
        }
      }
      next[paletteId] = rank;
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!allAssigned || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await insertVote(ranks);
      try { localStorage.removeItem(RANKS_STORAGE_KEY); } catch {}
      navigate('/thanks');
    } catch (err) {
      console.error(err);
      setError('Hubo un error. Intenta de nuevo.');
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.textPrimary,
        fontFamily: PAGE_FONT,
        colorScheme: scheme,
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '40px 20px 80px',
        }}
      >
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: t.textSecondary,
            marginBottom: 12,
          }}
        >
          Pragma · Ranking
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.55rem, 4vw, 2rem)',
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: '-0.015em',
            fontWeight: 600,
          }}
        >
          Ayúdanos a elegir el look de Pragma.
        </h1>
        <p
          style={{
            marginTop: 12,
            color: t.textSecondary,
            lineHeight: 1.55,
            fontSize: 15,
            maxWidth: '58ch',
          }}
        >
          Haz clic en cada diseño para abrirlo y ordénalos del 1 al 3. Cada posición se usa una sola vez.
        </p>

        <div
          style={{
            marginTop: 20,
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: t.textMuted,
          }}
        >
          1 = favorita · 3 = menos preferida
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PALETTES.map((p) => (
              <DesignCard
                key={p.id}
                palette={p}
                rank={ranks[p.id]}
                onRank={(rank) => setRank(p.id, rank)}
                t={t}
              />
            ))}
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 20,
                padding: '10px 14px',
                background: t.errorBg,
                border: `1px solid ${t.errorBorder}`,
                color: t.errorText,
                borderRadius: 10,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={!allAssigned || submitting}
              style={{
                appearance: 'none',
                border: `1px solid ${!allAssigned || submitting ? t.submitDisabled : t.submitBorder}`,
                background: !allAssigned || submitting ? t.submitDisabled : t.submitBg,
                color: !allAssigned || submitting ? t.submitDisabledText : t.submitText,
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.02em',
                cursor: !allAssigned || submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease',
              }}
            >
              {submitting ? 'Enviando…' : 'Enviar →'}
            </button>
            {!allAssigned && (
              <span style={{ fontSize: 13, color: t.textMuted }}>
                Asigna las tres posiciones para enviar.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function DesignCard({ palette, rank, onRank, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${hovered ? t.textMuted : t.border}`,
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
        transition: 'border-color 150ms ease',
      }}
    >
      <a
        href={`/preview/${palette.id}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Ver diseño ${palette.name} en una pestaña nueva`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          flex: '1 1 200px',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          color: t.textPrimary,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        <Swatches tokens={palette.light} t={t} />
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            lineHeight: 1.25,
          }}
        >
          {palette.name}
        </div>
      </a>
      <RankSlider rank={rank} onChange={onRank} t={t} />
    </div>
  );
}

function RankSlider({ rank, onChange, t }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(null); // transient pointer X (relative to track left), null when not dragging

  const TRACK_HEIGHT = 36;
  const TRACK_WIDTH = 132;
  const PAD = 3;
  const ZONE_WIDTH = (TRACK_WIDTH - PAD * 2) / 3;

  function rankFromX(x) {
    const inner = Math.max(0, Math.min(TRACK_WIDTH - PAD * 2, x - PAD));
    const idx = Math.floor(inner / ZONE_WIDTH);
    return Math.max(1, Math.min(3, idx + 1));
  }

  function pointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setDragX(x);
    const next = rankFromX(x);
    if (next !== rank) onChange(next);
  }

  function pointerMove(e) {
    if (!dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDragX(x);
    const next = rankFromX(x);
    if (next !== rank) onChange(next);
  }

  function endDrag(e) {
    if (!dragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setDragging(false);
    setDragX(null);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(1, (rank ?? 2) - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(3, (rank ?? 0) + 1));
    } else if (e.key === 'Home' || e.key === '1') {
      e.preventDefault();
      onChange(1);
    } else if (e.key === 'End' || e.key === '3') {
      e.preventDefault();
      onChange(3);
    } else if (e.key === '2') {
      e.preventDefault();
      onChange(2);
    }
  }

  // Thumb position. While dragging, follow pointer; otherwise, snap to rank zone.
  let thumbLeft;
  if (rank == null && !dragging) {
    thumbLeft = null; // hidden
  } else if (dragging && dragX != null) {
    const minLeft = PAD;
    const maxLeft = TRACK_WIDTH - PAD - ZONE_WIDTH;
    thumbLeft = Math.max(minLeft, Math.min(maxLeft, dragX - ZONE_WIDTH / 2));
  } else {
    thumbLeft = PAD + (rank - 1) * ZONE_WIDTH;
  }

  const showThumb = thumbLeft != null;

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label="Posición de este diseño"
      tabIndex={0}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      style={{
        position: 'relative',
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        flex: '0 0 auto',
        background: t.rankIdleBg,
        border: `1px solid ${t.rankIdleBorder}`,
        borderRadius: 999,
        cursor: dragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 3px ${t.rankSelectedBg}33`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {showThumb && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: PAD - 1,
            left: 0,
            width: ZONE_WIDTH,
            height: TRACK_HEIGHT - PAD * 2,
            transform: `translateX(${thumbLeft}px)`,
            background: t.rankSelectedBg,
            borderRadius: 999,
            boxShadow: dragging
              ? '0 2px 6px rgba(0,0,0,0.18)'
              : '0 1px 2px rgba(0,0,0,0.14)',
            transition: dragging
              ? 'box-shadow 120ms ease'
              : 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 120ms ease',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${PAD}px`,
          pointerEvents: 'none',
        }}
      >
        {[1, 2, 3].map((r) => {
          const isOnThumb = rank === r;
          return (
            <span
              key={r}
              role="radio"
              aria-checked={isOnThumb}
              aria-label={`Posición ${r}`}
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: MONO_FONT,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
                color: isOnThumb ? t.rankSelectedText : t.textMuted,
                transition: 'color 180ms ease',
              }}
            >
              {r}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Swatches({ tokens, t }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: `inset 0 0 0 1px ${t.swatchInset}`,
        flex: '0 0 auto',
      }}
    >
      <span style={{ width: 16, height: 32, background: tokens.bg, display: 'inline-block' }} />
      <span style={{ width: 16, height: 32, background: tokens.brand, display: 'inline-block' }} />
      <span style={{ width: 16, height: 32, background: tokens.accent, display: 'inline-block' }} />
    </span>
  );
}
