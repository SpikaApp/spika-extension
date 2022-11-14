import { createTheme, Theme } from "@mui/material";

export const lightTheme: Theme = createTheme({
  shape: {
    borderRadius: 8,
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
    MuiDialogContent: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          input: {
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              display: "none",
            },
          },
          borderRadius: "8px",
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          input: {
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              display: "none",
            },
            color: "#636363",
          },
          borderRadius: "8px",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#1F2CFF",
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
      paper: "#f5f5f5",
    },
    text: {
      primary: "#232323",
      secondary: "#636363",
    },
  },
});

export const darkTheme: Theme = createTheme({
  shape: {
    borderRadius: 8,
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
    MuiDialogContent: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          input: {
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              display: "none",
            },
          },
          borderRadius: "8px",
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          input: {
            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              display: "none",
            },
            color: "#9e9e9e",
          },
          borderRadius: "8px",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#bcbcbc",
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
      secondary: "#9e9e9e",
    },
  },
});
