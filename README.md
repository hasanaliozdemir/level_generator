# CyberSnake Level Generator

A modern, responsive web-based level editor for the CyberSnake mobile game. Design grid-based levels with drag-and-drop obstacles and export them as JSON for use in the game.

## Features
- **Grid-based editor:** 15 columns × 25 rows, optimized for CyberSnake's render logic
- **Drag-and-drop obstacle placement:** Wall, Laser, Portal
- **Obstacle editing:** Move, delete, and update obstacles
- **Portal placement:** Select two positions for in/out
- **Live JSON output:** See and export the current level as JSON
- **Responsive UI:** Built with React + TypeScript
- **English interface**

## Demo
Live: [level-generator.hasanali.space](https://level-generator.hasanali.space/)

## Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build
```bash
npm run build
```
Build output will be in the `dist` folder.

## Deployment
This project is ready for static hosting (Vercel, Netlify, GitHub Pages, etc.).
- The build output is in the `dist` folder.
- For Vercel, make sure your `vercel.json` has:
```json
{
  "outputDirectory": "dist"
}
```

## Level JSON Format
Example:
```json
{
  "obstacles": [
    {
      "type": "laser",
      "axis": "vertical",
      "positions": [[1,5],[1,6],[1,7],[2,7],[2,8],[2,9],[3,10],[3,11]]
    },
    {
      "type": "portal",
      "effect": "teleport",
      "positions": [[9,9],[11,11]]
    }
  ]
}
```

## Project Structure
```
level-generator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GameEditor.tsx
│   │   ├── Grid.tsx
│   │   ├── Sidebar.tsx
│   │   └── JsonPanel.tsx
│   ├── types/
│   │   └── Level.ts
│   └── index.tsx
├── dist/
├── package.json
├── tsconfig.json
├── webpack.config.js
├── vercel.json
└── README.md
```

## License
MIT
