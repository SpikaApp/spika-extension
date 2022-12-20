import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import default_nft from "../assets/default_nft.jpg";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { IPendingClaim } from "../interface/IQueryQL";
import { gasToValue } from "../utils/values";

interface ClaimDialogPros {
  pendingClaim: IPendingClaim;
  payload: TxnBuilderTypes.TransactionPayload;
}

const ClaimDialog = (props: ClaimDialogPros): JSX.Element => {
  const { openConfirmClaimDialog, setOpenConfirmClaimDialog, sendNotification, setForceUpdateNfts } =
    useContext(UIContext);
  const { account } = useContext(AccountContext);
  const { sendTransaction, isValidTransaction, estimatedTxnResult, clearPrevEstimation } = useContext(Web3Context);
  const [result, setResult] = useState<Array<{ name: string; value: string }>>([]);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);

  useEffect(() => {
    if (openConfirmClaimDialog && isValidTransaction && estimatedTxnResult) {
      const gasUsed = gasToValue(estimatedTxnResult.gas_used, estimatedTxnResult.gas_unit_price);
      setResult([
        createData("Name", `${props.pendingClaim.current_token_data.name}`),
        createData("Collection", `${props.pendingClaim.current_token_data.collection_name}`),
        createData("Network fee", `${gasUsed} APT`),
      ]);
    }
  }, [openConfirmClaimDialog]);

  const handleConfirmClaim = async () => {
    if (account && props.pendingClaim && props.payload) {
      setIsLocalLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await sendTransaction(props.payload, true, true);
      if (result && result.success) {
        handleCancel();
        setOpenConfirmClaimDialog(false);
        setForceUpdateNfts(true);
        sendNotification({
          message: `${props.pendingClaim.current_token_data.name} claimed`,
          type: "success",
          autoHide: true,
        });
      } else {
        handleCancel();
        setOpenConfirmClaimDialog(false);
        sendNotification({ message: "Transaction failed", type: "error", autoHide: true });
      }
      handleCancel();
      setIsLocalLoading(false);
    }
  };

  const createData = (name: string, value: string): { name: string; value: string } => {
    return { name, value };
  };

  const handleCancel = (): void => {
    clearPrevEstimation();
    setOpenConfirmClaimDialog(false);
    setResult([]);
  };

  return (
    <Dialog open={openConfirmClaimDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center" }}>Confirm NFT Claim</DialogTitle>
      <DialogContent
        sx={{ width: "300px", mb: "-12px", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {props.pendingClaim && (
          <Paper
            sx={{ border: 0, width: "125px", height: "125px" }}
            component="img"
            src={
              props.pendingClaim.current_token_data.image ? props.pendingClaim.current_token_data.image : default_nft
            }
          />
        )}
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
          {result.length > 0 && (
            <Box sx={{ width: "100%", height: "100%", border: 1, borderRadius: "12px", py: "8px", px: "8px" }}>
              <Typography align="center" color="success.main" sx={{ fontWeight: "550", fontSize: "14px", mb: "8px" }}>
                Transaction validated
              </Typography>
              {result.map((data, index) => (
                <Stack key={data.name}>
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
        <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>

        <LoadingButton
          sx={{
            background: isValidTransaction ? "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);" : "",
            width: "121px",
          }}
          variant="contained"
          onClick={handleConfirmClaim}
          loading={isLocalLoading ? true : false}
          loadingIndicator={<CircularProgress sx={{ color: "white" }} size={18} thickness={7} />}
          disabled={isValidTransaction ? false : true}
        >
          Confirm
        </LoadingButton>
      </Stack>
    </Dialog>
  );
};

export default ClaimDialog;
