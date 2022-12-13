/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { IExplorerNetwork } from "../interface";
import convertTimestamp from "../utils/convertTimestamp";
import copyToClipboard from "../utils/copyToClipboard";
import debug from "../utils/debug";
import { getNetworkString } from "../utils/getNetworkString";
import getTxnFunction from "../utils/getTxnFunction";
import shortenAddress from "../utils/shortenAddress";
import { gasToValue, stringToValue } from "../utils/values";
import AlertDialog from "./AlertDialog";

const TxnDetailsDialog = (): JSX.Element => {
  const { openTxnDetailsDialog, setOpenTxnDetailsDialog, setTxnType } = useContext(UIContext);
  const { currentAsset, currentNetwork } = useContext(AccountContext);
  const { txnDetails, setTxnDetails, amount, setAmount } = useContext(Web3Context);
  const [rows, setRows] = useState<any>([]);
  const [network, setNetwork] = useState<IExplorerNetwork>("mainnet");

  useEffect(() => {
    if (openTxnDetailsDialog) {
      debug.log(txnDetails);
      let _amount: string;
      if (txnDetails.payload.arguments.length === 1) {
        _amount = txnDetails.payload.arguments[0];
      } else if (txnDetails.payload.arguments.length === 2) {
        _amount = txnDetails.payload.arguments[1];
      }
      const gasUsedInApt = gasToValue(txnDetails.gas_used, txnDetails.gas_unit_price);
      const maxGasInApt = gasToValue(txnDetails.max_gas_amount, txnDetails.gas_unit_price);
      setRows([
        createData("Time", convertTimestamp(txnDetails.timestamp)),
        createData("Txn Hash", txnDetails.hash),
        createData("Sender", txnDetails.sender),
        createData("Function", `${getTxnFunction(txnDetails.payload.function)}`),
        createData("Amount", `${stringToValue(currentAsset!, amount)} ${currentAsset!.data.symbol}`),
        createData("Gas used", `${gasUsedInApt} APT`),
        createData("Max gas", `${maxGasInApt} APT`),
      ]);
      // }
    }
  }, [openTxnDetailsDialog]);

  useEffect(() => {
    if (currentNetwork) {
      const networkString = getNetworkString(currentNetwork!.name);
      setNetwork(networkString);
    }
  }, [currentNetwork]);

  const createData = (name: any, value: any): any => {
    return { name, value };
  };

  const handleClose = (): void => {
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
            href={`https://explorer.aptoslabs.com/txn/${txnDetails.version}?network=${network}`}
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
              {rows.map((row: any) => (
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
