import CircleIcon from "@mui/icons-material/Circle";
import DeleteIcon from "@mui/icons-material/Delete";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AptosClient } from "aptos";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { getNetworks, removeNetwork } from "../lib/accountNetworks";
import { spikaClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import { setStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";
import AddCustomNetworkDialog from "./AddCustomNetworkDialog";

const NetworkDialog = () => {
  const { openNetworkDialog, setOpenNetworkDialog, handleAddCustomNetworkUI, somethingChanged, setSomethingChanged } =
    useContext(UIContext);
  const {
    alertSignal,
    currentAddress,
    currentNetwork,
    setCurrentNetwork,
    setCurrentAsset,
    throwAlert,
    setAccountImported,
  } = useContext(AccountContext);
  const { updateAccountAssets, getAccountTokens } = useContext(Web3Context);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState({});
  const [networks, setNetworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(false);
  const _currentNetwork = "currentNetwork";
  const _currentAsset = "currentAsset";

  const handleListItemClick = async (event, index, network) => {
    await getAccountNetworks(true);
    setSelectedIndex(index);
    setSelectedNetwork(network);
    if (!network.chain_id) {
      setNetworkOnline(false);
    } else {
      setNetworkOnline(true);
    }
  };

  useEffect(() => {
    if (openNetworkDialog) {
      getAccountNetworks();
    }
  }, [openNetworkDialog]);

  useEffect(() => {
    if (somethingChanged && openNetworkDialog) {
      getAccountNetworks(true);
      setSomethingChanged(false);
    }
  }, [somethingChanged]);

  useEffect(() => {
    if (alertSignal === 121) {
      clearDialog();
    }
  }, [alertSignal]);

  useEffect(() => {
    if (currentNetwork && openNetworkDialog) {
      updateAccountAssets();
      getAccountTokens();
      setAccountImported(false);
      setCurrentAsset({}); // reset to initial state and set to aptosCoin in AlertDialog
      setStore(PLATFORM, _currentAsset, aptosCoin);
    }
  }, [currentNetwork]);

  const handleChange = async () => {
    setIsLocalLoading(true);
    try {
      const spika = await spikaClient(selectedNetwork);
      await spika.client.getChainId();
      setStore(PLATFORM, _currentNetwork, selectedNetwork);
      setCurrentNetwork(selectedNetwork);
      throwAlert({
        signal: 121,
        title: "Success",
        message: `Network changed to ${selectedNetwork.name}`,
        error: false,
      });
    } catch (error) {
      console.log(error);
      throwAlert({ signal: 122, title: "Network change failed", message: `${error}`, error: true });
    }
    setIsLocalLoading(false);
  };

  const getAccountNetworks = async (silent) => {
    if (!silent) {
      setIsLoading(true);
    }
    const data = await getNetworks(currentAddress);
    const list = data.networks.map(async (network) => {
      const chain_id = await getChainId(network.data.node_url);
      return {
        chain_id,
        ...network,
      };
    });
    const result = await Promise.all(list);
    setNetworks(result);
    if (!silent) {
      setIsLoading(false);
    }
    return result;
  };

  const getChainId = async (nodeUrl) => {
    const client = new AptosClient(nodeUrl);
    try {
      const id = await client.getChainId();
      return id;
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemove = async (network) => {
    await removeNetwork(currentAddress, network);
    setSomethingChanged(true);
  };

  const normalizeAddress = (url) => {
    let address = url.replace("https://", "").replace("/v1", "");
    return address;
  };

  const handleCancel = () => {
    setOpenNetworkDialog(false);
    clearDialog();
  };

  const clearDialog = () => {
    setSelectedIndex("");
    setSelectedNetwork({});
    setNetworks([]);
  };

  return (
    <Dialog open={openNetworkDialog}>
      <DialogTitle align="center">Select Network</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        <Paper
          sx={{
            width: "260px",
            height: "240px",
            bgcolor: "background.paper",
          }}
        >
          {!isLoading ? (
            <List
              component="nav"
              sx={{
                overflow: "hidden",
                overflowY: "visible",
                maxHeight: "230px",
                minHeight: "50px",
              }}
            >
              {networks.map((network) => (
                <Stack key={network.name}>
                  <ListItemButton
                    selected={selectedIndex === network.name}
                    onClick={(event) => handleListItemClick(event, network.name, network)}
                  >
                    <ListItemIcon>
                      {!network.chain_id ? (
                        <Tooltip title={"Offline"}>
                          <CircleIcon
                            sx={{
                              color: "error.main",
                              width: "12px",
                              height: "12px",
                              ml: "-4px",
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title={"Online"}>
                          <CircleIcon
                            sx={{
                              color: "success.main",
                              width: "12px",
                              height: "12px",
                              ml: "-4px",
                            }}
                          />
                        </Tooltip>
                      )}
                    </ListItemIcon>
                    <ListItemText
                      sx={{ ml: "-37px" }}
                      primary={
                        <Stack
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <Stack
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                            }}
                          >
                            <Typography
                              noWrap
                              sx={{
                                maxWidth: "140px",
                              }}
                            >
                              {network.name}
                            </Typography>
                            {network.data.testnet && (
                              <Tooltip title="Test network">
                                <ScienceOutlinedIcon
                                  color="warning"
                                  sx={{
                                    display: "flex",
                                    ml: "4px",
                                    mt: "-1px",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                          {network.data.custom && (
                            <ListItemIcon
                              sx={{
                                position: "absolute",
                                ml: "185px",
                              }}
                            >
                              <Tooltip title="Remove">
                                <IconButton size="small" onClick={() => handleRemove(network)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ListItemIcon>
                          )}
                        </Stack>
                      }
                      secondary={
                        <Typography noWrap variant="subtitle2" color="textSecondary" sx={{ maxWidth: "210px" }}>
                          {normalizeAddress(network.data.node_url)}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </Stack>
              ))}
            </List>
          ) : (
            <CircularProgress sx={{ position: "absolute", mt: "90px", ml: "110px" }} color="inherit" />
          )}
          <List
            component="nav"
            sx={{
              overflow: "hidden",
              overflowY: "visible",
              maxHeight: "200px",
              minHeight: "50px",
            }}
          ></List>
        </Paper>
        <Stack
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 1,
          }}
        >
          <Button variant="outlined" sx={{ mt: 1, mb: 2, width: "180px" }} onClick={handleAddCustomNetworkUI}>
            Add Custom Network
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>

            {networkOnline ? (
              <LoadingButton
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                loading={isLocalLoading}
                loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} />}
                onClick={handleChange}
              >
                Change
              </LoadingButton>
            ) : (
              <Button
                sx={{
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                disabled
              >
                Change
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
      <AddCustomNetworkDialog />
    </Dialog>
  );
};

export default NetworkDialog;