import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#000a12",
    },
    divider: "#000a12",
    background: {
      default: "#fafafa",
      paper: "#eceff1",
    },
    text: {
      primary: "#000a12",
      secondary: "#29434e",
    },
    link: "#34515e",
  },
});

export const darkTheme = createTheme({
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#cfd8dc",
    },
    divider: "#cfd8dc",
    background: {
      default: "#000a12",
      paper: "#000a12",
    },
    text: {
      primary: "#cfd8dc",
      secondary: "#9ea7aa",
    },
    link: "#607d8b",
  },
});
