import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import default_nft from "../assets/default_nft.jpg";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { INftDetails } from "../interface";
import errorParser from "../lib/errorParser";
import { gasToValue } from "../utils/values";
import AddressBookDialog from "./AddressBookDialog";

type IOfferStep = "estimate" | "confirm";

interface OfferDialogPros {
  nft: INftDetails;
}

const OfferDialog = (props: OfferDialogPros): JSX.Element => {
  const {
    openOfferDialog,
    setOpenNftDetailsDialog,
    setOpenOfferDialog,
    handleAddressBookUI,
    sendNotification,
    setForceUpdateNfts,
  } = useContext(UIContext);
  const { account, validateAccount } = useContext(AccountContext);
  const {
    recipientAddress,
    setRecipientAddress,
    estimateTransaction,
    sendTransaction,
    isValidTransaction,
    estimatedTxnResult,
    clearPrevEstimation,
  } = useContext(Web3Context);
  const { offer } = useContext(PayloadContext);
  const [result, setResult] = useState<Array<{ name: string; value: string }>>([]);
  const [step, setStep] = useState<IOfferStep>("estimate");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);

  useEffect(() => {
    if (openOfferDialog && isValidTransaction && estimatedTxnResult) {
      const gasUsed = gasToValue(estimatedTxnResult.gas_used, estimatedTxnResult.gas_unit_price);
      setStep("confirm");
      setResult([
        createData("Name", `${props.nft.name}`),
        createData("Collection", `${props.nft.collection}`),
        createData("Network fee", `${gasUsed} APT`),
      ]);
    }
  }, [isValidTransaction]);

  useEffect(() => {
    if (openOfferDialog && step === "confirm") {
      if (!isValidTransaction) {
        if (estimatedTxnResult) {
          if (errorMessage === "") setErrorMessage("Simulation failed");
        } else {
          if (errorMessage === "") setErrorMessage("API Error");
        }
      } else {
        setErrorMessage("");
      }
    } else {
      setErrorMessage("");
    }
  }, [step]);

  const makePayload = async (): Promise<TxnBuilderTypes.TransactionPayload | undefined> => {
    if (account && props.nft.creator && props.nft.collection) {
      try {
        const validate = await validateAccount(recipientAddress);

        if (!validate) {
          setErrorMessage("Recipient's address not found. Please double check input.");
          setStep("confirm");
          return;
        }
        const payload = await offer({
          account: account,
          receiver: recipientAddress,
          creator: props.nft.creator,
          collectionName: props.nft.collection,
          name: props.nft.name,
          amount: 1,
          property_version: 0,
        });
        return payload;
      } catch (error) {
        console.log(error);
        setErrorMessage(errorParser(error, "Failed to make payload"));
        setStep("confirm");
      }
    }
  };

  const estimateOffer = async (): Promise<void> => {
    if (account && props.nft.creator && props.nft.collection) {
      const payload = await makePayload();
      await estimateTransaction(payload, true, true);
    }
  };

  const sendOffer = async (): Promise<void> => {
    if (account && props.nft.creator && props.nft.collection) {
      setIsLocalLoading(true);
      const payload = await makePayload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await sendTransaction(payload, true, true);
      if (result && result.success) {
        handleCancel();
        setOpenNftDetailsDialog(false);
        setForceUpdateNfts(true);
        sendNotification({ message: `Offer for ${props.nft.name} sent`, type: "success", autoHide: true });
      } else {
        handleCancel();
        setOpenNftDetailsDialog(false);
        sendNotification({ message: "Transaction failed", type: "error", autoHide: true });
      }
      setIsLocalLoading(false);
    }
  };

  const createData = (name: string, value: string): { name: string; value: string } => {
    return { name, value };
  };

  const handleCancel = (): void => {
    setOpenOfferDialog(false);
    setRecipientAddress("");
    handleBack();
  };

  const handleBack = (): void => {
    clearPrevEstimation();
    setResult([]);
    setStep("estimate");
    setErrorMessage("");
  };

  return (
    <Dialog open={openOfferDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center", mb: "-12px" }}>Offer NFT</DialogTitle>
      <DialogContent sx={{ maxWidth: 375, mb: "-12px" }}>
        {step === "estimate" && (
          <Stack sx={{ position: "absolute", ml: "225px", mt: "-15px" }}>
            <Tooltip title="Open Contacts">
              <IconButton onClick={handleAddressBookUI}>
                <ImportContactsIcon sx={{ fontSize: "20px" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            sx={{ mt: "20px", width: "275px" }}
            label="Address"
            InputLabelProps={{ shrink: true }}
            multiline={true}
            rows={3}
            fullWidth={true}
            placeholder="0x"
            type="string"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={step === "estimate" ? false : true}
          />
        </Stack>
        <Box
          sx={{
            width: "100%",
            height: "110px",
            mt: "12px",
            mb: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {step === "estimate" && props.nft && (
            <Tooltip title={props.nft.name}>
              <Paper
                component="img"
                sx={{ width: "110px", height: "110px" }}
                src={`${props.nft.uri}`}
                loading="lazy"
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = default_nft;
                }}
              />
            </Tooltip>
          )}
          {step === "confirm" && result.length > 0 && (
            <Box sx={{ width: "100%", height: "100%", border: 1, borderRadius: "12px", py: "8px", px: "8px" }}>
              <Typography align="center" color="success.main" sx={{ fontWeight: "550", fontSize: "14px", mb: "8px" }}>
                Transaction validated
              </Typography>
              {result.map((data, index) => (
                <Stack sx={{}} key={data.name}>
                  <Stack
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "start",
                      justifyContent: "space-between",
                      border: 0,
                      borderRadius: "8px",
                      width: "100%",
                    }}
                  >
                    <Typography color="textSecondary" variant="body2" align="left" sx={{ fontWeight: "450" }}>
                      {data.name}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" align="left" sx={{ fontWeight: "450" }}>
                      {data.value}
                    </Typography>
                  </Stack>
                  {result.length !== index + 1 && <Divider />}
                </Stack>
              ))}
            </Box>
          )}
          {step === "confirm" && result.length === 0 && (
            <Box sx={{ width: "100%", height: "100%", border: 1, borderRadius: "12px", py: "8px", px: "8px" }}>
              <Typography
                align="center"
                color="error.main"
                sx={{ fontWeight: "550", fontSize: "17px", width: "260px" }}
              >
                {errorMessage}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
        }}
      >
        {step === "estimate" && (
          <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        {step === "confirm" && (
          <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleBack}>
            Back
          </Button>
        )}
        {step === "estimate" && (
          <LoadingButton
            sx={{
              background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
              width: "121px",
            }}
            loading={isLocalLoading ? true : false}
            loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} thickness={7} />}
            variant="contained"
            onClick={estimateOffer}
          >
            {"Estimate"}
          </LoadingButton>
        )}
        {step === "confirm" && (
          <LoadingButton
            sx={{
              background: isValidTransaction ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
              width: "121px",
            }}
            variant="contained"
            onClick={sendOffer}
            loading={isLocalLoading ? true : false}
            loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} thickness={7} />}
            disabled={isValidTransaction ? false : true}
          >
            {"Offer"}
          </LoadingButton>
        )}
      </Stack>
      <AddressBookDialog />
    </Dialog>
  );
};

export default OfferDialog;
