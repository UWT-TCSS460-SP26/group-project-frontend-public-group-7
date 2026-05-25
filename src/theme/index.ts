import { createTheme } from "@mui/material/styles";

export const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F5C518", // IMDb yellow
      light: "#f7d155",
      dark: "#c9a000",
      contrastText: "#000000",
    },
    secondary: {
      main: "#F5C518",
      contrastText: "#000000",
    },
    background: {
      default: "#121212",
      paper: "#1f1f1f",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a0a0a0",
      disabled: "#555555",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#F5C518",
    },
    info: {
      main: "#29b6f6",
    },
    success: {
      main: "#66bb6a",
    },
    divider: "#2c2c2c",
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "2rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 1.43 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  spacing: 8,
  shape: { borderRadius: 8 },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#3a3a3a #121212",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "#121212" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#3a3a3a", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555555" },
        },
        a: { color: "inherit", textDecoration: "none" },
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" } } },
  },
});
