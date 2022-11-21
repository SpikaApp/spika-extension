import { useContext, useState } from "react";
import { Button, Dialog, DialogContent, DialogActions, DialogTitle, Stack, TextField } from "@mui/material";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { setNetwork } from "../lib/accountNetworks";

const AddCustomNetworkDialog = (): JSX.Element => {
  const { openAddCustomNetworkDialog, setOpenAddCustomNetworkDialog, setSomethingChanged } = useContext(UIContext);
  const { currentAddress } = useContext(AccountContext);
  const [networkName, setNetworkName] = useState<string>("");
  const [nodeUrl, setNodeUrl] = useState<string>("");
  const [faucetUrl, setFaucetUrl] = useState<string>("");

  const handleAddNetwork = async (): Promise<void> => {
    const customNetwork = {
      name: networkName,
      data: {
        node_url: nodeUrl,
        faucet_url: faucetUrl,
        custom: true,
        testnet: true,
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await setNetwork(currentAddress!, customNetwork);
    setSomethingChanged(true);
    setOpenAddCustomNetworkDialog(false);
    clearNetworkData();
  };

  const handleCancel = (): void => {
    setOpenAddCustomNetworkDialog(false);
    clearNetworkData();
  };

  const clearNetworkData = (): void => {
    setNodeUrl("");
    setFaucetUrl("");
    setNetworkName("");
  };

  return (
    <Dialog open={openAddCustomNetworkDialog}>
      <DialogTitle align="center">Add Custom Network</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
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
            <Stack>
              <TextField
                sx={{ mt: 1, mr: 2, ml: 2, width: 260 }}
                rows={1}
                label="Network name"
                autoFocus={false}
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
              />
              <TextField
                sx={{ mt: 2, mr: 2, ml: 2, width: 260 }}
                label="Node URL"
                autoFocus={false}
                value={nodeUrl}
                onChange={(e) => setNodeUrl(e.target.value)}
              />
              <TextField
                sx={{ mt: 2, mr: 2, ml: 2, width: 260 }}
                label="Faucet URL"
                autoFocus={false}
                value={faucetUrl}
                onChange={(e) => setFaucetUrl(e.target.value)}
              />
            </Stack>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mb: 2 }}>
            <Button sx={{ width: "115px" }} variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>

            {networkName !== "" && nodeUrl !== "" && faucetUrl !== "" ? (
              <Button
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                onClick={handleAddNetwork}
              >
                Add
              </Button>
            ) : (
              <Button
                sx={{
                  width: "115px",
                  ml: 4,
                }}
                variant="contained"
                disabled
              >
                Add
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomNetworkDialog;
