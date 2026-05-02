import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PragmaSite from './PragmaSite.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PragmaSite />
  </StrictMode>
);
