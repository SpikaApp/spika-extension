/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Types } from "aptos";
import { useContext, useEffect, useState } from "react";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { DEFAULT_MAX_GAS } from "../utils/constants";
import debug from "../utils/debug";
import { stringToValue } from "../utils/values";
import AlertDialog from "./AlertDialog";
import CreateAccountDialog from "./CreateAccountDialog";
import Loading from "./Loading";
import AddressBookDialog from "./AddressBookDialog";

const SendDialog = (): JSX.Element => {
  const { openSendDialog, setOpenSendDialog, handleCreateAccountDialog, setPreviewRequired, handleAddressBookUI } =
    useContext(UIContext);
  const { currentAccountType, currentAsset, currentNetwork, validateAccount, throwAlert, balance } =
    useContext(AccountContext);
  const { create } = useContext(PayloadContext);
  const {
    recipientAddress,
    setRecipientAddress,
    amount,
    setAmount,
    gasUnitPrice,
    setGasUnitPrice,
    maxGasAmount,
    setMaxGasAmount,
    handleEstimate,
    estimateTransaction,
    estimateGasPrice,
    clearTxnInput,
    updateBalance,
  } = useContext(Web3Context);
  const [estimatedGasPrice, setEstimatedGasPrice] = useState<Types.GasEstimation>();
  const [createAccountFee, setCreateAccountFee] = useState<string>("");

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
    setMaxGasAmount(DEFAULT_MAX_GAS);
    setOpenSendDialog(false);
  };

  const validateAddressInput = (): boolean => {
    switch (recipientAddress.length) {
      case 64:
      case 66:
        return true;
      default:
        return false;
    }
  };

  const validateAmountInput = (): boolean => {
    switch (amount) {
      case "":
        return false;
      case "0":
        return false;
      default:
        return true;
    }
  };

  const validateBalance = async (): Promise<boolean> => {
    const balance = await updateBalance(currentAsset!);
    const _amount = Number(amount);
    const _balance = Number(stringToValue(currentAsset!, balance));
    debug.log("Amount:", _amount);
    debug.log("Balance:", _balance);

    if (_amount >= _balance) {
      return false;
    } else {
      return true;
    }
  };

  const validateAddressAndEstimateTransaction = async (): Promise<void> => {
    const validAddress = validateAddressInput();
    const validAmount = validateAmountInput();
    const validBalance = await validateBalance();
    if (!validAddress) {
      throwAlert({
        signal: 132,
        title: "Invalid address",
        message: `Invalid address format. Please double check address field and try again.`,
        error: true,
      });
      return;
    }
    if (!validAmount) {
      throwAlert({
        signal: 133,
        title: "Invalid amount",
        message: `Invalid value ${amount} ${
          currentAsset!.data.symbol
        }. Please double check amount field and try again.`,
        error: true,
      });
      return;
    }
    if (!validBalance) {
      throwAlert({
        signal: 134,
        title: `Not enough ${currentAsset!.data.symbol}`,
        message: `Account doesn't have enough ${
          currentAsset!.data.symbol
        } to execute transaction. Please adjust amount field and try again.`,
        error: true,
      });
      return;
    }

    const validated = await validateAccount(recipientAddress);
    if (validated) {
      debug.log("Address registered on chain:", recipientAddress ? recipientAddress : undefined);
      handleEstimate();
    } else {
      debug.log("Address not found on chain:", recipientAddress ? recipientAddress : undefined);
      const payload = await create(recipientAddress);
      const result = await estimateTransaction(payload, true, true);
      if (result && result.success) {
        setPreviewRequired(false);
        setCreateAccountFee(result.gas_used);
        handleCreateAccountDialog();
      } else {
        debug.log("Address cannot be created:", recipientAddress ? recipientAddress : undefined);
        // Throw new error?
        clearTxnInput();
        return;
      }
    }
  };

  return (
    <Dialog open={openSendDialog} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center", mb: "-12px" }}>Send {currentAsset!.data.symbol}</DialogTitle>
      <DialogContent sx={{ maxWidth: 375, mb: "-12px" }}>
        <Stack sx={{ position: "absolute", ml: "225px", mt: "-15px" }}>
          <Tooltip title="Import from contracts">
            <IconButton onClick={handleAddressBookUI}>
              <ImportContactsIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          </Tooltip>
        </Stack>
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
          <Typography color="textSecondary" sx={{ mt: "-15px", mb: "16px", fontWeight: "450", fontSize: "16px" }}>
            Balance: {stringToValue(currentAsset!, balance!)} {currentAsset?.data.symbol}
          </Typography>
          {estimatedGasPrice && (
            <FormControl sx={{ mb: "15px" }}>
              <FormLabel sx={{ alignSelf: "center", fontSize: 12, mb: "-4px" }} id="gas-price-priority">
                <Typography sx={{ fontWeight: "550", fontSize: "14px", mb: "4px" }}>Gas Price (Gas Units)</Typography>
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
                          color: "#434343",
                          mt: "-2px",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px" }}>
                      Normal: {estimatedGasPrice.gas_estimate}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value={estimatedGasPrice.prioritized_gas_estimate}
                  control={
                    <Radio
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: 16,
                          color: "#434343",
                          mt: "-2px",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px" }}>
                      Priority: {estimatedGasPrice.prioritized_gas_estimate}
                    </Typography>
                  }
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
            placeholder={`${maxGasAmount} (default)`}
            value={maxGasAmount === DEFAULT_MAX_GAS ? "" : maxGasAmount}
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
          onClick={validateAddressAndEstimateTransaction}
        >
          {currentAccountType === "hardware" ? "Sign" : "Estimate"}
        </Button>
      </Stack>
      <CreateAccountDialog
        address={recipientAddress}
        network={currentNetwork!.name}
        chainId={3}
        fee={createAccountFee}
      />
      <Loading />
      <AlertDialog />
      <AddressBookDialog />
    </Dialog>
  );
};

export default SendDialog;
