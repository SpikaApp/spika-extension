import React, { useContext } from "react";
import { ListItem, Divider, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { AccountContext } from "../context/AccountContext";

const ReceivedEventCard = ({
  receivedEvent: {
    sequence_number,
    data: { amount },
  },
}) => {
  const { currentAsset } = useContext(AccountContext);

  return (
    <div className="ReceivedEvent">
      <ListItem>
        <DownloadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            Amount: {amount} {currentAsset[0].ticker}
            <br />
            Transaction No. {sequence_number}
          </Stack>
        </Stack>
      </ListItem>
      <Divider />
    </div>
  );
};

export default ReceivedEventCard;
