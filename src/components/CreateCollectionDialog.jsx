import { useContext } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const CreateCollectionDialog = () => {
  const {
    collectionName,
    setCollectionName,
    collectionDescription,
    setCollectionDescription,
    collectionUri,
    setCollectionUri,
    handleCreateCollection,
  } = useContext(AccountContext);
  const { openCreateCollectionDialog, setOpenCreateCollectionDialog } = useContext(UIContext);

  const handleCancel = () => {
    setCollectionName("");
    setCollectionDescription("");
    setCollectionUri("");
    setOpenCreateCollectionDialog(false);
  };

  return (
    <Dialog open={openCreateCollectionDialog} onClose={handleCancel}>
      <DialogTitle>
        <Stack sx={{ display: "flex", alignItems: "center" }}>Create New Collection</Stack>
      </DialogTitle>
      <DialogContent>
        <Stack component="span">
          <TextField
            sx={{ mt: 2, mb: 2 }}
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
            sx={{ mt: 2, mb: 2 }}
            id="collectionDescription"
            label="Collection Description"
            type="string"
            multiline
            rows={3}
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            sx={{ mt: 2, mb: 2 }}
            id="collectionUri"
            label="URL"
            type="string"
            value={collectionUri}
            onChange={(e) => setCollectionUri(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleCreateCollection}>Create</Button>
      </DialogActions>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default CreateCollectionDialog;
