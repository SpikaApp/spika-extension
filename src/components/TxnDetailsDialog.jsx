import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Chip,
  Link,
  Stack,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AlertDialog from "./AlertDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import convertTimestamp from "../utils/convert_timestamp";
import shortenAddress from "../utils/shorten_address";
import copyToClipboard from "../utils/copy_clipboard";

const TxnDetailsDialog = () => {
  const { openTxnDetailsDialog, setOpenTxnDetailsDialog, txnType, setTxnType } =
    useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const { txnDetails, setTxnDetails } = useContext(Web3Context);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (openTxnDetailsDialog) {
      setRows([
        createData("Time", convertTimestamp(txnDetails.timestamp)),
        createData("Txn Hash", txnDetails.hash),
        createData("Sender", txnDetails.sender),
        createData("Recipient", txnDetails.payload.arguments[0]),
        createData("Amount", `${txnDetails.payload.arguments[1]} ${currentAsset.ticker}`),
        createData("Gas fee", txnDetails.gas_used),
        createData("Max gas", txnDetails.max_gas_amount),
        createData("Gas price", txnDetails.gas_unit_price),
      ]);
    }
  }, [openTxnDetailsDialog]);

  const createData = (name, value) => {
    return { name, value };
  };

  const handleClose = () => {
    setTxnDetails("");
    setTxnType(0);
    setOpenTxnDetailsDialog(false);
  };

  return (
    <Dialog open={openTxnDetailsDialog} onClose={handleClose}>
      <DialogTitle align="center">
        Version
        <Tooltip title="Open in Aptos Explorer">
          <Link
            sx={{ ml: 1 }}
            href={`https://explorer.devnet.aptos.dev/txn/${txnDetails.version}`}
            target="_blank"
            underline="none"
            color="link"
          >
            {txnDetails.version} <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Link>
        </Tooltip>
      </DialogTitle>
      <DialogContent sx={{ minWidth: 320 }}>
        <TableContainer
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
                  <TableCell sx={{ maxWidth: 60 }} component="th" scope="row">
                    <Typography variant="inherit">{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 100 }}>
                    {row.name === "Sender" ||
                    row.name === "Recipient" ||
                    row.name === "Txn Hash" ? (
                      <Tooltip title={row.value} sx={{ ml: -1.5 }}>
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
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
      <AlertDialog />
    </Dialog>
  );
};

export default TxnDetailsDialog;
