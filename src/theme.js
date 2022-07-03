import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
  palette: {
    primary: {
      main: "#1760a5",
      light: "skyblue",
    },
    secondary: {
      main: "#15c630",
    },
    alt: {
      main: "#999",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    alt: {
      main: "#999",
    },
  },
});
