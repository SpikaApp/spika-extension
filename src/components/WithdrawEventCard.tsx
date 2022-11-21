/* eslint-disable @typescript-eslint/no-non-null-assertion */
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Button, ListItem, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { stringToValue } from "../utils/values";
import TxnDetailsDialog from "./TxnDetailsDialog";

type WithdrawEventProps = {
  withdrawEvent: {
    version: number;
    data: {
      amount: string;
    };
  };
};

const SentEventCard = ({
  withdrawEvent: {
    version,
    data: { amount },
  },
}: WithdrawEventProps): JSX.Element => {
  const { setOpenTxnDetailsDialog, setTxnType } = useContext(UIContext);
  const { currentAsset } = useContext(AccountContext);
  const { getTxnDetails, setAmount } = useContext(Web3Context);

  const handleOpenTxnDetailsDialog = async (): Promise<void> => {
    setTxnType(1);
    setAmount(amount);
    await getTxnDetails(version);
    setOpenTxnDetailsDialog(true);
  };

  return (
    <ListItem>
      <Button sx={{ ml: 1.5, textTransform: "none", maxWidth: "290px" }} onClick={handleOpenTxnDetailsDialog}>
        <FileUploadIcon sx={{ fontSize: 24, mr: 2 }} color="primary" />
        <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
          <Typography sx={{ mr: 0.5 }}>Txn {version} </Typography>
          <Stack direction="row">
            <Typography noWrap sx={{ mr: 0.5, maxWidth: "100px" }}>
              {stringToValue(currentAsset!, amount)}
            </Typography>
            <Typography sx={{ mr: 0.5, maxWidth: "50px" }}>{currentAsset!.data.symbol}</Typography>
          </Stack>
        </Stack>
      </Button>
      <TxnDetailsDialog />
    </ListItem>
  );
};

export default SentEventCard;
