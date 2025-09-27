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
        <div style={{ width: 180, background: '#f7f7f7', padding: 16, borderRight: '1px solid #ddd' }}>
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
        </div>
    );
};

export default Sidebar;
