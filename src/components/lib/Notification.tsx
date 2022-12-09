import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertTitle, Box, Collapse, IconButton } from "@mui/material";
import { useContext, useEffect } from "react";
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

  const timeout = 5000;

  const expiryTimeout = 2000;

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
    <Box
      sx={{
        width: "100%",
        position: "absolute",
        marginY: "-105px",
      }}
    >
      {notification && (
        <Collapse in={openNotification} sx={{ width: "100%" }}>
          <Alert
            severity={notification.type ? notification.type : "success"}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  handleClose();
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ fontWeight: "600", mt: "-1px", position: "absolute", maxWidth: "396px" }}
          >
            {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
            {notification.message}
          </Alert>
        </Collapse>
      )}
    </Box>
  );
};

export default Notification;
