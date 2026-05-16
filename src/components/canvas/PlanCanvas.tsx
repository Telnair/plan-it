import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import type Konva from 'konva';
import { useAppStore } from '../../store/appStore';
import { BackgroundLayer } from './BackgroundLayer';
import { ElementsLayer } from './ElementsLayer';
import { AreaLayer } from './AreaLayer';
import { DrawingLayer } from './DrawingLayer';
import { MeasurementLayer } from './MeasurementLayer';
import { FurnitureLayer } from './FurnitureLayer';
import { CalibrationDialog } from '../dialogs/CalibrationDialog';
import { AreaNameDialog } from '../dialogs/AreaNameDialog';
import { FurnitureNameDialog } from '../dialogs/FurnitureNameDialog';
import { snapTo45 } from '../../utils/geometry';
import type { Point, GrayShade, ToolType, LineElement } from '../../store/types';
import styled from 'styled-components';

const CanvasContainer = styled.div<{ $hideNativeCursor: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: ${(p) => (p.$hideNativeCursor ? 'none' : 'crosshair')};
`;

const HintBanner = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(20, 20, 20, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.7rem;
  color: #bdbdbd;
  pointer-events: none;
  white-space: nowrap;
`;

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function PlanCanvas({ stageRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawEnd, setDrawEnd] = useState<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [calibOpen, setCalibOpen] = useState(false);
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [furnitureDialogOpen, setFurnitureDialogOpen] = useState(false);

  const store = useAppStore();
  const { activeToolType, activeColor, calibration, mode, pendingAreaPolygon, pendingFurniturePolygon, isSettingAnchor } = store;

  const hideNativeCursor = activeToolType !== 'area_select' && activeToolType !== 'furniture_select' && activeToolType !== 'measure';

  // Arrow key movement for the selected element
  useEffect(() => {
    const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    function onKeyDown(e: KeyboardEvent) {
      if (!store.highlightedElementId) return;
      if (!ARROWS.includes(e.key)) return;
      e.preventDefault();

      const step = e.shiftKey ? 10 : 1;
      const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
      const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
      const id = store.highlightedElementId;
      const shift = (el: LineElement) => ({ x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy });

      const wall = store.walls.find((w) => w.id === id);
      if (wall) { store.updateWall(id, shift(wall)); return; }

      const win = store.windows.find((w) => w.id === id);
      if (win) { store.updateWindow(id, shift(win)); return; }

      const door = store.doors.find((d) => d.id === id);
      if (door) { store.updateDoor(id, shift(door)); return; }

      const measurement = store.measurements.find((m) => m.id === id);
      if (measurement) { store.updateMeasurement(id, shift(measurement)); return; }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store]);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  function getRawPointerPos(e: Konva.KonvaEventObject<MouseEvent>): Point {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition() ?? { x: 0, y: 0 };
    return { x: pos.x, y: pos.y };
  }

  function getPointerPos(e: Konva.KonvaEventObject<MouseEvent>): Point {
    const raw = getRawPointerPos(e);
    return e.evt.shiftKey && drawStart ? snapTo45(drawStart, raw) : raw;
  }

  function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (mode === 'tour3d') return;

    const pos = getPointerPos(e);

    // Anchor placement mode: next click sets the 3D start point
    if (isSettingAnchor) {
      store.setTourAnchor(getRawPointerPos(e));
      store.setIsSettingAnchor(false);
      return;
    }

    if (activeToolType === 'area_select') {
      if (pendingAreaPolygon.length >= 3) {
        const first = pendingAreaPolygon[0];
        const dx = pos.x - first.x;
        const dy = pos.y - first.y;
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          setAreaDialogOpen(true);
          setDrawStart(null);
          setDrawEnd(null);
          return;
        }
      }
      store.setPendingAreaPolygon([...pendingAreaPolygon, pos]);
      setDrawStart(pos);
      return;
    }

    if (activeToolType === 'furniture_select') {
      if (pendingFurniturePolygon.length >= 3) {
        const first = pendingFurniturePolygon[0];
        const dx = pos.x - first.x;
        const dy = pos.y - first.y;
        if (Math.sqrt(dx * dx + dy * dy) < 15) {
          setFurnitureDialogOpen(true);
          setDrawStart(null);
          setDrawEnd(null);
          return;
        }
      }
      store.setPendingFurniturePolygon([...pendingFurniturePolygon, pos]);
      setDrawStart(pos);
      return;
    }

    setDrawStart(pos);
    setDrawEnd(pos);
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const raw = getRawPointerPos(e);
    setCursorPos(raw);
    if (!drawStart && activeToolType !== 'area_select') return;
    setDrawEnd(getPointerPos(e));
  }

  function handleClick(e: Konva.KonvaEventObject<MouseEvent>) {
    // Clear door/element selection when clicking empty canvas
    if (e.target === e.target.getStage()) {
      store.setHighlightedElement(null);
    }
  }

  function handleMouseUp(_e: Konva.KonvaEventObject<MouseEvent>) {
    if (activeToolType === 'area_select' || activeToolType === 'furniture_select') return;
    if (!drawStart || !drawEnd) return;

    const dx = drawEnd.x - drawStart.x;
    const dy = drawEnd.y - drawStart.y;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);

    if (lengthPx < 5) {
      setDrawStart(null);
      setDrawEnd(null);
      return;
    }

    const line = {
      x1: drawStart.x,
      y1: drawStart.y,
      x2: drawEnd.x,
      y2: drawEnd.y,
      color: activeColor,
      tool: activeToolType,
    };

    // First ever wall/window/door triggers calibration (measure tool skips it)
    if (activeToolType === 'measure') {
      store.addMeasurement({ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 });
    } else if (!calibration && store.walls.length === 0 && store.windows.length === 0 && store.doors.length === 0) {
      store.setPendingCalibrationLine({ ...line, id: '' });
      setCalibOpen(true);
    } else {
      commitLine(line);
    }

    setDrawStart(null);
    setDrawEnd(null);
  }

  function commitLine(line: { x1: number; y1: number; x2: number; y2: number; color: GrayShade; tool: ToolType }) {
    if (line.tool === 'wall_fixed' || line.tool === 'wall_movable' || line.tool === 'wall_canal') {
      store.addWall(line);
    } else if (line.tool === 'window') {
      store.addWindow(line);
    } else if (line.tool === 'door') {
      store.addDoor({ ...line, tool: 'door', openingAngleDeg: 90, openingDirection: 1, hingeFlipped: false });
    }
  }

  const hint = (() => {
    if (mode === 'tour3d') return null;
    if (activeToolType === 'area_select') {
      if (pendingAreaPolygon.length === 0) return 'Click to place area corners. Click near first point to close.';
      if (pendingAreaPolygon.length < 3) return `${pendingAreaPolygon.length} point(s) — need at least 3`;
      return 'Click near the first point to close the area';
    }
    if (activeToolType === 'furniture_select') {
      if (pendingFurniturePolygon.length === 0) return 'Click to outline furniture. Click near first point to close.';
      if (pendingFurniturePolygon.length < 3) return `${pendingFurniturePolygon.length} point(s) — need at least 3`;
      return 'Click near the first point to close the shape';
    }
    if (!calibration && store.walls.length === 0) return 'Draw your first line — you\'ll be asked to calibrate the scale';
    return 'Hold Shift to snap to 45° angles';
  })();

  return (
    <CanvasContainer
      ref={containerRef}
      $hideNativeCursor={hideNativeCursor}
      onMouseLeave={() => setCursorPos(null)}
    >
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{ background: '#f5f5f5' }}
      >
        {/* Dot grid — always-visible subtle reference */}
        <Layer listening={false}>
          {Array.from({ length: Math.ceil(size.w / 40) + 1 }, (_, ix) =>
            Array.from({ length: Math.ceil(size.h / 40) + 1 }, (_, iy) => (
              <Rect
                key={`dot-${ix}-${iy}`}
                x={ix * 40}
                y={iy * 40}
                width={1.5}
                height={1.5}
                fill="rgba(0,0,0,0.12)"
              />
            ))
          )}
        </Layer>

        {/* Toggleable square grid */}
        {store.viewSettings.showGrid && (() => {
          const gs = Math.max(4, store.viewSettings.gridSize);
          const strokeColor = `rgba(0,0,0,${store.viewSettings.gridOpacity / 100})`;
          return (
            <Layer listening={false}>
              {Array.from({ length: Math.ceil(size.w / gs) + 1 }, (_, ix) => (
                <Line
                  key={`vg-${ix}`}
                  points={[ix * gs, 0, ix * gs, size.h]}
                  stroke={strokeColor}
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: Math.ceil(size.h / gs) + 1 }, (_, iy) => (
                <Line
                  key={`hg-${iy}`}
                  points={[0, iy * gs, size.w, iy * gs]}
                  stroke={strokeColor}
                  strokeWidth={1}
                />
              ))}
            </Layer>
          );
        })()}

        <BackgroundLayer
          src={store.viewSettings.showBackgroundImage ? store.backgroundImage : null}
          canvasWidth={size.w}
          canvasHeight={size.h}
          opacity={store.viewSettings.backgroundImageOpacity}
          sizeScale={store.viewSettings.backgroundImageScale}
        />

        <AreaLayer />

        <ElementsLayer
          onUpdateDoor={(id, partial) => store.updateDoor(id, partial)}
        />

        <DrawingLayer
          drawStart={drawStart}
          drawEnd={drawEnd}
          areaPolygon={pendingAreaPolygon}
          furniturePolygon={pendingFurniturePolygon}
          cursorPos={cursorPos}
        />

        <FurnitureLayer />

        <MeasurementLayer />

        {/* Empty state hint */}
        {store.walls.length === 0 && store.windows.length === 0 && store.doors.length === 0 && !store.backgroundImage && (
          <Layer listening={false}>
            <Text
              x={0}
              y={size.h / 2 - 40}
              width={size.w}
              text="Click and drag to draw your first wall"
              fontSize={18}
              fill="rgba(0,0,0,0.18)"
              align="center"
            />
            <Text
              x={0}
              y={size.h / 2 - 14}
              width={size.w}
              text="or upload a floor plan image from the sidebar"
              fontSize={13}
              fill="rgba(0,0,0,0.12)"
              align="center"
            />
          </Layer>
        )}
      </Stage>

      {hint && <HintBanner>{hint}</HintBanner>}

      <CalibrationDialog open={calibOpen} onClose={() => setCalibOpen(false)} />

      <AreaNameDialog
        open={areaDialogOpen}
        polygon={pendingAreaPolygon}
        onClose={() => setAreaDialogOpen(false)}
      />

      <FurnitureNameDialog
        open={furnitureDialogOpen}
        polygon={pendingFurniturePolygon}
        onClose={() => setFurnitureDialogOpen(false)}
      />
    </CanvasContainer>
  );
}
