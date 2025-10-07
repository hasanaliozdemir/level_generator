import React from 'react';

interface SidebarProps {
    selectedItem: 'wall' | 'laser' | 'portal' | null;
    setSelectedItem: (item: 'wall' | 'laser' | 'portal') => void;
}

const items = [
    { type: 'wall', label: 'Wall' },
    { type: 'laser', label: 'Laser' },
    { type: 'portal', label: 'Portal' },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedItem, setSelectedItem }) => {
    return (
        <div style={{ width: 180, background: '#f7f7f7', padding: 16, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
            <h3>Elements</h3>
            {items.map(item => (
                <div
                    key={item.type}
                    onClick={() => setSelectedItem(item.type as 'wall' | 'laser' | 'portal')}
                    style={{
                        margin: '8px 0',
                        padding: '8px',
                        background: selectedItem === item.type ? '#d0ebff' : '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: selectedItem === item.type ? 'bold' : 'normal',
                    }}
                >
                    {item.label}
                </div>
            ))}

            <div style={{
                marginTop: 'auto',
                padding: '12px',
                background: '#e7f5ff',
                borderRadius: 6,
                fontSize: 12,
                lineHeight: 1.5,
                border: '1px solid #74c0fc'
            }}>
                <strong style={{ display: 'block', marginBottom: 6, color: '#1971c2' }}>🐍 Snake Area</strong>
                <p style={{ margin: 0, color: '#495057' }}>
                    The green cells in the center are the snake's starting position.
                    The gray cells above are reserved space. No obstacles can be placed in these areas.
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
