import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ImageIcon from '@mui/icons-material/Image';
import { useAppStore } from '../../store/appStore';
import type Konva from 'konva';

interface Props {
  open: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function ExportDialog({ open, onClose, stageRef }: Props) {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportJSON() {
    const state = {
      mode: store.mode,
      backgroundImage: store.backgroundImage,
      walls: store.walls,
      windows: store.windows,
      doors: store.doors,
      areas: store.areas,
      measurements: store.measurements,
      furniture: store.furniture,
      calibration: store.calibration,
      viewSettings: store.viewSettings,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPNG() {
    if (!stageRef.current) return;
    store.setExportingPNG(true);
    // Wait two animation frames so React re-renders the measurement labels before capture
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    store.setExportingPNG(false);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `planit-snapshot-${Date.now()}.png`;
    a.click();
  }

  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const state = JSON.parse(ev.target?.result as string);
        store.importState(state);
        onClose();
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Export / Import</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Export the current project as JSON (for import on another device) or as a PNG image snapshot.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportJSON}
            fullWidth
          >
            Download JSON
          </Button>

          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={exportPNG}
            fullWidth
          >
            Download PNG Snapshot
          </Button>

          <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.08)' }} />

          <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
            Import a previously exported JSON file to restore your project.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            color="secondary"
          >
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importJSON}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
