import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, Stack, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect } from "react";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import copyToClipboard from "../utils/copyToClipboard";
import debug from "../utils/debug";
import shortenAddress from "../utils/shortenAddress";
import AlertDialog from "./AlertDialog";
import Loading from "./Loading";

interface CreateAccountDialogProps {
  address: string;
  network: string;
  chainId: number;
  fee: string;
}

const CreateAccountDialog = (props: CreateAccountDialogProps): JSX.Element => {
  const { openCreateAccountDialog, setOpenCreateAccountDialog, setOpenSendDialog, setPreviewRequired } =
    useContext(UIContext);
  const { validateAccount } = useContext(AccountContext);
  const { recipientAddress, sendTransaction, handleEstimate, clearTxnInput, setIsValidTransaction } =
    useContext(Web3Context);
  const { create } = useContext(PayloadContext);

  useEffect(() => {
    if (openCreateAccountDialog) {
      debug.log("Recipient's address length:", recipientAddress.length);
      setPreviewRequired(true);
      setIsValidTransaction(false);
    }
  }, [openCreateAccountDialog]);

  const handleCancel = (): void => {
    setOpenCreateAccountDialog(false);
    setOpenSendDialog(false);
    clearTxnInput();
  };

  const handleCreate = async (): Promise<void> => {
    const payload = await create(recipientAddress);
    await sendTransaction(payload, true, true);
    const validated = await validateAccount(recipientAddress);
    if (validated) {
      setOpenCreateAccountDialog(false);
      await handleEstimate();
    } else {
      setOpenCreateAccountDialog(false);
      debug.log("Failed to create account:", recipientAddress);
    }
  };

  return (
    <Dialog open={openCreateAccountDialog} onClose={handleCancel}>
      <DialogTitle align="center">Address not found</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "300px",
          }}
        >
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordWrap: "break-word",
              ml: "12px",
              mr: "12px",
              mb: "12px",
            }}
          >
            Recipient's address was not found on {props.network} network with chain id {props.chainId}.
          </Typography>
          <Typography align="center" sx={{ mb: "12px" }}>
            Create address first?
          </Typography>
          <Tooltip title={props.address} sx={{ ml: "4px", mr: "4px" }}>
            <Chip label={shortenAddress(props.address)} onClick={() => copyToClipboard(props.address)} />
          </Tooltip>
          <Typography align="center" sx={{ mt: "12px" }}>
            Estimated network fee: {props.fee}
            <br />
            (Gas Units)
          </Typography>
        </Box>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            mt: 4,
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
            onClick={handleCreate}
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

export default CreateAccountDialog;
