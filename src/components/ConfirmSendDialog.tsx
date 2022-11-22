/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import debug from "../utils/debug";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import copyToClipboard from "../utils/copyToClipboard";
import shortenAddress from "../utils/shortenAddress";
import { stringToValue } from "../utils/values";
import AlertDialog from "./AlertDialog";
import Loading from "./Loading";

interface ConfirmSendDialogProps {
  type?: string;
  args?: any;
  quote?: any;
}

const ConfirmSendDialog = (props: ConfirmSendDialogProps): JSX.Element => {
  const { openConfirmSendDialog, setOpenConfirmSendDialog, openAddAssetDialog } = useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const {
    isValidTransaction,
    setIsValidTransaction,
    estimatedTxnResult,
    setEstimatedTxnResult,
    handleSend,
    setRecipientAddress,
    setAmount,
  } = useContext(Web3Context);
  const [rows, setRows] = useState<any>([]);

  useEffect(() => {
    if (isValidTransaction && !openAddAssetDialog) {
      debug.log("Valid transaction:", isValidTransaction);
      debug.log("Estimated txn result:", estimatedTxnResult);
      if (estimatedTxnResult) {
        const txn: any = estimatedTxnResult;
        const _amount = txn.payload.arguments[1];
        setOpenConfirmSendDialog(true);
        setRows([
          createData("Sender", estimatedTxnResult.sender),
          createData("Recipient", txn.payload.arguments[0]),
          createData("Amount", `${stringToValue(currentAsset!, _amount)} ${currentAsset!.data.symbol}`),
          createData("Gas fee", `~ ${estimatedTxnResult.gas_used}`),
          createData("Max gas", estimatedTxnResult.max_gas_amount),
          createData("Gas price", estimatedTxnResult.gas_unit_price),
        ]);
      }
    } else if (isValidTransaction && props && props.type === "swap") {
      if (estimatedTxnResult) {
        setRows([
          createData(
            "Avg. rate",
            `1 ${props.quote.quote.inputSymbol} ≈ ${props.quote.quote.avgPrice} ${props.quote.quote.outputSymbol}`
          ),
          createData("Base", `${props.quote.quote.inputUiAmt} ${props.quote.quote.inputSymbol}`),
          createData("Quote", `${props.quote.quote.outputUiAmt} ${props.quote.quote.outputSymbol}`),
          createData("Gas fee", `≈ ${estimatedTxnResult.gas_used}`),
          createData("Max gas", estimatedTxnResult.max_gas_amount),
          createData("Gas price", estimatedTxnResult.gas_unit_price),
        ]);
      }
    }
  }, [isValidTransaction]);

  const createData = (name: any, value: any): any => {
    return { name, value };
  };

  const handleConfirm = (): void => {
    if (props && props.type === "swap") {
      handleSend(props.args.payload, props.args.isBcs, props.args.silent);
    } else {
      handleSend();
    }
  };

  const handleCancel = (): void => {
    setOpenConfirmSendDialog(false);
    setIsValidTransaction(false);
    setEstimatedTxnResult(undefined);
    setRecipientAddress("");
    setAmount("");
  };

  return (
    <Dialog open={openConfirmSendDialog} onClose={handleCancel}>
      <DialogTitle align="center">Preview Transaction</DialogTitle>
      <DialogContent>
        <TableContainer
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordWrap: "break-word",
          }}
        >
          <Table aria-label="transaction-data" sx={{ width: "260px" }}>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ maxWidth: "65px" }} component="th" scope="row">
                    <Typography variant="inherit">{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: "90px" }}>
                    {row.name === "Sender" || row.name === "Recipient" ? (
                      <Tooltip title="Copy address" sx={{ ml: -1.5 }}>
                        <Chip
                          label={shortenAddress(row.value)}
                          onClick={() => {
                            copyToClipboard(row.value);
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="inherit">{row.value}</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default ConfirmSendDialog;
