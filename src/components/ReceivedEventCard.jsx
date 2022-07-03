import React from "react";
import { ListItem, Divider, Stack } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const ReceivedEventCard = ({
  receivedEvent: {
    sequence_number,
    data: { amount },
  },
}) => {
  return (
    <div className="ReceivedEvent">
      <ListItem>
        <DownloadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            Amount: {amount} TestCoin
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
