import { useCallback } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import PragmaSite, { PALETTES } from '../PragmaSite.jsx';

const PREVIEW_MODES_STORAGE_KEY = 'pragma-design-vote-preview-modes-v1';

export default function Preview() {
  const { paletteId } = useParams();
  const exists = PALETTES.some((p) => p.id === paletteId);

  const onModeChange = useCallback(
    (mode) => {
      if (!paletteId) return;
      try {
        const raw = localStorage.getItem(PREVIEW_MODES_STORAGE_KEY);
        const current = raw ? JSON.parse(raw) : {};
        if (current && typeof current === 'object' && current[paletteId] === mode) return;
        const next = { ...(current && typeof current === 'object' ? current : {}), [paletteId]: mode };
        localStorage.setItem(PREVIEW_MODES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    },
    [paletteId],
  );

  if (!exists) return <Navigate to="/" replace />;

  return <PragmaSite lockedPaletteId={paletteId} onModeChange={onModeChange} />;
}
