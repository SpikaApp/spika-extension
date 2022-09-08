import { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Stack,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Paper,
} from "@mui/material";
import pixel_coin from "../assets/pixel_coin.png";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import coin, { coinStore, coinInfo } from "../lib/coin";
import { client } from "../lib/client";
import { setStore } from "../lib/store";
import { setAsset } from "../lib/asset_store";
import { PLATFORM } from "../utils/constants";

const AddAssetDialog = () => {
  const { openAddAssetDialog, setOpenAddAssetDialog, darkMode } = useContext(UIContext);
  const { setIsLoading, currentAddress, currentAsset, setCurrentAsset, throwAlert } =
    useContext(AccountContext);
  const { getBalance } = useContext(Web3Context);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [coinType, setCoinType] = useState("");

  const _currentAsset = "currentAsset";

  const handleListItemClick = (event, index, asset) => {
    setSelectedIndex(index);
    setSelectedAsset(asset);
  };

  useEffect(() => {
    handleGetBalance();
  }, [currentAsset]);

  const handleGetBalance = async () => {
    setIsLoading(true);
    await getBalance();
    setIsLoading(false);
  };

  const handleAddCustomToken = async () => {
    setIsCustomToken(true);
  };

  const handleAddAsset = async () => {
    if (isCustomToken) {
      try {
        const _address = coinType.split("::")[0];
        const custom = await client.getAccountResource(_address, coinInfo(coinType));
        const result = {
          type: coinType,
          data: {
            name: `${custom.data.name}`,
            symbol: `${custom.data.symbol}`,
            decimals: custom.data.decimals,
            logo: pixel_coin,
            logo_alt: pixel_coin,
          },
        };
        setCurrentAsset(result);
        setAsset(currentAddress, result);
        setStore(PLATFORM, _currentAsset, result);
        handleCancel();
        throwAlert(102, "Success", `New custom asset ${result.data.name} successfully added.`);
      } catch (error) {
        console.log(error);
        throwAlert(103, "Error", `${error}`);
      }
    } else {
      if (selectedIndex !== "") {
        setAsset(currentAddress, selectedAsset);
        setCurrentAsset(selectedAsset);
        setStore(PLATFORM, _currentAsset, selectedAsset);
        handleCancel();
        throwAlert(101, "Success", `New asset ${selectedAsset.data.name} successfully added.`);
      } else {
        throwAlert(104, "Error", "Select asset from the list or add custom token to continue.");
      }
    }
  };

  const handleCancel = () => {
    setOpenAddAssetDialog(false);
    setSelectedIndex("");
    setSelectedAsset([]);
    setIsCustomToken(false);
    setCoinType("");
  };

  return (
    <Dialog open={openAddAssetDialog}>
      {isCustomToken ? (
        <DialogTitle align="center">Add Custom Token</DialogTitle>
      ) : (
        <DialogTitle align="center">Import Asset</DialogTitle>
      )}
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
        {isCustomToken ? (
          <form>
            <input hidden type="text" autoComplete="username" value={undefined}></input>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextField
                sx={{ mt: 1, mr: 2, ml: 2, width: 260 }}
                InputLabelProps={{ shrink: true }}
                multiline
                rows={3}
                label="Asset type"
                placeholder="0x1::aptos_coin::AptosCoin"
                autoFocus={false}
                value={coinType}
                onChange={(e) => setCoinType(e.target.value)}
              />
            </Stack>
          </form>
        ) : (
          <Paper sx={{ width: "260px", bgcolor: "background.paper" }}>
            <List component="nav">
              {coin.map((asset) => (
                <Stack key={asset.type}>
                  <ListItemButton
                    selected={selectedIndex === asset.data.name}
                    onClick={(event) => handleListItemClick(event, asset.data.name, asset)}
                  >
                    <ListItemIcon>
                      <Box
                        component="img"
                        src={darkMode ? asset.data.logo_alt : asset.data.logo}
                        sx={{ width: 24, height: 24 }}
                      ></Box>
                    </ListItemIcon>
                    <ListItemText primary={`${asset.data.name} (${asset.data.symbol})`} />
                  </ListItemButton>
                </Stack>
              ))}
            </List>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack>
          {!isCustomToken && (
            <Stack
              sx={{
                display: "flex",

                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Button onClick={handleAddCustomToken}>Add Custom Token</Button>
            </Stack>
          )}
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: 2, mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              sx={{
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "115px",
                ml: 4,
              }}
              variant="contained"
              onClick={handleAddAsset}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default AddAssetDialog;
