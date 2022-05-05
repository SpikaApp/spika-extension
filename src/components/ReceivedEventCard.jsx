import React from "react";
import { ListItem, Divider, Stack, Typography, Tooltip, Chip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import shortenAddress from "../utils/shortenAddress";

const ReceivedEventCard = ({
  receivedEvent: {
    sequence_number,
    data: { amount, from },
  },
}) => {
  const handleClick = () => {
    navigator.clipboard.writeText(from);
  };

  return (
    <div className="ReceivedEvent" key={sequence_number}>
      <ListItem>
        <DownloadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Typography sx={{ marginRight: 1 }}>From:</Typography>
            <Tooltip title="Copy address">
              <Chip label={shortenAddress(from)} onClick={handleClick} />
            </Tooltip>
          </Stack>
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
