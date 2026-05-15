import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7',
      light: '#81d4fa',
      dark: '#0288d1',
    },
    secondary: {
      main: '#b0bec5',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#9e9e9e',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h6: { fontWeight: 600 },
    body2: { fontSize: '0.8rem' },
    caption: { fontSize: '0.72rem', letterSpacing: '0.04em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
  },
});
