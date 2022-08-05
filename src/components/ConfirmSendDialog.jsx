import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import Loading from "./Loading";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";

const ConfirmSendDialog = () => {
  const { openConfirmSendDialog, setOpenConfirmSendDialog } = useContext(UIContext);
  const {
    isValidTransaction,
    setIsValidTransaction,
    estimatedTxnResult,
    setEstimatedTxnResult,
    handleSend,
  } = useContext(AccountContext);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (isValidTransaction) {
      setOpenConfirmSendDialog(true);
      setRows([
        createData("Time", estimatedTxnResult.timestamp),
        createData("Sender", estimatedTxnResult.sender),
        createData("Recipient", estimatedTxnResult.payload.arguments[0]),
        createData("Amount", estimatedTxnResult.payload.arguments[1]),
        createData("Gas amount", estimatedTxnResult.gas_used),
        createData("Max gas amount", estimatedTxnResult.max_gas_amount),
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
    setEstimatedTxnResult(false);
  };

  return (
    <Dialog open={openConfirmSendDialog} onClose={handleCancel}>
      <DialogTitle>
        <Typography align="center" variant="h6">
          Review Transaction
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TableContainer
          component={Paper}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordWrap: "break-word",
          }}
        >
          <Table aria-label="transaction-data">
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ maxWidth: 75 }} component="th" scope="row">
                    <Typography variant="inherit">{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100 }}>
                    <Typography variant="inherit">{row.value}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography sx={{ mt: 1 }} align="center">
          Gas values are valid at time when transaction was calculated
        </Typography>
      </DialogContent>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mt: 2,
          mb: 2,
        }}
      >
        <Button sx={{ mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSend}>
          Confirm
        </Button>
      </Stack>
      <Loading />
      <AlertDialog />
    </Dialog>
  );
};

export default ConfirmSendDialog;
