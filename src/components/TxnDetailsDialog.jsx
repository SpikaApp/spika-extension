import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import convertTimestamp from "../utils/convertTimestamp";
import copyToClipboard from "../utils/copyToClipboard";
import shortenAddress from "../utils/shortenAddress";
import { stringToValue } from "../utils/values";
import AlertDialog from "./AlertDialog";

const TxnDetailsDialog = () => {
  const { openTxnDetailsDialog, setOpenTxnDetailsDialog, setTxnType } = useContext(UIContext);
  const { currentAsset, currentAddress } = useContext(AccountContext);
  const { txnDetails, setTxnDetails, amount, setAmount } = useContext(Web3Context);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (openTxnDetailsDialog) {
      // debug.log("txn details", txnDetails);
      // if (
      //   txnDetails.payload.function === "0x1::coin::transfer" ||
      //   txnDetails.payload.function === "0x1::aptos_coin::mint"
      // ) {
      let _amount = "";
      let recipient = "";
      if (txnDetails.payload.arguments.length === 1) {
        _amount = txnDetails.payload.arguments[0];
        recipient = currentAddress;
      } else if (txnDetails.payload.arguments.length === 2) {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        _amount = txnDetails.payload.arguments[1];
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        recipient = txnDetails.payload.arguments[0];
      }

      //   setRows([
      //     createData("Time", convertTimestamp(txnDetails.timestamp)),
      //     createData("Txn Hash", txnDetails.hash),
      //     createData("Sender", txnDetails.sender),
      //     createData("Recipient", recipient),
      //     createData(
      //       "Amount",
      //       `${stringToValue(currentAsset, _amount)} ${currentAsset.data.symbol}`
      //     ),
      //     createData("Gas used", txnDetails.gas_used),
      //     createData("Max gas", txnDetails.max_gas_amount),
      //     createData("Gas price", txnDetails.gas_unit_price),
      //   ]);
      // } else {
      setRows([
        createData("Time", convertTimestamp(txnDetails.timestamp)),
        createData("Txn Hash", txnDetails.hash),
        createData("Sender", txnDetails.sender),
        // createData(
        //   "Function",
        //   txnDetails.payload.function
        //     .substring(txnDetails.payload.function.indexOf("0x") + 66)
        //     .split("::")
        //     .join(" ")
        // ),
        createData("Amount", `${stringToValue(currentAsset, amount)} ${currentAsset.data.symbol}`),
        createData("Gas used", txnDetails.gas_used),
        createData("Max gas", txnDetails.max_gas_amount),
        createData("Gas price", txnDetails.gas_unit_price),
      ]);
      // }
    }
  }, [openTxnDetailsDialog]);

  const createData = (name, value) => {
    return { name, value };
  };

  const handleClose = () => {
    setTxnDetails("");
    setAmount("");
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
                  <TableCell sx={{ width: "95px" }} component="th" scope="row">
                    <Typography variant="inherit">{row.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: "110px" }}>
                    {row.name === "Sender" || row.name === "Recipient" || row.name === "Txn Hash" ? (
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
