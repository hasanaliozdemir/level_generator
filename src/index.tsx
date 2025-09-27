import React from 'react';
import { createRoot } from 'react-dom/client';
import GameEditor from './components/GameEditor';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<GameEditor />);
}
