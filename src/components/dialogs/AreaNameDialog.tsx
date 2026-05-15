import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import { useAppStore } from '../../store/appStore';
import { polygonArea, pxAreaToSqMeters } from '../../utils/geometry';
import type { Point } from '../../store/types';

const AREA_COLORS = [
  'rgba(79,195,247,0.35)',
  'rgba(129,199,132,0.35)',
  'rgba(255,183,77,0.35)',
  'rgba(240,98,146,0.35)',
  'rgba(186,104,200,0.35)',
  'rgba(77,182,172,0.35)',
];

let colorIdx = 0;

interface Props {
  open: boolean;
  polygon: Point[];
  onClose: () => void;
}

export function AreaNameDialog({ open, polygon, onClose }: Props) {
  const { addArea, setPendingAreaPolygon, calibration } = useAppStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const pxArea = polygonArea(polygon);
  const sqM = calibration ? pxAreaToSqMeters(pxArea, calibration.pixelsPerMm) : null;

  function handleConfirm() {
    if (!name.trim()) {
      setError('Please enter a room name');
      return;
    }
    addArea({
      name: name.trim(),
      polygon,
      sqMeters: sqM ?? 0,
      color: AREA_COLORS[colorIdx++ % AREA_COLORS.length],
    });
    setPendingAreaPolygon([]);
    setName('');
    setError('');
    onClose();
  }

  function handleCancel() {
    setPendingAreaPolygon([]);
    setName('');
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GridViewIcon sx={{ color: '#4fc3f7' }} />
        Name This Area
      </DialogTitle>
      <DialogContent>
        {sqM !== null && (
          <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
            Calculated area: <strong style={{ color: '#4fc3f7' }}>{sqM.toFixed(2)} m²</strong>
          </Typography>
        )}
        {sqM === null && (
          <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
            Area will be estimated once the scale is calibrated.
          </Typography>
        )}
        <TextField
          autoFocus
          label="Room name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          error={!!error}
          helperText={error}
          fullWidth
          placeholder="e.g. Living Room"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">Save Area</Button>
      </DialogActions>
    </Dialog>
  );
}
