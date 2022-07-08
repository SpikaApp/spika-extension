import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const CreateNftDialog = () => {
  const {
    collectionName,
    setCollectionName,
    nftName,
    setNftName,
    nftDescription,
    setNftDescription,
    nftUri,
    setNftUri,
    nftSupply,
    setNftSupply,
    handleCreateNft,
  } = useContext(AccountContext);
  const { openCreateNftDialog, setOpenCreateNftDialog } = useContext(UIContext);

  const handleCancel = () => {
    setCollectionName("");
    setNftName("");
    setNftDescription("");
    setNftSupply("");
    setNftUri("");
    setOpenCreateNftDialog(false);
  };

  return (
    <Dialog open={openCreateNftDialog} onClose={handleCancel}>
      <DialogTitle>
        <Stack sx={{ display: "flex", alignItems: "center" }}>Create NFT</Stack>
      </DialogTitle>
      <DialogContent>
        <Stack component="span" sx={{ maxWidth: 300 }}>
          <TextField
            sx={{ mt: 1, mb: 1.5, width: 250 }}
            size="small"
            id="collectionName"
            label="Collection Name"
            type="string"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: 250 }}
            size="small"
            id="nftName"
            label="NFT Name"
            type="string"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: 250 }}
            size="small"
            id="nftDescription"
            label="Description"
            type="string"
            multiline
            rows={3}
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: 150 }}
            size="small"
            id="nftSupply"
            label="Editions"
            type="number"
            value={nftSupply}
            onChange={(e) => setNftSupply(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            sx={{ mt: 1.5, width: 250 }}
            size="small"
            id="nftUri"
            label="URL"
            type="string"
            value={nftUri}
            onChange={(e) => setNftUri(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleCreateNft}>Create</Button>
      </DialogActions>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default CreateNftDialog;
