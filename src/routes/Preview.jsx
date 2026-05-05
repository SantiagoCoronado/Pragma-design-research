import { Navigate, useParams } from 'react-router-dom';
import PragmaSite, { PALETTES } from '../PragmaSite.jsx';

export default function Preview() {
  const { paletteId } = useParams();
  const exists = PALETTES.some((p) => p.id === paletteId);
  if (!exists) return <Navigate to="/" replace />;

  return <PragmaSite lockedPaletteId={paletteId} />;
}
