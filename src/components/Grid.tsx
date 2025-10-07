import React, { useState } from 'react';
import { Obstacle } from '../types/Level';


interface GridProps {
    rows: number;
    cols: number;
    obstacles: Obstacle[];
    setObstacles: (obs: Obstacle[]) => void;
    selectedItem: 'wall' | 'laser' | 'portal' | null;
}

const getCellObstacle = (row: number, col: number, obstacles: Obstacle[]) => {
    for (const obs of obstacles) {
        if (obs.type === 'portal') {
            if (obs.positions.some(([r, c]) => r === row && c === col)) return obs.type;
        } else {
            if (obs.positions.some(([r, c]) => r === row && c === col)) return obs.type;
        }
    }
    return null;
}

const Grid: React.FC<GridProps> = ({ rows, cols, obstacles, setObstacles, selectedItem }) => {
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [paintMode, setPaintMode] = useState<'add' | 'remove'>('add');
    const [paintPositions, setPaintPositions] = useState<[number, number][]>([]);
    const [paintAxis, setPaintAxis] = useState<'horizontal' | 'vertical' | null>(null);
    // Portal ekleme için geçici pozisyonlar
    const [tempPortal, setTempPortal] = useState<[number, number][]>([]);

    // Yılanın başlangıç pozisyonları (x: col, y: row formatında)
    const snakeStartX = Math.floor(cols / 2);
    const snakeStartY = Math.floor(rows / 2);

    // Yılanın başlangıç hücreleri ve üstündeki 3 hücre (toplamda 6 hücre)
    const isSnakeReservedCell = (row: number, col: number): boolean => {
        if (col !== snakeStartX) return false;
        // Yılanın 3 hücresi: snakeStartY, snakeStartY+1, snakeStartY+2
        // Üstündeki 3 hücre: snakeStartY-1, snakeStartY-2, snakeStartY-3
        return row >= snakeStartY - 3 && row <= snakeStartY + 2;
    };

    const handlePointerDown = (row: number, col: number, cellType: 'wall' | 'laser' | 'portal' | null) => {
        // Yılanın rezerve alanına engel eklenemez
        if (isSnakeReservedCell(row, col)) return;
        // Portal ekleme modunda (öğe seçili ve portal), sadece ekleme işlemi yapılır
        if (selectedItem === 'portal') {
            if (tempPortal.length === 0) {
                setTempPortal([[row, col]]);
            } else if (tempPortal.length === 1 && (tempPortal[0][0] !== row || tempPortal[0][1] !== col)) {
                const portalPositions: [number, number][] = [tempPortal[0], [row, col]];
                setObstacles([
                    ...obstacles,
                    {
                        type: 'portal',
                        effect: 'teleport',
                        positions: portalPositions as [[number, number], [number, number]],
                    },
                ]);
                setTempPortal([]);
            }
            return;
        }
        // Portal ekleme modunda değilken, herhangi bir obstacle hücresine tıklanınca sil
        if (cellType) {
            setPaintMode('remove');
            removeObstacleAt(row, col);
        } else if (selectedItem) {
            setPaintMode('add');
            setPaintPositions([[row, col]]);
            setPaintAxis(null);
            setIsPainting(true);
        }
    };

    const handlePointerEnter = (row: number, col: number, cellType: 'wall' | 'laser' | 'portal' | null) => {
        if (selectedItem === 'portal') return; // Portal için sürükle-çek yok
        if (!isPainting) return;
        // Yılanın rezerve alanına engel eklenemez
        if (isSnakeReservedCell(row, col)) return;
        if (paintMode === 'add' && selectedItem && !cellType) {
            setPaintPositions((prev: [number, number][]) => {
                if (prev.length === 0) return [[row, col]];
                // Axis kilitli değilse, ikinci hücrede axis'i belirle
                let axis = paintAxis;
                if (prev.length === 1 && !axis) {
                    if (row === prev[0][0]) axis = 'horizontal';
                    else if (col === prev[0][1]) axis = 'vertical';
                    setPaintAxis(axis);
                }
                // Axis kilitli ise, sadece o yönde ekle
                if (axis === 'horizontal' && row === prev[0][0]) {
                    if (prev.some(([r, c]) => r === row && c === col)) return prev;
                    return [...prev, [row, col]];
                } else if (axis === 'vertical' && col === prev[0][1]) {
                    if (prev.some(([r, c]) => r === row && c === col)) return prev;
                    return [...prev, [row, col]];
                }
                return prev;
            });
        } else if (paintMode === 'remove' && cellType) {
            removeObstacleAt(row, col);
        }
    };

    const handlePointerUp = () => {
        if (isPainting && paintMode === 'add' && selectedItem && paintPositions.length > 0) {
            if (selectedItem === 'portal') {
                if (paintPositions.length === 2) {
                    setObstacles([
                        ...obstacles,
                        {
                            type: 'portal',
                            effect: 'teleport',
                            positions: [paintPositions[0], paintPositions[1]],
                        },
                    ]);
                }
            } else if (paintAxis) {
                setObstacles([
                    ...obstacles,
                    {
                        type: selectedItem,
                        axis: paintAxis,
                        positions: paintPositions,
                    },
                ]);
            }
        }
        setIsPainting(false);
        setPaintPositions([]);
        setPaintAxis(null);
    };

    const removeObstacleAt = (row: number, col: number) => {
        // Pozisyonu içeren obstacle'ın tamamını sil
        const newObstacles = obstacles.filter(obs => {
            return !obs.positions.some(([r, c]) => r === row && c === col);
        });
        setObstacles(newObstacles);
    };

    React.useEffect(() => {
        window.addEventListener('pointerup', handlePointerUp);
        return () => window.removeEventListener('pointerup', handlePointerUp);
    });

    // Portal eklenirken geçici pozisyonları ve sürüklenen hücreleri gridde göster
    return (
        <div
            style={{ flex: 1, display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${cols}, 1fr)`, border: '1px solid #ccc', margin: '16px' }}
        >
            {Array.from({ length: rows * cols }).map((_, idx) => {
                const row = Math.floor(idx / cols);
                const col = idx % cols;
                const cellType = getCellObstacle(row, col, obstacles);
                // Portal eklenirken geçici pozisyonları göster
                const isTempPortal = tempPortal.some(([r, c]) => r === row && c === col);
                // Sürükleme sırasında işaretlenen hücreleri göster
                const isPainted = paintPositions.some(([r, c]) => r === row && c === col);
                // Yılanın rezerve alanı
                const isReserved = isSnakeReservedCell(row, col);
                // Yılanın başlangıç 3 hücresi
                const isSnakeStart = col === snakeStartX && row >= snakeStartY && row <= snakeStartY + 2;

                return (
                    <div
                        key={idx}
                        onPointerDown={() => handlePointerDown(row, col, cellType)}
                        onPointerEnter={() => handlePointerEnter(row, col, cellType)}
                        style={{
                            border: '1px solid #eee',
                            minHeight: 24,
                            background:
                                isSnakeStart ? '#69db7c' :
                                    isReserved ? '#f1f3f5' :
                                        isTempPortal ? '#a5d8ff' :
                                            isPainted ? '#ffe066' :
                                                cellType === 'wall' ? '#adb5bd' :
                                                    cellType === 'laser' ? '#ffe066' :
                                                        cellType === 'portal' ? '#74c0fc' : '#fff',
                            cursor: isReserved ? 'not-allowed' : selectedItem ? 'pointer' : cellType ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                            opacity: isReserved && !isSnakeStart ? 0.5 : 1,
                        }}
                        title={
                            isSnakeStart ? 'Snake start position' :
                                isReserved ? 'Reserved area (no obstacles allowed)' :
                                    cellType ? 'Click or drag to delete' :
                                        selectedItem === 'portal' ? 'Select two positions for portal' :
                                            selectedItem ? 'Click or drag to add' : ''
                        }
                    />
                );
            })}
        </div>
    );
};

export default Grid;
