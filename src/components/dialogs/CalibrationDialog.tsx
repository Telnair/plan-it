import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import { useAppStore } from '../../store/appStore';
import { dist } from '../../utils/geometry';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CalibrationDialog({ open, onClose }: Props) {
  const { pendingCalibrationLine, setCalibration, setPendingCalibrationLine } =
    useAppStore();
  const store = useAppStore();
  const [mmValue, setMmValue] = useState('');
  const [error, setError] = useState('');

  function handleConfirm() {
    const mm = parseFloat(mmValue);
    if (!mm || mm <= 0) {
      setError('Please enter a positive number');
      return;
    }
    if (!pendingCalibrationLine) return;

    const pxLength = dist(
      { x: pendingCalibrationLine.x1, y: pendingCalibrationLine.y1 },
      { x: pendingCalibrationLine.x2, y: pendingCalibrationLine.y2 }
    );
    const pixelsPerMm = pxLength / mm;
    setCalibration({ pixelsPerMm });

    // Commit the line to the store
    if (pendingCalibrationLine.tool === 'wall_fixed' || pendingCalibrationLine.tool === 'wall_movable') {
      store.addWall(pendingCalibrationLine);
    } else if (pendingCalibrationLine.tool === 'window') {
      store.addWindow(pendingCalibrationLine);
    } else if (pendingCalibrationLine.tool === 'door') {
      store.addDoor({ ...pendingCalibrationLine, tool: 'door', openingAngleDeg: 90, openingDirection: 1 });
    }

    setPendingCalibrationLine(null);
    setMmValue('');
    setError('');
    onClose();
  }

  function handleCancel() {
    setPendingCalibrationLine(null);
    setMmValue('');
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StraightenIcon sx={{ color: '#4fc3f7' }} />
        Calibrate Scale
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#9e9e9e', mb: 2 }}>
          You just drew your first line. Enter its real-world length in millimeters to calibrate the
          scale for all future measurements.
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            background: 'rgba(79,195,247,0.06)',
            border: '1px solid rgba(79,195,247,0.2)',
            mb: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#4fc3f7' }}>
            Tip: Use a known wall length (e.g. 3500 for 3.5 metres)
          </Typography>
        </Box>
        <TextField
          autoFocus
          label="Length in mm"
          type="number"
          value={mmValue}
          onChange={(e) => {
            setMmValue(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          error={!!error}
          helperText={error}
          fullWidth
          slotProps={{ htmlInput: { min: 1 } }}
          placeholder="e.g. 3500"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Set Scale
        </Button>
      </DialogActions>
    </Dialog>
  );
}
