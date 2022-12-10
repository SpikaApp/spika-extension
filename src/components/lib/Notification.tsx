import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertTitle, CircularProgress, Collapse, IconButton, Stack } from "@mui/material";
import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UIContext } from "../../context/UIContext";

const Notification = (): JSX.Element => {
  const {
    openNotification,
    setOpenNotification,
    notification,
    setNotification,
    notificationExpired,
    setNotificationExpired,
  } = useContext(UIContext);

  // const notification = {
  //   type: "info",
  //   message: "Test notification message",
  //   autoHide: false,
  //   untilExpired: false,
  // };

  const timeout = 5000;

  const expiryTimeout = 2000;

  const location = useLocation();

  useEffect(() => {
    setOpenNotification(false);
  }, [location]);

  useEffect(() => {
    if (notification && notification.autoHide) {
      const timeId = setTimeout(() => {
        handleClose();
      }, timeout);

      return () => {
        clearTimeout(timeId);
      };
    }
  }, [notification]);

  useEffect(() => {
    if (openNotification) {
      if (notification && notification.untilExpired && notificationExpired) {
        const timeId = setTimeout(() => {
          handleClose();
        }, expiryTimeout);

        return () => {
          clearTimeout(timeId);
        };
      }
    }
  }, [notificationExpired]);

  const handleClose = (): void => {
    setNotification(undefined);
    setOpenNotification(false);
    setNotificationExpired(true);
  };

  return (
    <Stack
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        height: "54px",
        py: "2px",
        marginY: "-105px",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        zIndex: 100,
      }}
    >
      {notification && (
        <Collapse in={true} sx={{ width: "375px", height: "50px" }}>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              alignSelf: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Alert
              severity={notification.type ? notification.type : "success"}
              action={
                notification.untilExpired ? (
                  <CircularProgress
                    color={notification.type ? notification.type : "success"}
                    sx={{ display: "flex", mt: "3.5px", mr: "5px" }}
                    size={18}
                    thickness={7}
                  />
                ) : (
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                )
              }
              sx={{ fontWeight: "600", mt: "-1px", position: "absolute", maxWidth: "396px" }}
            >
              {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
              {notification.message}
            </Alert>
          </Stack>
        </Collapse>
      )}
    </Stack>
  );
};

export default Notification;
