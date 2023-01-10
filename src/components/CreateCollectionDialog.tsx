/* eslint-disable @typescript-eslint/no-non-null-assertion */
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import errorParser from "../core/errorParser";
import { gasToValue } from "../utils/values";
import AlertDialog from "./AlertDialog";
import Loading from "./Loading";

const CreateCollectionDialog = (): JSX.Element => {
  const { openCreateCollectionDialog, setOpenCreateCollectionDialog } = useContext(UIContext);
  const { throwAlert } = useContext(AccountContext);
  const { collection } = useContext(PayloadContext);
  const { estimateTransaction, createToken, isValidTransaction, estimatedTxnResult, clearPrevEstimation } =
    useContext(Web3Context);

  const [estimationRequired, setEstimationRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionDescription, setCollectionDescription] = useState<string>("");
  const [collectionUri, setCollectionUri] = useState<string>("");
  const [collectionSize, setCollectionSize] = useState<string>("");

  useEffect(() => {
    if (estimationRequired) {
      handleEstimateCollection();
      setEstimationRequired(false);
    }
  }, [estimationRequired]);

  const handleEstimationRequired = async (): Promise<void> => {
    setEstimationRequired(true);
  };

  const collectionPayload = async (): Promise<TxnBuilderTypes.TransactionPayload> => {
    const payload = await collection({
      name: collectionName,
      description: collectionDescription,
      uri: collectionUri,
      maxAmount: parseInt(collectionSize),
    });
    return payload;
  };

  const handleEstimateCollection = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const payload: TxnBuilderTypes.TransactionPayload = await collectionPayload();
      await estimateTransaction(payload, true, true);
    } catch (error) {
      throwAlert({
        signal: 63,
        title: "Error",
        message: `${errorParser(error, "Error occured while trying to estimate transaction.")}`,
        error: true,
      });
      console.log(error);
    }
    setIsLoading(false);
  };

  const handleCreateCollection = async (): Promise<void> => {
    const payload = await collectionPayload();
    await createToken(payload);
    handleCancel();
  };

  const handleCancel = (): void => {
    setOpenCreateCollectionDialog(false);
    clearPrevEstimation();
    clearCollection();
  };

  const clearCollection = (): void => {
    setCollectionName("");
    setCollectionDescription("");
    setCollectionUri("");
    setCollectionSize("");
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
            label="Name"
            type="string"
            disabled={isValidTransaction ? true : false}
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            id="collectionDescription"
            label="Description"
            type="string"
            disabled={isValidTransaction ? true : false}
            multiline
            rows={3}
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, mb: 1.5, width: "275px" }}
            id="collectionUri"
            label="URI"
            type="string"
            disabled={isValidTransaction ? true : false}
            value={collectionUri}
            onChange={(e) => setCollectionUri(e.target.value)}
          />
          <TextField
            sx={{ mt: 1.5, width: "275px" }}
            id="collectionSize"
            label="Max NFTs in collection"
            type="number"
            disabled={isValidTransaction ? true : false}
            value={collectionSize}
            onChange={(e) => setCollectionSize(e.target.value)}
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
              Network fee: {gasToValue(estimatedTxnResult!.gas_used, estimatedTxnResult!.gas_unit_price)} APT
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
          {!isValidTransaction && collectionName !== "" && collectionDescription !== "" && collectionUri !== "" && (
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
          {!isValidTransaction && (collectionName === "" || collectionDescription === "" || collectionUri === "") && (
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
