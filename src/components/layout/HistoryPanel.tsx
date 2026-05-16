import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Typography, Tooltip, IconButton, Box } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAppStore } from '../../store/appStore';
import type { HistoryAction } from '../../store/types';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 260px;
  overflow-y: auto;
`;

const Row = styled.div<{ $highlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 6px;
  border-radius: 6px;
  background: ${(p) => (p.$highlighted ? 'rgba(79,195,247,0.12)' : 'transparent')};
  outline: ${(p) => (p.$highlighted ? '1px solid rgba(79,195,247,0.4)' : '1px solid transparent')};
  transition: background 0.1s;

  &:hover {
    background: ${(p) => (p.$highlighted ? 'rgba(79,195,247,0.16)' : 'rgba(255,255,255,0.04)')};
  }
`;

const LineIcon = styled.div<{ $width: number; $dashed: boolean; $color: string }>`
  width: 22px;
  height: ${(p) => Math.min(p.$width, 5)}px;
  flex-shrink: 0;
  border-radius: 1px;
  background: ${(p) =>
    p.$dashed
      ? `repeating-linear-gradient(90deg, ${p.$color} 0, ${p.$color} 4px, transparent 4px, transparent 7px)`
      : p.$color};
`;

const LabelText = styled(Typography)`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.76rem !important;
  color: #c0c0c0 !important;
`;


const TOOL_ICON_PROPS: Record<string, { width: number; dashed: boolean; color: string }> = {
  wall_fixed:   { width: 5, dashed: false, color: '#1a1a1a' },
  wall_movable: { width: 3, dashed: false, color: '#9e9e9e' },
  wall_canal:   { width: 5, dashed: false, color: '#1a1a1a' },
  window:       { width: 2, dashed: true,  color: '#9e9e9e' },
  door:         { width: 2, dashed: false, color: '#3d3d3d' },
  area_select:      { width: 2, dashed: true,  color: '#4fc3f7' },
  furniture_select: { width: 2, dashed: true,  color: '#ffb74d' },
  measure:          { width: 1, dashed: true,  color: '#4fc3f7' },
};


function ElementRow({ entry }: { entry: HistoryAction }) {
  const { highlightedElementId, setHighlightedElement, removeHistoryEntry } = useAppStore();
  const isHighlighted = highlightedElementId === entry.elementId;
  const iconProps = TOOL_ICON_PROPS[entry.toolType] ?? TOOL_ICON_PROPS.wall_fixed;

  return (
    <Row $highlighted={isHighlighted}>
      <LineIcon $width={iconProps.width} $dashed={iconProps.dashed} $color={iconProps.color} />

      <LabelText variant="body2">{entry.label}</LabelText>

      <Tooltip title={isHighlighted ? 'Stop highlighting' : 'Highlight on canvas'}>
        <IconButton
          size="small"
          onClick={() => setHighlightedElement(isHighlighted ? null : entry.elementId)}
          sx={{ p: 0.25, color: isHighlighted ? '#4fc3f7' : '#555', '&:hover': { color: '#4fc3f7' } }}
        >
          {isHighlighted ? (
            <VisibilityIcon sx={{ fontSize: 14 }} />
          ) : (
            <VisibilityOffIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip title="Remove this element">
        <IconButton
          size="small"
          onClick={() => removeHistoryEntry(entry.id)}
          sx={{ p: 0.25, color: '#555', '&:hover': { color: '#f44336' } }}
        >
          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Row>
  );
}

export function ElementsPanel() {
  const history = useAppStore((s) => s.history);
  const walls = useAppStore((s) => s.walls);
  const windows = useAppStore((s) => s.windows);
  const doors = useAppStore((s) => s.doors);
  const areas = useAppStore((s) => s.areas);
  const measurements = useAppStore((s) => s.measurements);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Derive the list from history entries that still have a matching canvas element.
  // This guarantees the list is always in sync with what's actually on the canvas.
  const furniture = useAppStore((s) => s.furniture);

  const elements = history.filter((entry) => {
    if (entry.elementType === 'wall')        return walls.some((w) => w.id === entry.elementId);
    if (entry.elementType === 'window')      return windows.some((w) => w.id === entry.elementId);
    if (entry.elementType === 'door')        return doors.some((d) => d.id === entry.elementId);
    if (entry.elementType === 'area')        return areas.some((a) => a.id === entry.elementId);
    if (entry.elementType === 'furniture')   return furniture.some((f) => f.id === entry.elementId);
    if (entry.elementType === 'measurement') return measurements.some((m) => m.id === entry.elementId);
    return false;
  });

  // Auto-scroll to newest (bottom) when an element is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [elements.length]);

  if (elements.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: '#3d3d3d', px: 0.5 }}>
        No elements yet
      </Typography>
    );
  }

  return (
    <Box>
      <ListWrapper>
        {elements.map((entry) => (
          <ElementRow key={entry.id} entry={entry} />
        ))}
        <div ref={bottomRef} />
      </ListWrapper>
    </Box>
  );
}
