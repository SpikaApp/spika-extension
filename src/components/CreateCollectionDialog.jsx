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
            id="collectionDescription"
            label="Collection Description"
            type="string"
            multiline
            rows={3}
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, width: "275px" }}
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
          <Button variant="outlined" sx={{ width: "121px", mr: 4 }} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            sx={{
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "121px",
            }}
            variant="contained"
            onClick={handleCreateCollection}
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

export default CreateCollectionDialog;
