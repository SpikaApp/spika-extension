import React, { useContext } from "react";
import { ListItem, Divider, Stack, Typography, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import TxnDetailsDialog from "./TxnDetailsDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";

const DepositEventCard = ({
  depositEvent: {
    version,
    data: { amount },
  },
}) => {
  const { setOpenTxnDetailsDialog, setTxnType } = useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const { getTxnDetails } = useContext(Web3Context);

  const handleOpenTxnDetailsDialog = async () => {
    setTxnType(2);
    await getTxnDetails(version);
    setOpenTxnDetailsDialog(true);
  };

  return (
    <div>
      <ListItem>
        <Button sx={{ textTransform: "none" }} onClick={handleOpenTxnDetailsDialog}>
          <DownloadIcon sx={{ fontSize: 24, mr: 2 }} color="primary" />
          <Stack>
            <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
              <Typography sx={{ mr: 0.5 }}>Txn {version} </Typography>
              <Typography sx={{ mr: 0.5 }}>
                {amount} {currentAsset[0].ticker}
              </Typography>
            </Stack>
          </Stack>
        </Button>
      </ListItem>
      <Divider />
      <TxnDetailsDialog />
    </div>
  );
};

export default DepositEventCard;
