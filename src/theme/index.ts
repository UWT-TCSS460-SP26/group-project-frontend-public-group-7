import { createTheme } from "@mui/material/styles";

/**
 * Default theme configuration for the application.
 * Provided to the tree by `ThemeRegistry` (mounted in `app/layout.tsx`).
 *
 * Key customizations:
 * - Primary color: Blue (#1976d2)
 * - Secondary color: Purple (#9c27b0)
 * - Background: Light gray for better contrast
 * - Typography: Inter (self-hosted via @fontsource/inter, imported in `app/layout.tsx`)
 * - Shape: 8px border radius for consistent rounded corners
 */
export const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F5C518", // IMDb Yellow
      light: "#f7d146",
      dark: "#ab8910",
      contrastText: "#000000",
    },
    secondary: {
      main: "#FFD700", // Gold
      light: "#ffdf33",
      dark: "#b29600",
      contrastText: "#000000",
    },
    background: {
      default: "#000000", // Black background
      paper: "#121212", // Very dark gray for cards
    },
    text: {
      primary: "#F5C518", // Yellow text
      secondary: "#FFFFFF", // Darker yellow for secondary text
      disabled: "#4d4d00",
    },
    error: {
      main: "#ff4444",
    },
    warning: {
      main: "#ffbb33",
    },
    info: {
      main: "#33b5e5",
    },
    success: {
      main: "#00c851",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "2.5rem", // 40px
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem", // 32px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem", // 28px
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      textTransform: "none", // Disable uppercase transformation
      fontWeight: 500,
    },
  },
  spacing: 8, // Base spacing unit: 8px (sx={{ m: 1 }} = 8px, m: 2 = 16px, etc.)
  shape: {
    borderRadius: 8, // Default border radius for buttons, cards, etc.
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  // Per-component overrides below were lifted from `TCSS460-frontend-1` for
  // visual continuity. They aren't part of the Next.js / Auth / RHF lecture
  // story — students reading this file for "how do I theme MUI?" should focus
  // on the `palette` and `typography` blocks above. Trim freely if students
  // copy this theme into their own projects.
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#bdbdbd #f5f5f5",
          "&::-webkit-scrollbar": {
            width: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f5f5f5",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bdbdbd",
            borderRadius: "6px",
            border: "3px solid #f5f5f5",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#9e9e9e",
          },
        },
        a: {
          color: "inherit",
          textDecoration: "none",
        },
      },
    },
    // Default button styles
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    // Default card styles
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
  },
});
