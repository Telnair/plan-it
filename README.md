# PlanIt

A browser-based floor plan editor built with React, TypeScript, and Vite. Draw walls, place windows and doors, mark areas, measure distances, and explore the result in a 3D walkthrough — all stored locally in the browser with no backend required.

## Features

- **Draw mode** — the single working mode for all editing tasks
  - **Fixed walls** — structural walls (thick, dark); always rendered on top of movable walls
  - **Movable walls** — lighter, non-structural partitions
  - **Canal / Duct** — hollow thick-wall rectangles for service runs
  - **Windows** — dashed thin lines
  - **Doors** — line + opening arc with three interactive handles when highlighted: drag the arc end to set angle, click the midpoint button to flip swing direction, click the tip button to move the hinge to the other end
  - **Area** — click polygon corners to mark named floor areas with m² calculations
  - **Measure** — draw measurement lines; hover to see length (requires scale calibration), click × to remove
- **Calibration** — draw a reference line and enter its real-world length to set the pixel-per-mm scale
- **Visibility toggles** — show/hide areas and measurement lines independently
- **Background image** — upload a floor-plan scan, adjust opacity and size, use as a tracing guide
- **3D Tour** — Three.js/React Three Fiber walkthrough of fixed walls
- **History panel** — list of placed elements with highlight and delete per entry
- **Undo** — removes the most recently placed element (Cmd/Ctrl+Z)
- **Export / Import** — save and load the full project state as JSON
- **Persistent state** — automatically saved to `localStorage`; survives page refresh

## Tech stack

| Concern | Library |
|---------|---------|
| UI framework | React 19 + TypeScript |
| Build tool | Vite |
| 2D canvas | Konva / react-konva |
| 3D view | Three.js / @react-three/fiber + drei |
| UI components | MUI v9 |
| Styling | styled-components |
| State management | Zustand |
| Storage | localStorage (via a thin adapter) |

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

Output lands in `dist/`.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```
