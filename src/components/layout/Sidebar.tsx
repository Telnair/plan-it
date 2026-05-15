import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Typography,
  Divider,
  Switch,
  Slider,
  Box,
  Button,
  Tooltip,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAppStore } from '../../store/appStore';
import { ToolPanel } from '../tools/ToolPanel';
import { HistoryPanel } from './HistoryPanel';
import { selectFixedWalls, selectMovableWalls, selectTotalArea } from '../../store/selectors';

const SidebarWrapper = styled.aside`
  width: 220px;
  flex-shrink: 0;
  background: #1e1e1e;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Section = styled.div`
  padding: 12px 12px 8px;
`;

export function Sidebar() {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  const fixedWalls = selectFixedWalls(store);
  const movableWalls = selectMovableWalls(store);
  const totalArea = selectTotalArea(store);

      function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      store.setBackgroundImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <SidebarWrapper>
      <Section>
        <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
          BACKGROUND IMAGE
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            sx={{ borderColor: 'rgba(255,255,255,0.15)', color: '#b0bec5', fontSize: '0.75rem' }}
          >
            {store.backgroundImage ? 'Change Image' : 'Upload Plan Image'}
          </Button>
          {store.backgroundImage && (
            <>
              <Box>
                <Typography variant="body2" sx={{ color: '#b0bec5', mb: 0.5 }}>
                  Opacity
                </Typography>
                <Slider
                  size="small"
                  value={store.viewSettings.backgroundImageOpacity * 100}
                  onChange={(_, v) =>
                    store.setViewSettings({ backgroundImageOpacity: (v as number) / 100 })
                  }
                  sx={{ color: '#4fc3f7' }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#b0bec5', mb: 0.5 }}>
                  Size
                </Typography>
                <Slider
                  size="small"
                  min={50}
                  max={200}
                  value={store.viewSettings.backgroundImageScale * 100}
                  onChange={(_, v) =>
                    store.setViewSettings({ backgroundImageScale: (v as number) / 100 })
                  }
                  sx={{ color: '#4fc3f7' }}
                />
              </Box>
              <Button
                size="small"
                startIcon={<DeleteOutlinedIcon />}
                onClick={() => store.setBackgroundImage(null)}
                color="error"
                fullWidth
                sx={{ fontSize: '0.75rem' }}
              >
                Remove Image
              </Button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </Box>
      </Section>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Section>
        <ToolPanel />
      </Section>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Section>
        <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
          VISIBILITY
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: '#b0bec5' }}>
            Show areas
          </Typography>
          <Switch
            size="small"
            checked={store.viewSettings.showAreas}
            onChange={(e) => store.setViewSettings({ showAreas: e.target.checked })}
            color="primary"
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#b0bec5' }}>
            Show measurements
          </Typography>
          <Switch
            size="small"
            checked={store.viewSettings.showMeasurements}
            onChange={(e) => store.setViewSettings({ showMeasurements: e.target.checked })}
            color="primary"
          />
        </Box>
      </Section>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Section>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', mb: statsOpen ? 1 : 0 }}
          onClick={() => setStatsOpen((v) => !v)}
        >
          <Typography variant="caption" sx={{ color: '#6b6b6b' }}>
            STATS
          </Typography>
          <IconButton size="small" sx={{ p: 0, color: '#6b6b6b' }}>
            {statsOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
        <Collapse in={statsOpen}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>Fixed walls</Typography>
              <Chip label={fixedWalls.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>Movable walls</Typography>
              <Chip label={movableWalls.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>Windows</Typography>
              <Chip label={store.windows.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>Doors</Typography>
              <Chip label={store.doors.length} size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
            </Box>
            {totalArea > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#9e9e9e' }}>Total area</Typography>
                <Chip
                  label={`${totalArea.toFixed(1)} m²`}
                  size="small"
                  color="primary"
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              </Box>
            )}
            {store.calibration && (
              <Typography variant="caption" sx={{ color: '#4fc3f7', mt: 0.5 }}>
                Calibrated ✓
              </Typography>
            )}
          </Box>
        </Collapse>
      </Section>

      {store.areas.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <Section>
            <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
              AREAS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {store.areas.map((area) => (
                <Box key={area.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: area.color,
                        flexShrink: 0,
                      }}
                    />
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
          </Section>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Section>
        <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
          HISTORY
        </Typography>
        <HistoryPanel />
      </Section>
    </SidebarWrapper>
  );
}
