import styled from 'styled-components';
import { AppBar, Toolbar, Typography, Button, Tooltip, Box, Divider } from '@mui/material';
import ViewIn3dIcon from '@mui/icons-material/ViewInAr';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UndoIcon from '@mui/icons-material/Undo';
import { useAppStore } from '../../store/appStore';
import { Sidebar } from './Sidebar';

interface Props {
  children: React.ReactNode;
  onExport: () => void;
}

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #121212;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CanvasArea = styled.main`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
`;

const AppTitle = styled(Typography)`
  font-weight: 700 !important;
  letter-spacing: -0.5px;
  span {
    color: #4fc3f7;
  }
`;

export function AppShell({ children, onExport }: Props) {
  const { mode, setMode, resetState, undo, canUndo } = useAppStore();

  return (
    <Shell>
      <AppBar position="static" sx={{ bgcolor: '#1e1e1e', borderBottom: '1px solid rgba(255,255,255,0.08)', zIndex: 10 }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <AppTitle variant="h6" sx={{ flexGrow: 0, mr: 2 }}>
            Plan<span>It</span>
          </AppTitle>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Tooltip title="Draw walls, windows and doors">
              <Button
                size="small"
                variant={mode === 'draw' ? 'contained' : 'text'}
                startIcon={<EditIcon />}
                onClick={() => setMode('draw')}
                color={mode === 'draw' ? 'primary' : 'inherit'}
              >
                Draw
              </Button>
            </Tooltip>

            <Tooltip title="Edit the plan — manage wall visibility and areas">
              <Button
                size="small"
                variant={mode === 'plan' ? 'contained' : 'text'}
                startIcon={<CheckCircleOutlinedIcon />}
                onClick={() => setMode('plan')}
                color={mode === 'plan' ? 'primary' : 'inherit'}
              >
                Plan
              </Button>
            </Tooltip>

            <Tooltip title="Explore the apartment in 3D">
              <Button
                size="small"
                variant={mode === 'tour3d' ? 'contained' : 'text'}
                startIcon={<ViewIn3dIcon />}
                onClick={() => setMode('tour3d')}
                color={mode === 'tour3d' ? 'primary' : 'inherit'}
              >
                3D Tour
              </Button>
            </Tooltip>
          </Box>

          <Tooltip title="Undo last action (⌘Z / Ctrl+Z)">
            <span>
              <Button
                size="small"
                startIcon={<UndoIcon />}
                onClick={undo}
                disabled={!canUndo()}
                color="inherit"
                sx={{ opacity: canUndo() ? 1 : 0.35 }}
              >
                Undo
              </Button>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />

          <Tooltip title="Export / Import">
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={onExport}
              color="inherit"
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.2)', mr: 1 }}
            >
              Export
            </Button>
          </Tooltip>

          <Tooltip title="Reset all data">
            <Button
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={() => {
                if (confirm('Reset all data? This cannot be undone.')) resetState();
              }}
              color="inherit"
              sx={{ opacity: 0.6 }}
            >
              Reset
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Body>
        {mode !== 'tour3d' && <Sidebar />}
        <CanvasArea>{children}</CanvasArea>
      </Body>
    </Shell>
  );
}
