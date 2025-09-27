import React, { useState } from 'react';
import Grid from './Grid';
import Sidebar from './Sidebar';
import JsonPanel from './JsonPanel';
import { LevelJson, Obstacle } from '../types/Level';

const GRID_ROWS = 25; // vertical
const GRID_COLS = 15; // horizontal


const GameEditor: React.FC = () => {
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [selectedItem, setSelectedItem] = useState<'wall' | 'laser' | 'portal' | null>(null);
    // axis state kaldırıldı

    // Diğer öğeler (snake, food, premiumItem) ileride eklenebilir
    const levelJson: LevelJson = {
        obstacles,
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
            <Grid
                rows={GRID_ROWS}
                cols={GRID_COLS}
                obstacles={obstacles}
                setObstacles={setObstacles}
                selectedItem={selectedItem}
            />
            <JsonPanel levelJson={levelJson} />
        </div>
    );
};

export default GameEditor;
