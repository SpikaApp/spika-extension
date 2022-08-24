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
import { Web3Context } from "../context/Web3Context";

const CreateNftDialog = () => {
  const { openCreateNftDialog, setOpenCreateNftDialog } = useContext(UIContext);
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
  } = useContext(Web3Context);

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
        <Stack
          component="span"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "300px",
          }}
        >
          <TextField
            sx={{ mt: 1, mb: 1.5, width: "275px" }}
            id="collectionName"
            label="Collection Name"
            type="string"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            id="nftName"
            label="NFT Name"
            type="string"
            value={nftName}
            onChange={(e) => setNftName(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            id="nftDescription"
            label="Description"
            type="string"
            multiline
            rows={1}
            value={nftDescription}
            onChange={(e) => setNftDescription(e.target.value)}
          />
          <TextField
            sx={{
              mt: 1.5,
              mb: 1.5,
              width: "275px",
            }}
            id="nftSupply"
            label="Editions"
            type="number"
            value={nftSupply}
            onChange={(e) => setNftSupply(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, width: "275px" }}
            id="nftUri"
            label="URL"
            type="string"
            value={nftUri}
            onChange={(e) => setNftUri(e.target.value)}
          />
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 3,
            mb: 2,
          }}
        >
          <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            sx={{
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "121px",
            }}
            variant="contained"
            onClick={handleCreateNft}
          >
            Create
          </Button>
        </Stack>
      </DialogContent>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default CreateNftDialog;
