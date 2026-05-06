import { Navigate, Route, Routes } from 'react-router-dom';
import Vote from './routes/Vote.jsx';
import Preview from './routes/Preview.jsx';
import Thanks from './routes/Thanks.jsx';
import Results from './routes/Results.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Vote />} />
      <Route path="/preview/:paletteId" element={<Preview />} />
      <Route path="/thanks" element={<Thanks />} />
      <Route path="/results" element={<Results />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
