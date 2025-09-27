import React from 'react';
import { LevelJson } from '../types/Level';

interface JsonPanelProps {
    levelJson: LevelJson;
}

const JsonPanel: React.FC<JsonPanelProps> = ({ levelJson }) => {
    const jsonStr = JSON.stringify(levelJson, null, 2);

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
            <pre style={{ flex: 1, background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, fontSize: 13 }}>{jsonStr}</pre>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button onClick={handleCopy}>Copy</button>
                <button onClick={handleDownload}>Download</button>
            </div>
        </div>
    );
};

export default JsonPanel;
