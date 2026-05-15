import styled from 'styled-components';
import { Tooltip, Typography, Divider } from '@mui/material';
import { useAppStore } from '../../store/appStore';
import { TOOL_DEFS, AREA_SELECT_TOOL } from './TOOLS';
import type { ToolType, GrayShade } from '../../store/types';
import { GRAY_SHADES } from '../../store/types';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToolBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
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

const ColorPalette = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px 0;
`;

const ColorSwatch = styled.button<{ $color: string; $active: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 2px solid ${(p) => (p.$active ? '#4fc3f7' : 'transparent')};
  background: ${(p) => p.$color};
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.15);
  }
`;

export function ToolPanel() {
  const { activeToolType, activeColor, setActiveTool, setActiveColor, mode } = useAppStore();
  const showAreaTool = mode === 'plan';

  const tools = showAreaTool ? [...TOOL_DEFS, AREA_SELECT_TOOL] : TOOL_DEFS;

  return (
    <Panel>
      <Typography variant="caption" sx={{ color: '#6b6b6b', mb: 0.5, px: 0.5 }}>
        TOOLS
      </Typography>
      {tools.map((tool) => (
        <Tooltip key={tool.type} title={tool.description} placement="right">
          <ToolBtn
            $active={activeToolType === tool.type}
            onClick={() => setActiveTool(tool.type as ToolType)}
          >
            <LinePreview
              $width={Math.min(tool.strokeWidth, 6)}
              $dashed={tool.dashEnabled}
              $color={activeToolType === tool.type ? '#4fc3f7' : '#6b6b6b'}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{tool.label}</span>
          </ToolBtn>
        </Tooltip>
      ))}

      <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.08)' }} />

      <Typography variant="caption" sx={{ color: '#6b6b6b', mb: 0.5, px: 0.5 }}>
        COLOR
      </Typography>
      <ColorPalette>
        {GRAY_SHADES.map((shade) => (
          <Tooltip key={shade} title={shade} placement="right">
            <ColorSwatch
              $color={shade}
              $active={activeColor === shade}
              onClick={() => setActiveColor(shade as GrayShade)}
            />
          </Tooltip>
        ))}
      </ColorPalette>
    </Panel>
  );
}
