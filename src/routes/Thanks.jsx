import { getTheme, useColorScheme } from '../lib/useColorScheme.js';

export default function Thanks() {
  const scheme = useColorScheme();
  const t = getTheme(scheme);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.textPrimary,
        fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        colorScheme: scheme,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: scheme === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: t.textSecondary,
            marginBottom: 16,
          }}
        >
          Pragma · Ranking
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 3.4vw, 2.1rem)',
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: '-0.01em',
            fontWeight: 600,
          }}
        >
          ¡Gracias! Tu ranking quedó registrado.
        </h1>
        <p style={{ marginTop: 16, color: t.textSecondary, lineHeight: 1.55, fontSize: 15 }}>
          Tu voto nos ayuda a elegir la dirección visual de Pragma.
        </p>
      </div>
    </div>
  );
}
