import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PALETTES } from '../PragmaSite.jsx';
import { fetchVotes } from '../lib/supabase.js';
import { getTheme, useColorScheme } from '../lib/useColorScheme.js';

const PAGE_FONT = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
const MONO_FONT = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';
const UNLOCK_KEY = 'pragma:results:unlocked';

function paletteFill(p, scheme) {
  const variant = p[scheme] ?? p.light;
  return variant.brand;
}
function paletteInk(p, scheme) {
  const variant = p[scheme] ?? p.light;
  return variant.brandInk ?? variant.brand;
}
function paletteName(id) {
  const p = PALETTES.find((x) => x.id === id);
  return p ? p.name : id;
}
function shortName(id) {
  const map = {
    'mono-indigo': 'Mono Indigo',
    'forest-atelier': 'Forest Atelier',
    'graphite-signal': 'Graphite & Signal',
  };
  return map[id] ?? id;
}

function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return String(ts);
  }
}

function summarize(votes) {
  const ids = PALETTES.map((p) => p.id);
  const acc = {};
  for (const id of ids) {
    acc[id] = { count: 0, sumRank: 0, firstPlace: 0, points: 0, distribution: { 1: 0, 2: 0, 3: 0 } };
  }
  for (const v of votes) {
    const r = v.ranks ?? {};
    for (const id of ids) {
      const rank = Number(r[id]);
      if (!Number.isInteger(rank) || rank < 1 || rank > 3) continue;
      acc[id].count += 1;
      acc[id].sumRank += rank;
      acc[id].distribution[rank] += 1;
      if (rank === 1) acc[id].firstPlace += 1;
      acc[id].points += 4 - rank; // 1st=3pts, 2nd=2pts, 3rd=1pt
    }
  }
  for (const id of ids) {
    acc[id].avgRank = acc[id].count ? acc[id].sumRank / acc[id].count : 0;
  }
  return acc;
}

function darkPreferenceBreakdown(votes) {
  let dark = 0,
    light = 0,
    unknown = 0;
  for (const v of votes) {
    if (v.prefers_dark === true) dark += 1;
    else if (v.prefers_dark === false) light += 1;
    else unknown += 1;
  }
  return { dark, light, unknown };
}

function previewModeByPalette(votes) {
  const ids = PALETTES.map((p) => p.id);
  const acc = {};
  for (const id of ids) acc[id] = { light: 0, dark: 0, none: 0 };
  for (const v of votes) {
    const pm = v.preview_modes ?? {};
    for (const id of ids) {
      const mode = pm[id];
      if (mode === 'light') acc[id].light += 1;
      else if (mode === 'dark') acc[id].dark += 1;
      else acc[id].none += 1;
    }
  }
  return acc;
}

function cumulativeOverTime(votes) {
  const sorted = [...votes].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });
  let total = 0;
  return sorted.map((v) => {
    total += 1;
    return {
      ts: v.created_at ? new Date(v.created_at).getTime() : null,
      label: formatDate(v.created_at),
      total,
    };
  });
}

export default function Results() {
  const osScheme = useColorScheme();
  const [override, setOverride] = useState(null);
  const scheme = override ?? osScheme;
  const t = getTheme(scheme);

  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === '1';
    } catch {
      return false;
    }
  });

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

  function lock() {
    try { sessionStorage.removeItem(UNLOCK_KEY); } catch {}
    setUnlocked(false);
  }
  function unlock() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch {}
    setUnlocked(true);
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
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px' }}>
        <Header
          t={t}
          scheme={scheme}
          onToggleScheme={() => setOverride(scheme === 'dark' ? 'light' : 'dark')}
          unlocked={unlocked}
          onLock={lock}
        />
        {unlocked ? (
          <Dashboard t={t} scheme={scheme} />
        ) : (
          <Gate t={t} onUnlock={unlock} />
        )}
      </div>
    </div>
  );
}

function Header({ t, scheme, onToggleScheme, unlocked, onLock }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 28,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: t.textSecondary,
            marginBottom: 8,
          }}
        >
          Pragma · Resultados
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 3.2vw, 2.1rem)',
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: '-0.015em',
            fontWeight: 600,
          }}
        >
          Visualización del ranking
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: t.textSecondary,
            textDecoration: 'none',
            border: `1px solid ${t.border}`,
            borderRadius: 999,
            padding: '8px 14px',
            background: t.surface,
          }}
        >
          ← Volver
        </Link>
        <button
          type="button"
          onClick={onToggleScheme}
          aria-label="Cambiar tema"
          style={{
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: t.textPrimary,
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: MONO_FONT,
            letterSpacing: '0.05em',
          }}
        >
          {scheme === 'dark' ? '☀ claro' : '☾ oscuro'}
        </button>
        {unlocked && (
          <button
            type="button"
            onClick={onLock}
            style={{
              border: `1px solid ${t.border}`,
              background: t.surface,
              color: t.textSecondary,
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}

function Gate({ t, onUnlock }) {
  const expected = import.meta.env.VITE_RESULTS_PASSPHRASE ?? '';
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);

  function onSubmit(e) {
    e.preventDefault();
    if (!expected) {
      setError('VITE_RESULTS_PASSPHRASE no está configurada en el entorno.');
      return;
    }
    if (value === expected) {
      onUnlock();
    } else {
      setError('Contraseña incorrecta.');
    }
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '60px auto 0',
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: t.textSecondary,
          marginBottom: 8,
        }}
      >
        Acceso restringido
      </div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Ingresa la contraseña</h2>
      <p style={{ marginTop: 8, fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>
        Esta página muestra los resultados internos del ranking. Pídele la contraseña al equipo de
        Pragma.
      </p>
      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          placeholder="Contraseña"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px',
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            background: t.bg,
            color: t.textPrimary,
            fontSize: 14,
            fontFamily: MONO_FONT,
            outline: 'none',
          }}
        />
        {error && (
          <div
            role="alert"
            style={{
              marginTop: 10,
              padding: '8px 12px',
              background: t.errorBg,
              border: `1px solid ${t.errorBorder}`,
              color: t.errorText,
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            marginTop: 12,
            width: '100%',
            border: `1px solid ${t.submitBorder}`,
            background: t.submitBg,
            color: t.submitText,
            borderRadius: 999,
            padding: '10px 14px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Desbloquear
        </button>
      </form>
    </div>
  );
}

function Dashboard({ t, scheme }) {
  const [votes, setVotes] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchVotes()
      .then((rows) => {
        if (cancelled) return;
        setVotes(rows);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || 'Error desconocido al cargar los votos.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) {
    return (
      <div style={{ marginTop: 40, color: t.textSecondary, textAlign: 'center', fontSize: 14 }}>
        Cargando votos…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: `1px solid ${t.errorBorder}`,
          background: t.errorBg,
          color: t.errorText,
          borderRadius: 12,
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>No se pudieron cargar los votos.</div>
        <div style={{ marginBottom: 6 }}>{error}</div>
        <div style={{ color: t.textSecondary, fontSize: 12 }}>
          Pista: el rol <code>anon</code> necesita un policy <code>SELECT</code> sobre la tabla{' '}
          <code>votes</code> en Supabase. Revisa el README para el SQL exacto.
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          style={{
            marginTop: 12,
            border: `1px solid ${t.submitBorder}`,
            background: t.submitBg,
            color: t.submitText,
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!votes || votes.length === 0) {
    return (
      <div
        style={{
          marginTop: 60,
          textAlign: 'center',
          color: t.textSecondary,
          fontSize: 15,
        }}
      >
        No hay votos todavía.
      </div>
    );
  }

  return <DashboardContent votes={votes} t={t} scheme={scheme} />;
}

function DashboardContent({ votes, t, scheme }) {
  const summary = useMemo(() => summarize(votes), [votes]);
  const dark = useMemo(() => darkPreferenceBreakdown(votes), [votes]);
  const previews = useMemo(() => previewModeByPalette(votes), [votes]);
  const cumulative = useMemo(() => cumulativeOverTime(votes), [votes]);

  const ordered = useMemo(() => {
    return [...PALETTES].sort((a, b) => {
      const ar = summary[a.id]?.avgRank || Infinity;
      const br = summary[b.id]?.avgRank || Infinity;
      if (ar !== br) return ar - br;
      return (summary[b.id]?.count || 0) - (summary[a.id]?.count || 0);
    });
  }, [summary]);

  const winner = ordered[0];
  const totalVotes = votes.length;
  const darkPct = totalVotes ? Math.round((dark.dark / totalVotes) * 100) : 0;
  const latestVote = votes.reduce((max, v) => {
    if (!v.created_at) return max;
    const ts = new Date(v.created_at).getTime();
    return !max || ts > max ? ts : max;
  }, null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <KpiStrip
        t={t}
        items={[
          { label: 'Votos totales', value: String(totalVotes) },
          { label: 'Líder', value: shortName(winner.id), accent: paletteInk(winner, scheme) },
          { label: 'Modo oscuro (OS)', value: `${darkPct}%` },
          { label: 'Último voto', value: latestVote ? formatDate(latestVote) : '—', small: true },
        ]}
      />

      <Section
        t={t}
        title="Podio"
        subtitle="Orden por ranking promedio (menor = mejor)."
      >
        <Podium ordered={ordered} summary={summary} t={t} scheme={scheme} totalVotes={totalVotes} />
      </Section>

      <Section
        t={t}
        title="Ranking promedio"
        subtitle="Promedio de la posición asignada por cada votante. Más bajo = mejor."
      >
        <ChartFrame t={t} height={260}>
          <BarChart
            data={PALETTES.map((p) => ({
              name: shortName(p.id),
              avg: Number((summary[p.id]?.avgRank || 0).toFixed(2)),
              fill: paletteFill(p, scheme),
            }))}
            layout="vertical"
            margin={{ top: 10, right: 24, bottom: 10, left: 16 }}
          >
            <CartesianGrid stroke={t.borderSubtle} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 3]}
              ticks={[0, 1, 2, 3]}
              tick={{ fill: t.textSecondary, fontSize: 11 }}
              stroke={t.border}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: t.textPrimary, fontSize: 12 }}
              stroke={t.border}
              width={140}
            />
            <Tooltip
              cursor={{ fill: t.borderSubtle }}
              contentStyle={tooltipStyle(t)}
              itemStyle={{ color: t.textPrimary }}
              labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
              formatter={(v) => [v, 'Promedio']}
            />
            <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
              {PALETTES.map((p) => (
                <Cell key={p.id} fill={paletteFill(p, scheme)} />
              ))}
            </Bar>
          </BarChart>
        </ChartFrame>
      </Section>

      <Section
        t={t}
        title="Distribución de posiciones"
        subtitle="Cuántos votantes ubicaron cada paleta en cada posición."
      >
        <ChartFrame t={t} height={300}>
          <BarChart
            data={[1, 2, 3].map((rank) => {
              const row = { rank: `Posición ${rank}` };
              for (const p of PALETTES) {
                row[shortName(p.id)] = summary[p.id]?.distribution[rank] ?? 0;
              }
              return row;
            })}
            margin={{ top: 10, right: 16, bottom: 10, left: 8 }}
          >
            <CartesianGrid stroke={t.borderSubtle} vertical={false} />
            <XAxis dataKey="rank" tick={{ fill: t.textSecondary, fontSize: 12 }} stroke={t.border} />
            <YAxis allowDecimals={false} tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
            <Tooltip
              cursor={{ fill: t.borderSubtle }}
              contentStyle={tooltipStyle(t)}
              itemStyle={{ color: t.textPrimary }}
              labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
            {PALETTES.map((p) => (
              <Bar
                key={p.id}
                dataKey={shortName(p.id)}
                fill={paletteFill(p, scheme)}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartFrame>
      </Section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <Section
          t={t}
          title="Tasa de victoria"
          subtitle="% de votantes que asignó la posición 1 a cada paleta."
        >
          <ChartFrame t={t} height={260}>
            <PieChart>
              <Pie
                data={PALETTES.map((p) => ({
                  name: shortName(p.id),
                  value: summary[p.id]?.firstPlace ?? 0,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(props) =>
                  renderPieLabel(props, t, totalVotes ? `${Math.round((props.value / totalVotes) * 100)}%` : null)
                }
                labelLine={{ stroke: t.textMuted }}
              >
                {PALETTES.map((p) => (
                  <Cell key={p.id} fill={paletteFill(p, scheme)} stroke={t.surface} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle(t)}
                itemStyle={{ color: t.textPrimary }}
                labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
              />
            </PieChart>
          </ChartFrame>
        </Section>

        <Section
          t={t}
          title="Puntaje Borda"
          subtitle="3 puntos por 1ª · 2 puntos por 2ª · 1 punto por 3ª."
        >
          <ChartFrame t={t} height={260}>
            <BarChart
              data={PALETTES.map((p) => ({
                name: shortName(p.id),
                points: summary[p.id]?.points ?? 0,
              }))}
              margin={{ top: 10, right: 16, bottom: 10, left: 8 }}
            >
              <CartesianGrid stroke={t.borderSubtle} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
              <YAxis allowDecimals={false} tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
              <Tooltip
                cursor={{ fill: t.borderSubtle }}
                contentStyle={tooltipStyle(t)}
                itemStyle={{ color: t.textPrimary }}
                labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
                formatter={(v) => [v, 'Puntos']}
              />
              <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                {PALETTES.map((p) => (
                  <Cell key={p.id} fill={paletteFill(p, scheme)} />
                ))}
              </Bar>
            </BarChart>
          </ChartFrame>
        </Section>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <Section
          t={t}
          title="Preferencia de modo (SO)"
          subtitle="prefers-color-scheme reportado por el navegador del votante."
        >
          <ChartFrame t={t} height={240}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Oscuro', value: dark.dark },
                  { name: 'Claro', value: dark.light },
                  { name: 'Desconocido', value: dark.unknown },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(props) => renderPieLabel(props, t, String(props.value))}
                labelLine={{ stroke: t.textMuted }}
              >
                {[dark.dark, dark.light, dark.unknown].map((_, i) => {
                  const colors = [
                    scheme === 'dark' ? '#FAFAFA' : '#0E0E0E',
                    scheme === 'dark' ? '#A1A1AA' : '#A1A1AA',
                    scheme === 'dark' ? '#3F3F46' : '#E5E5E5',
                  ];
                  return <Cell key={i} fill={colors[i]} stroke={t.surface} strokeWidth={2} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle(t)}
                itemStyle={{ color: t.textPrimary }}
                labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
              />
            </PieChart>
          </ChartFrame>
        </Section>

        <Section
          t={t}
          title="Modos de previsualización"
          subtitle="¿Vieron cada paleta en claro o en oscuro antes de votar?"
        >
          <ChartFrame t={t} height={260}>
            <BarChart
              data={PALETTES.map((p) => ({
                name: shortName(p.id),
                Claro: previews[p.id]?.light ?? 0,
                Oscuro: previews[p.id]?.dark ?? 0,
              }))}
              margin={{ top: 10, right: 16, bottom: 10, left: 8 }}
            >
              <CartesianGrid stroke={t.borderSubtle} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
              <YAxis allowDecimals={false} tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
              <Tooltip
                cursor={{ fill: t.borderSubtle }}
                contentStyle={tooltipStyle(t)}
                itemStyle={{ color: t.textPrimary }}
                labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: t.textSecondary }} />
              <Bar dataKey="Claro" stackId="m" fill="#A1A1AA" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Oscuro" stackId="m" fill={scheme === 'dark' ? '#FAFAFA' : '#0E0E0E'} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </Section>
      </div>

      <Section
        t={t}
        title="Velocidad de votos"
        subtitle="Total acumulado de votos a lo largo del tiempo."
      >
        <ChartFrame t={t} height={240}>
          <LineChart data={cumulative} margin={{ top: 10, right: 24, bottom: 10, left: 8 }}>
            <CartesianGrid stroke={t.borderSubtle} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: t.textSecondary, fontSize: 10 }}
              stroke={t.border}
              minTickGap={32}
            />
            <YAxis allowDecimals={false} tick={{ fill: t.textSecondary, fontSize: 11 }} stroke={t.border} />
            <Tooltip
              contentStyle={tooltipStyle(t)}
              itemStyle={{ color: t.textPrimary }}
              labelStyle={{ color: t.textSecondary, fontWeight: 500 }}
              formatter={(v) => [v, 'Acumulado']}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={paletteInk(winner, scheme)}
              strokeWidth={2}
              dot={{ r: 2.5, fill: paletteInk(winner, scheme) }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartFrame>
      </Section>

      <Section t={t} title="Votos recientes" subtitle="Los últimos 10 votos registrados.">
        <RecentVotesTable votes={votes} t={t} scheme={scheme} />
      </Section>
    </div>
  );
}

function KpiStrip({ items, t }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: MONO_FONT,
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: t.textSecondary,
              marginBottom: 6,
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              fontSize: it.small ? 14 : 22,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: it.accent ?? t.textPrimary,
              lineHeight: 1.1,
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, subtitle, t, children }) {
  return (
    <section>
      <div style={{ marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: t.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function ChartFrame({ height, children }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function tooltipStyle(t) {
  return {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    fontSize: 12,
    color: t.textPrimary,
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
  };
}

function renderPieLabel(props, t, valueLabel) {
  const { cx, cy, midAngle, outerRadius, name, value } = props;
  if (!value) return null;
  const RAD = Math.PI / 180;
  const radius = outerRadius + 14;
  const x = cx + radius * Math.cos(-midAngle * RAD);
  const y = cy + radius * Math.sin(-midAngle * RAD);
  const anchor = x > cx ? 'start' : 'end';
  const text = valueLabel != null ? `${name}: ${valueLabel}` : name;
  return (
    <text
      x={x}
      y={y}
      fill={t.textPrimary}
      fontSize={11}
      textAnchor={anchor}
      dominantBaseline="central"
    >
      {text}
    </text>
  );
}

function Podium({ ordered, summary, t, scheme, totalVotes }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      {ordered.map((p, idx) => {
        const s = summary[p.id] ?? {};
        const pct = totalVotes ? Math.round(((s.firstPlace ?? 0) / totalVotes) * 100) : 0;
        const ink = paletteInk(p, scheme);
        const fill = paletteFill(p, scheme);
        return (
          <div
            key={p.id}
            style={{
              border: `1px solid ${idx === 0 ? ink : t.border}`,
              borderRadius: 12,
              padding: 14,
              background: t.bg,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: MONO_FONT,
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: idx === 0 ? ink : t.textSecondary,
                marginBottom: 6,
              }}
            >
              #{idx + 1} {idx === 0 ? '· líder' : ''}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: fill,
                  boxShadow: `inset 0 0 0 1px ${t.swatchInset}`,
                }}
              />
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}>
                {shortName(p.id)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
              <Stat t={t} label="Promedio" value={(s.avgRank || 0).toFixed(2)} />
              <Stat t={t} label="Votos" value={String(s.count ?? 0)} />
              <Stat t={t} label="1ª" value={`${s.firstPlace ?? 0} (${pct}%)`} />
              <Stat t={t} label="Puntos" value={String(s.points ?? 0)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, t }) {
  return (
    <div>
      <div
        style={{
          fontFamily: MONO_FONT,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: t.textMuted,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{value}</div>
    </div>
  );
}

function RecentVotesTable({ votes, t, scheme }) {
  const recent = useMemo(() => {
    const sorted = [...votes].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 10);
  }, [votes]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ textAlign: 'left', color: t.textSecondary }}>
            <Th t={t}>Fecha</Th>
            <Th t={t}>1ª</Th>
            <Th t={t}>2ª</Th>
            <Th t={t}>3ª</Th>
            <Th t={t}>SO</Th>
          </tr>
        </thead>
        <tbody>
          {recent.map((v) => {
            const ranks = v.ranks ?? {};
            const ordered = PALETTES.map((p) => p.id).sort(
              (a, b) => (ranks[a] ?? 99) - (ranks[b] ?? 99)
            );
            const [first, second, third] = ordered;
            return (
              <tr key={v.id} style={{ borderTop: `1px solid ${t.borderSubtle}` }}>
                <Td t={t} mono>{formatDate(v.created_at)}</Td>
                <Td t={t}><Pill id={first} t={t} scheme={scheme} /></Td>
                <Td t={t}><Pill id={second} t={t} scheme={scheme} /></Td>
                <Td t={t}><Pill id={third} t={t} scheme={scheme} /></Td>
                <Td t={t} mono>{v.prefers_dark === true ? 'oscuro' : v.prefers_dark === false ? 'claro' : '—'}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, t }) {
  return (
    <th
      style={{
        padding: '8px 10px',
        fontFamily: MONO_FONT,
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 500,
        color: t.textSecondary,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, t, mono }) {
  return (
    <td
      style={{
        padding: '10px',
        color: t.textPrimary,
        fontFamily: mono ? MONO_FONT : undefined,
        fontSize: mono ? 12 : 13,
      }}
    >
      {children}
    </td>
  );
}

function Pill({ id, t, scheme }) {
  if (!id) return <span style={{ color: t.textMuted }}>—</span>;
  const p = PALETTES.find((x) => x.id === id);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 999,
        padding: '3px 9px',
        fontSize: 12,
        color: t.textPrimary,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: p ? paletteFill(p, scheme) : t.textMuted,
        }}
      />
      {shortName(id)}
    </span>
  );
}
