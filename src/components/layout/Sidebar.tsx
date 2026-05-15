import React, { useRef } from 'react';
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
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useAppStore } from '../../store/appStore';
import { ToolPanel } from '../tools/ToolPanel';
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

      {store.mode === 'plan' && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <Section>
            <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
              WALL VISIBILITY
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: '#b0bec5' }}>
                Show movable
              </Typography>
              <Switch
                size="small"
                checked={store.viewSettings.showMovableWalls}
                onChange={(e) => store.setViewSettings({ showMovableWalls: e.target.checked })}
                color="primary"
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#b0bec5', mb: 0.5 }}>
                Opacity
              </Typography>
              <Slider
                size="small"
                value={store.viewSettings.movableWallsOpacity * 100}
                onChange={(_, v) =>
                  store.setViewSettings({ movableWallsOpacity: (v as number) / 100 })
                }
                disabled={!store.viewSettings.showMovableWalls}
                sx={{ color: '#4fc3f7' }}
              />
            </Box>
          </Section>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Section>
        <Typography variant="caption" sx={{ color: '#6b6b6b', display: 'block', mb: 1 }}>
          STATS
        </Typography>
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
    </SidebarWrapper>
  );
}
