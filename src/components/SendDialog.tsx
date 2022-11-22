/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { Types } from "aptos";

const SendDialog = (): JSX.Element => {
  const { openSendDialog, setOpenSendDialog } = useContext(UIContext);
  const { currentAsset, currentNetwork } = useContext(AccountContext);
  const {
    chainId,
    recipientAddress,
    setRecipientAddress,
    amount,
    setAmount,
    gasUnitPrice,
    setGasUnitPrice,
    maxGasAmount,
    setMaxGasAmount,
    handleEstimate,
    estimateGasPrice,
  } = useContext(Web3Context);
  const [estimatedGasPrice, setEstimatedGasPrice] = useState<Types.GasEstimation>();

  useEffect(() => {
    if (openSendDialog) {
      handleEstimateGasPrice();
    }
  }, [openSendDialog]);

  const handleEstimateGasPrice = async () => {
    const result = await estimateGasPrice();
    setEstimatedGasPrice(result);
    setGasUnitPrice(result.gas_estimate.toString());
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGasUnitPrice((event.target as HTMLInputElement).value);
  };

  const handleCancel = (): void => {
    setRecipientAddress("");
    setAmount("");
    setOpenSendDialog(false);
  };

  return (
    <Dialog open={openSendDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center", mb: "-12px" }}>Send {currentAsset!.data.symbol}</DialogTitle>
      <DialogContent sx={{ maxWidth: 375 }}>
        <Typography align="center" variant="body1" color="textSecondary" sx={{ maxWidth: "275px" }}>
          {currentNetwork!.name} {`network (chain id: ${chainId})`}
        </Typography>
        <Stack sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            sx={{ mt: "20px", mb: "20px", width: "275px" }}
            id="recipientAddress"
            label="Address"
            InputLabelProps={{ shrink: true }}
            multiline={true}
            rows={3}
            fullWidth={true}
            placeholder="0x"
            type="string"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
          <TextField
            sx={{ mb: "20px", width: "275px" }}
            id="amount"
            label={`Amount (${currentAsset?.data.symbol})`}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "right" } }}
            fullWidth={true}
            placeholder={`0.00`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {estimatedGasPrice && (
            <FormControl sx={{ mb: "15px" }}>
              <FormLabel sx={{ alignSelf: "center", fontSize: 12, mb: "4px" }} id="gas-price-priority">
                {"Gas Price (Gas Units)"}
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="gas-price-selection-radio"
                name="gas-price-selection-radio"
                value={gasUnitPrice}
                onChange={handleChange}
                defaultValue={estimatedGasPrice.gas_estimate}
              >
                <FormControlLabel
                  value={estimatedGasPrice.gas_estimate}
                  control={
                    <Radio
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: 16,
                        },
                      }}
                    />
                  }
                  label={`Normal: ${estimatedGasPrice.gas_estimate}`}
                />
                <FormControlLabel
                  value={estimatedGasPrice.prioritized_gas_estimate}
                  control={
                    <Radio
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: 16,
                        },
                      }}
                    />
                  }
                  label={`Priority: ${estimatedGasPrice.prioritized_gas_estimate}`}
                />
              </RadioGroup>
            </FormControl>
          )}
          <TextField
            sx={{ width: "275px" }}
            id="maxGasAmount"
            label="Max Gas Amount (Gas Units)"
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "right" } }}
            fullWidth={true}
            type="number"
            placeholder={maxGasAmount}
            value={maxGasAmount === "10000" ? "" : maxGasAmount}
            onChange={(e) => setMaxGasAmount(e.target.value.toString())}
          />
        </Stack>
      </DialogContent>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
          mb: 4,
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
          onClick={handleEstimate}
        >
          Estimate
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default SendDialog;
