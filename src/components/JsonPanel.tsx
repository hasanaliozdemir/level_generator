import React from 'react';
import { LevelJson } from '../types/Level';

interface JsonPanelProps {
    levelJson: LevelJson;
}

const JsonPanel: React.FC<JsonPanelProps> = ({ levelJson }) => {
    // Pozisyonları [row, col] yerine [x, y] yani [col, row] formatına çevir
    const transformedObstacles = levelJson.obstacles.map(obstacle => {
        if (obstacle.type === 'portal') {
            return {
                ...obstacle,
                positions: obstacle.positions.map(([row, col]) => [col, row])
            };
        } else {
            return {
                ...obstacle,
                positions: obstacle.positions.map(([row, col]) => [col, row])
            };
        }
    });

    // Direkt array olarak export et (obstacles: key olmadan)
    const jsonStr = JSON.stringify(transformedObstacles, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonStr);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'level.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ width: 320, background: '#fafafa', padding: 16, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
            <h3>Level JSON</h3>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                <button onClick={handleCopy}>Copy</button>
                <button onClick={handleDownload}>Download</button>
            </div>
            <pre style={{ flex: 1, background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, fontSize: 13, overflow: 'auto' }}>{jsonStr}</pre>
        </div>
    );
};

export default JsonPanel;
