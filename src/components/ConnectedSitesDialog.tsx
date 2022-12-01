/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { IConnectedApps } from "../interface";
import { getConnectedApps, removeApp } from "../lib/connectedApps";
import { PLATFORM } from "../utils/constants";
import copyToClipboard from "../utils/copyToClipboard";
import shortenAddress from "../utils/shortenAddress";

const ConnectedSitesDialog = (): JSX.Element => {
  const { openConnectedSitesDialog, setOpenConnectedSitesDialog } = useContext(UIContext);
  const { publicAccount } = useContext(AccountContext);
  const [connectedSites, setConnectedSites] = useState<IConnectedApps | undefined>(undefined);

  useEffect(() => {
    if (openConnectedSitesDialog) {
      getConnectedSites();
    }
  }, [openConnectedSitesDialog]);

  const getConnectedSites = async (): Promise<void> => {
    if (PLATFORM === "chrome-extension:") {
      const data = await getConnectedApps(publicAccount!);
      if (data) {
        if (data.urls.length > 0) {
          setConnectedSites(data);
        } else {
          setConnectedSites(undefined);
        }
      } else {
        setConnectedSites(undefined);
      }
    }
  };

  const normalizeUrl = (url: string): string => {
    return url.replace("https://", "");
  };

  const revokeAccess = async (url: string): Promise<void> => {
    await removeApp(publicAccount!, url);
    await getConnectedSites();
  };

  const handleCancel = (): void => {
    setOpenConnectedSitesDialog(false);
  };

  return (
    <Dialog open={openConnectedSitesDialog}>
      <DialogTitle align="center">Manage Connected Sites</DialogTitle>
      <DialogContent sx={{ minHeight: "250px" }}>
        <Stack sx={{ display: "flex", alignItems: "center", mb: "24px" }}>
          <Tooltip title={publicAccount!.account}>
            <Chip
              label={shortenAddress(publicAccount!.account)}
              onClick={() => copyToClipboard(publicAccount!.account)}
            />
          </Tooltip>
        </Stack>
        {connectedSites ? (
          <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "255px" }}>
              {connectedSites!.urls.map((url) => (
                <ListItem key={url}>
                  <ListItemText primary={normalizeUrl(url)} primaryTypographyProps={{ fontSize: "16px" }} />
                  <IconButton
                    sx={{ display: "flex", ml: "190px", position: "absolute" }}
                    onClick={() => revokeAccess(url)}
                  >
                    <Tooltip title="Revoke access">
                      <DeleteIcon />
                    </Tooltip>
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: "48px", maxWidth: "275px" }}>
            This address is not connected to any external sites
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectedSitesDialog;
