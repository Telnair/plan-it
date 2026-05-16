import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Typography,
  Divider,
  Box,
  Button,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAppStore } from '../../store/appStore';
import { ToolPanel } from '../tools/ToolPanel';
import { ElementsPanel } from './HistoryPanel';

const SidebarWrapper = styled.aside`
  width: 220px;
  flex-shrink: 0;
  background: #1e1e1e;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const Section = styled.div`
  padding: 12px 12px 8px;
`;

// ── Drag-to-adjust pill slider ─────────────────────────────────────────────
interface DragSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
}

function DragSlider({ label, value, min, max, onChange, formatValue }: DragSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const dragState = useRef<{ startX: number; startValue: number } | null>(null);

  const pct = ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setActive(true);
    dragState.current = { startX: e.clientX, startValue: value };
  }, [value]);

  useEffect(() => {
    if (!active) return;

    function onMove(e: MouseEvent) {
      if (!dragState.current || !ref.current) return;
      const width = ref.current.offsetWidth;
      const dx = e.clientX - dragState.current.startX;
      const delta = (dx / width) * (max - min);
      const next = Math.min(max, Math.max(min, dragState.current.startValue + delta));
      onChange(next);
    }

    function onUp() {
      setActive(false);
      dragState.current = null;
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [active, min, max, onChange]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        flex: 1,
        height: 24,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.06)',
        cursor: 'ew-resize',
        overflow: 'hidden',
        userSelect: 'none',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Fill bar */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: `${pct}%`,
        background: 'rgba(79,195,247,0.28)',
        transition: active ? 'none' : 'width 0.05s',
      }} />
      {/* Label / value */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        fontWeight: 500,
        color: active ? '#4fc3f7' : '#9e9e9e',
        pointerEvents: 'none',
      }}>
        {active ? formatValue(value) : label}
      </div>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

export function Sidebar() {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [areasOpen, setAreasOpen] = useState(false);
  const [furnitureOpen, setFurnitureOpen] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      store.setBackgroundImage(ev.target?.result as string, file.name);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  const imageName = store.backgroundImageName;

  return (
    <SidebarWrapper>
      {/* ── BACKGROUND IMAGE ── */}
      <Section>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#6b6b6b' }}>BACKGROUND IMAGE</Typography>
          {store.backgroundImage && (
            <IconButton
              size="small"
              sx={{ p: 0, color: store.viewSettings.showBackgroundImage ? '#4fc3f7' : '#555', '&:hover': { color: '#b0bec5' } }}
              onClick={() => store.setViewSettings({ showBackgroundImage: !store.viewSettings.showBackgroundImage })}
            >
              {store.viewSettings.showBackgroundImage
                ? <VisibilityIcon sx={{ fontSize: 14 }} />
                : <VisibilityOffIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          )}
        </Box>

        {!store.backgroundImage ? (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#b0bec5', fontSize: '0.75rem' }}
            >
              Upload Plan Image
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Filename row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#b0bec5',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {imageName ?? 'Background image'}
              </Typography>
              <Tooltip title="Change image">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ p: 0.25, color: '#555', '&:hover': { color: '#b0bec5' } }}
                >
                  <ImageIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove image">
                <IconButton
                  size="small"
                  onClick={() => store.setBackgroundImage(null)}
                  sx={{ p: 0.25, color: '#555', '&:hover': { color: '#f44336' } }}
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Opacity + Size pill sliders — side by side */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <DragSlider
                label="Opacity"
                value={store.viewSettings.backgroundImageOpacity * 100}
                min={0}
                max={100}
                onChange={(v) => store.setViewSettings({ backgroundImageOpacity: v / 100 })}
                formatValue={(v) => `${Math.round(v)}%`}
              />
              <DragSlider
                label="Size"
                value={store.viewSettings.backgroundImageScale * 100}
                min={50}
                max={200}
                onChange={(v) => store.setViewSettings({ backgroundImageScale: v / 100 })}
                formatValue={(v) => `${Math.round(v)}%`}
              />
            </Box>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </Section>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* ── GRID ── */}
      <Section>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#6b6b6b' }}>GRID</Typography>
          <IconButton
            size="small"
            sx={{ p: 0, color: store.viewSettings.showGrid ? '#4fc3f7' : '#555', '&:hover': { color: '#b0bec5' } }}
            onClick={() => store.setViewSettings({ showGrid: !store.viewSettings.showGrid })}
          >
            {store.viewSettings.showGrid
              ? <VisibilityIcon sx={{ fontSize: 14 }} />
              : <VisibilityOffIcon sx={{ fontSize: 14 }} />}
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <DragSlider
            label="Opacity"
            value={store.viewSettings.gridOpacity}
            min={0}
            max={100}
            onChange={(v) => store.setViewSettings({ gridOpacity: v })}
            formatValue={(v) => `${Math.round(v)}%`}
          />
          <DragSlider
            label="Size"
            value={store.viewSettings.gridSize}
            min={10}
            max={120}
            onChange={(v) => store.setViewSettings({ gridSize: v })}
            formatValue={(v) => `${Math.round(v)}px`}
          />
        </Box>
      </Section>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* ── TOOLS ── */}
      <Section>
        <ToolPanel />
      </Section>

      {/* ── AREAS (collapsible) ── */}
      {store.areas.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <Section>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: areasOpen ? 1 : 0 }}
              onClick={() => setAreasOpen((v) => !v)}
            >
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>AREAS</Typography>
              <IconButton size="small" sx={{ p: 0, color: '#6b6b6b' }}>
                {areasOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
            <Collapse in={areasOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {store.areas.map((area) => (
                  <Box key={area.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: area.color, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#b0bec5', fontSize: '0.75rem' }}>
                        {area.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#4fc3f7' }}>
                        {area.sqMeters.toFixed(1)} m²
                      </Typography>
                      <Tooltip title="Delete area">
                        <DeleteOutlinedIcon
                          sx={{ fontSize: 14, color: '#555', cursor: 'pointer', '&:hover': { color: '#f44336' } }}
                          onClick={() => store.removeArea(area.id)}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Section>
        </>
      )}

      {/* ── FURNITURE (collapsible) ── */}
      {store.furniture.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <Section>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: furnitureOpen ? 1 : 0 }}
              onClick={() => setFurnitureOpen((v) => !v)}
            >
              <Typography variant="caption" sx={{ color: '#6b6b6b' }}>FURNITURE</Typography>
              <IconButton size="small" sx={{ p: 0, color: '#6b6b6b' }}>
                {furnitureOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
            <Collapse in={furnitureOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {store.furniture.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#b0bec5', fontSize: '0.75rem' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Tooltip title="Delete furniture">
                      <DeleteOutlinedIcon
                        sx={{ fontSize: 14, color: '#555', cursor: 'pointer', '&:hover': { color: '#f44336' } }}
                        onClick={() => store.removeFurniture(item.id)}
                      />
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Section>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* ── ELEMENTS ── */}
      <Section>
        <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
          ELEMENTS
        </Typography>
        <ElementsPanel />
      </Section>
    </SidebarWrapper>
  );
}
