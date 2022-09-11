import { useContext, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { collection } from "../lib/payload";

const CreateCollectionDialog = () => {
  const { openCreateCollectionDialog, setOpenCreateCollectionDialog } = useContext(UIContext);
  const {
    estimateTransaction,
    createToken,
    isValidTransaction,
    estimatedTxnResult,
    clearPrevEstimation,
  } = useContext(Web3Context);

  const [estimationRequired, setEstimationRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionUri, setCollectionUri] = useState("");

  useEffect(() => {
    if (estimationRequired) {
      handleEstimateCollection();
      setEstimationRequired(false);
    }
  }, [estimationRequired]);

  const handleEstimationRequired = async () => {
    setEstimationRequired(true);
  };

  const collectionPayload = async () => {
    const payload = await collection(collectionName, collectionDescription, collectionUri, 1);
    return payload;
  };

  const handleEstimateCollection = async () => {
    setIsLoading(true);
    const payload = await collectionPayload();
    await estimateTransaction(payload, true, true);
    setIsLoading(false);
  };

  const handleCreateCollection = async () => {
    const payload = await collectionPayload();
    await createToken(payload);
    handleCancel();
  };

  const handleCancel = () => {
    setOpenCreateCollectionDialog(false);
    clearPrevEstimation();
    clearCollection();
  };

  const clearCollection = async () => {
    setCollectionName("");
    setCollectionDescription("");
    setCollectionUri("");
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
            disabled={isValidTransaction ? true : false}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            id="collectionDescription"
            label="Collection Description"
            type="string"
            disabled={isValidTransaction ? true : false}
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
            disabled={isValidTransaction ? true : false}
            value={collectionUri}
            onChange={(e) => setCollectionUri(e.target.value)}
          />
        </Stack>
        <Box
          sx={{
            // backgroundColor: "background.paper",
            minHeight: "24px",
            alignSelf: "center",
            justifyContent: "center",
            mt: "4px",
            maxWidth: "275x",
          }}
        >
          {isValidTransaction && (
            <Typography
              noWrap
              align="center"
              variant="subtitle2"
              color="warning.dark"
              sx={{
                maxWidth: "260px",
                mt: "2px",
                ml: "12px",
                mr: "12px",
              }}
            >
              Estimated network fee: {estimatedTxnResult.gas_used}
            </Typography>
          )}

          <Stack>
            {estimatedTxnResult && !isValidTransaction && (
              <Typography
                variant="subtitle2"
                color="error.dark"
                sx={{
                  maxWidth: "260px",
                  overflow: "hidden",
                  overflowY: "scroll",
                  textOverflow: "ellipsis",
                  wordWrap: "break-word",
                  maxHeight: "48px",
                  mt: "2px",
                }}
              >
                {estimatedTxnResult.vm_status}
              </Typography>
            )}
          </Stack>
        </Box>
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
          {!isValidTransaction &&
            collectionName !== "" &&
            collectionDescription !== "" &&
            collectionUri !== "" && (
              <LoadingButton
                sx={{
                  background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                  width: "121px",
                }}
                variant="contained"
                loadingIndicator={<CircularProgress sx={{ color: "#FFFFFFF" }} size={18} />}
                loading={isLoading}
                onClick={handleEstimationRequired}
              >
                Estimate
              </LoadingButton>
            )}{" "}
          {!isValidTransaction &&
            (collectionName === "" || collectionDescription === "" || collectionUri === "") && (
              <Button
                sx={{
                  width: "121px",
                }}
                variant="contained"
                disabled
              >
                Estimate
              </Button>
            )}
          {isValidTransaction && (
            <LoadingButton
              sx={{
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "121px",
              }}
              variant="contained"
              loadingIndicator={<CircularProgress sx={{ color: "#FFFFFFF" }} size={18} />}
              loading={isLoading}
              onClick={handleCreateCollection}
            >
              Create
            </LoadingButton>
          )}
        </Stack>
      </DialogContent>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default CreateCollectionDialog;
