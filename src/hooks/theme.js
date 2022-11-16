import {
  ThemeProvider,
  createTheme,
  experimental_sx as sx,
} from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: sx({
          color: "#ffffff",
          backgroundColor: "#000000",
          borderRadius: "5px",
          fontSize: "14px",
          py: "18px",
        }),
        label: sx({
          padding: "10px",
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        secondary: sx({
          color: "#ffffff",
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: sx({
          bgcolor: "transparent",
          background: "transparent",
          boxShadow: 0,
        }),
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: sx({
          background: "transparent",
          bgcolor: "#0c0c0c",
          borderRadius: "20px",
          "&::before": {
            background: "transparent",
          },
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: sx({
          borderRadius: "20px",
        }),
      },
    },
  },
});
