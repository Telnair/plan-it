import { useState } from 'react';
import styled from 'styled-components';
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAppStore } from '../../store/appStore';
import { TOOL_DEFS, AREA_SELECT_TOOL, FURNITURE_TOOL, MEASURE_TOOL } from './TOOLS';
import type { ToolType, ViewSettings } from '../../store/types';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToolRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ToolBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: ${(p) => (p.$active ? 'rgba(79,195,247,0.18)' : 'transparent')};
  outline: ${(p) => (p.$active ? '1px solid rgba(79,195,247,0.6)' : '1px solid transparent')};
  color: ${(p) => (p.$active ? '#4fc3f7' : '#b0bec5')};
  transition: all 0.15s ease;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e0e0e0;
  }
`;

const LinePreview = styled.div<{ $width: number; $dashed: boolean; $color: string }>`
  width: 32px;
  height: ${(p) => p.$width}px;
  background: ${(p) => p.$color};
  border-radius: 2px;
  flex-shrink: 0;
  ${(p) =>
    p.$dashed
      ? `background: repeating-linear-gradient(90deg, ${p.$color} 0, ${p.$color} 6px, transparent 6px, transparent 10px);`
      : ''}
`;

const ALL_TOOLS = [...TOOL_DEFS, AREA_SELECT_TOOL, FURNITURE_TOOL, MEASURE_TOOL];

// ViewSettings key that controls each tool's visibility
const VISIBILITY_KEY: Record<ToolType, keyof ViewSettings> = {
  wall_fixed:       'showFixedWalls',
  wall_movable:     'showMovableWalls',
  wall_canal:       'showCanalWalls',
  window:           'showWindows',
  door:             'showDoors',
  area_select:      'showAreas',
  furniture_select: 'showFurniture',
  measure:          'showMeasurements',
};

// Store action name for "clear all" per tool type
type ClearKey =
  | 'clearFixedWalls' | 'clearMovableWalls' | 'clearCanalWalls'
  | 'clearWindows' | 'clearDoors' | 'clearAreas' | 'clearFurniture' | 'clearMeasurements';

const CLEAR_ACTION: Record<ToolType, ClearKey> = {
  wall_fixed:       'clearFixedWalls',
  wall_movable:     'clearMovableWalls',
  wall_canal:       'clearCanalWalls',
  window:           'clearWindows',
  door:             'clearDoors',
  area_select:      'clearAreas',
  furniture_select: 'clearFurniture',
  measure:          'clearMeasurements',
};

// Count of live items for each tool (drives disabled state of clear button)
function useItemCount(toolType: ToolType): number {
  const { walls, windows, doors, areas, furniture, measurements } = useAppStore();
  if (toolType === 'wall_fixed')       return walls.filter((w) => w.tool === 'wall_fixed').length;
  if (toolType === 'wall_movable')     return walls.filter((w) => w.tool === 'wall_movable').length;
  if (toolType === 'wall_canal')       return walls.filter((w) => w.tool === 'wall_canal').length;
  if (toolType === 'window')           return windows.length;
  if (toolType === 'door')             return doors.length;
  if (toolType === 'area_select')      return areas.length;
  if (toolType === 'furniture_select') return furniture.length;
  if (toolType === 'measure')          return measurements.length;
  return 0;
}

export function ToolPanel() {
  const store = useAppStore();
  const { activeToolType, setActiveTool, viewSettings, setViewSettings } = store;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingClear, setPendingClear] = useState<{ action: () => void; label: string } | null>(null);

  function requestClear(toolType: ToolType, label: string) {
    const actionKey = CLEAR_ACTION[toolType];
    const action = store[actionKey] as () => void;
    setPendingClear({ action, label });
    setConfirmOpen(true);
  }

  function handleConfirm() {
    pendingClear?.action();
    setConfirmOpen(false);
    setPendingClear(null);
  }

  function handleCancel() {
    setConfirmOpen(false);
    setPendingClear(null);
  }

  return (
    <Panel>
      <Typography variant="caption" sx={{ color: '#6b6b6b', mb: 0.5, px: 0.5 }}>
        TOOLS
      </Typography>

      {ALL_TOOLS.map((tool) => {
        const toolType = tool.type as ToolType;
        const visKey = VISIBILITY_KEY[toolType];
        const visible = viewSettings[visKey] as boolean;
        const count = useItemCount(toolType);   // called inside map — each tool renders its own row

        return (
          <ToolRow key={toolType}>
            <ToolBtn
              $active={activeToolType === toolType}
              onClick={() => setActiveTool(toolType)}
            >
              <LinePreview
                $width={Math.min(tool.strokeWidth, 6)}
                $dashed={tool.dashEnabled}
                $color={activeToolType === toolType ? '#4fc3f7' : '#6b6b6b'}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{tool.label}</span>
            </ToolBtn>

            {/* Eye toggle */}
            <IconButton
              size="small"
              onClick={() => setViewSettings({ [visKey]: !visible })}
              sx={{ p: 0.25, ml: 0.5, color: visible ? '#555' : '#333', '&:hover': { color: '#b0bec5' } }}
            >
              {visible
                ? <VisibilityIcon sx={{ fontSize: 14 }} />
                : <VisibilityOffIcon sx={{ fontSize: 14 }} />}
            </IconButton>

            {/* Clear all */}
            <IconButton
              size="small"
              disabled={count === 0}
              onClick={() => requestClear(toolType, tool.label)}
              sx={{
                p: 0.25,
                color: '#555',
                '&:hover': { color: '#f44336' },
                '&.Mui-disabled': { color: '#2a2a2a' },
              }}
            >
              <DeleteSweepIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </ToolRow>
        );
      })}

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1rem' }}>Remove all {pendingClear?.label}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            This will permanently remove all {pendingClear?.label?.toLowerCase()} items from the canvas. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Yes, I'm sure
          </Button>
        </DialogActions>
      </Dialog>
    </Panel>
  );
}
