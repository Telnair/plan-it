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
import ChairIcon from '@mui/icons-material/Chair';
import { useAppStore } from '../../store/appStore';
import { polygonBoundingBox } from '../../utils/geometry';
import { pxToMm, formatMm } from '../../utils/measurement';
import type { Point } from '../../store/types';

const FURNITURE_COLORS = [
  'rgba(255,183,77,0.35)',
  'rgba(121,85,72,0.35)',
  'rgba(165,214,167,0.35)',
  'rgba(206,147,216,0.35)',
  'rgba(255,138,101,0.35)',
  'rgba(128,203,196,0.35)',
];

let colorIdx = 0;

interface Props {
  open: boolean;
  polygon: Point[];
  onClose: () => void;
}

export function FurnitureNameDialog({ open, polygon, onClose }: Props) {
  const { addFurniture, setPendingFurniturePolygon, calibration } = useAppStore();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  let dimensionLabel: string | null = null;
  if (calibration && polygon.length >= 2) {
    const bb = polygonBoundingBox(polygon);
    const wMm = pxToMm(bb.maxX - bb.minX, calibration.pixelsPerMm);
    const hMm = pxToMm(bb.maxY - bb.minY, calibration.pixelsPerMm);
    dimensionLabel = `${formatMm(wMm)} × ${formatMm(hMm)}`;
  }

  function handleConfirm() {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    addFurniture({
      name: name.trim(),
      polygon,
      color: FURNITURE_COLORS[colorIdx++ % FURNITURE_COLORS.length],
    });
    setPendingFurniturePolygon([]);
    setName('');
    setError('');
    onClose();
  }

  function handleCancel() {
    setPendingFurniturePolygon([]);
    setName('');
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChairIcon sx={{ color: '#ffb74d' }} />
        Name This Furniture
      </DialogTitle>
      <DialogContent>
        {dimensionLabel && (
          <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
            Dimensions: <strong style={{ color: '#ffb74d' }}>{dimensionLabel}</strong>
          </Typography>
        )}
        {!dimensionLabel && (
          <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
            Dimensions will be shown once the scale is calibrated.
          </Typography>
        )}
        <TextField
          autoFocus
          label="Furniture name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          error={!!error}
          helperText={error}
          fullWidth
          placeholder="e.g. Sofa, Bed, Desk"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" sx={{ background: '#ffb74d', '&:hover': { background: '#ffa726' } }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
