import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { stringToValue } from "../utils/values";
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";

const ConfirmSendDialog = () => {
  const { openConfirmSendDialog, setOpenConfirmSendDialog, openAddAssetDialog } =
    useContext(UIContext);
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
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isValidTransaction && !openAddAssetDialog) {
      const _amount = estimatedTxnResult.payload.arguments[1];
      setOpenConfirmSendDialog(true);
      setRows([
        createData("Sender", estimatedTxnResult.sender),
        createData("Recipient", estimatedTxnResult.payload.arguments[0]),
        createData("Amount", `${stringToValue(currentAsset, _amount)} ${currentAsset.data.symbol}`),
        createData("Gas fee", `~ ${estimatedTxnResult.gas_used}`),
        createData("Max gas", estimatedTxnResult.max_gas_amount),
        createData("Gas price", estimatedTxnResult.gas_unit_price),
      ]);
    }
  }, [isValidTransaction]);

  const createData = (name, value) => {
    return { name, value };
  };

  const handleCancel = () => {
    setOpenConfirmSendDialog(false);
    setIsValidTransaction(false);
    setEstimatedTxnResult([]);
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
              {rows.map((row) => (
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
          onClick={handleSend}
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
