import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
  shape: {
    borderRadius: "8px",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "27px",
          borderBottom: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          height: "44px",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperFullScreen: {
          borderRadius: "0",
        },
        paper: {
          borderRadius: "22px",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#212121",
    },
    secondary: {
      main: "#FAFAFA",
    },
    divider: "#212121",
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#232323",
      secondary: "#212121",
    },
    link: "#1F2CFF",
  },
});

// DARK MODE
export const darkTheme = createTheme({
  shape: {
    borderRadius: "8px",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "27px",
          borderBottom: "none",
          background: "#484848",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          height: "44px",
          color: "#FFFFFF",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperFullScreen: {
          borderRadius: "0",
        },
        paper: {
          borderRadius: "22px",
        },
      },
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: "#FFFFFF",
    },
    divider: "#9E9E9E",
    background: {
      default: "#232323",
      paper: "#484848",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#FFFFFF",
    },
    link: "#bcbcbc",
  },
});
