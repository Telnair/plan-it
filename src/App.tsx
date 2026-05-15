import { useRef, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type Konva from 'konva';
import { muiTheme } from './theme/muiTheme';
import { GlobalStyles } from './theme/GlobalStyles';
import { AppShell } from './components/layout/AppShell';
import { PlanCanvas } from './components/canvas/PlanCanvas';
import { RoomScene } from './components/viewer3d/RoomScene';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { useAppStore } from './store/appStore';
import { useUndoShortcut } from './hooks/useUndoShortcut';

export default function App() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const mode = useAppStore((s) => s.mode);
  useUndoShortcut();

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <GlobalStyles />
      <AppShell onExport={() => setExportOpen(true)}>
        {mode === 'tour3d' ? (
          <RoomScene />
        ) : (
          <PlanCanvas stageRef={stageRef} />
        )}
      </AppShell>
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        stageRef={stageRef}
      />
    </ThemeProvider>
  );
}
