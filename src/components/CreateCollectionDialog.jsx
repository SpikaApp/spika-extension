import { useContext } from "react";
import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";

const CreateCollectionDialog = () => {
  const { openCreateCollectionDialog, setOpenCreateCollectionDialog } = useContext(UIContext);
  const {
    collectionName,
    setCollectionName,
    collectionDescription,
    setCollectionDescription,
    collectionUri,
    setCollectionUri,
    handleCreateCollection,
  } = useContext(Web3Context);

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
        <Stack component="span" sx={{ maxWidth: 300 }}>
          <TextField
            sx={{ mt: 1, mb: 1.5, width: 250 }}
            id="collectionName"
            label="Collection Name"
            type="string"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: 250 }}
            id="collectionDescription"
            label="Collection Description"
            type="string"
            multiline
            rows={3}
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, width: 250 }}
            id="collectionUri"
            label="URL"
            type="string"
            value={collectionUri}
            onChange={(e) => setCollectionUri(e.target.value)}
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
          <Button variant="outlined" sx={{ mr: 4 }} onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateCollection}>
            Create
          </Button>
        </Stack>
      </DialogContent>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default CreateCollectionDialog;
