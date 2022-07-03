import React from "react";
import { ListItem, Divider, Stack, Chip, Tooltip, Typography, Link } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import shortenKey from "../utils/shortenKey";
import shortenAddress from "../utils/shortenAddress";

const TransactionCard = ({
  transaction: {
    gas_used,
    version,
    vm_status,
    events: {
      0: {
        data: { amount },
      },
      1: { key },
    },
  },
}) => {
  const handleClick = () => {
    navigator.clipboard.writeText(shortenKey(key));
  };

  return (
    <div className="transaction">
      <ListItem>
        <FileUploadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            <Stack direction="row">
              <Typography sx={{ mr: 0.5 }}>Transaction: </Typography>
              <Tooltip title="Open in Aptos Explorer">
                <Link
                  href={`https://explorer.devnet.aptos.dev/txn/${version}`}
                  target="_blank"
                  underline="none"
                >
                  {version} <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Link>
              </Tooltip>
            </Stack>
            Amount: {amount} TestCoin
            <br />
            Gas used: {gas_used}
            <br />
            <Stack direction="row">
              <Typography sx={{ my: 0.5, ml: 0.1, mr: 1 }}>To: </Typography>
              <Tooltip title="Copy address">
                <Chip
                  sx={{ marginBottom: 1 }}
                  label={shortenAddress(shortenKey(key))}
                  onClick={handleClick}
                />
              </Tooltip>
            </Stack>
            <Typography sx={{ my: -1, mb: 0.5 }}>Status: {vm_status}</Typography>
          </Stack>
        </Stack>
      </ListItem>
      <Divider />
    </div>
  );
};

export default TransactionCard;
