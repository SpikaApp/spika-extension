import React from "react";
import { ListItem, Divider, Stack, Typography, Tooltip, Chip } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import shortenAddress from "../utils/shortenAddress";

const SentEventCard = ({
  sentEvent: {
    sequence_number,
    data: { amount, to },
  },
}) => {
  const handleClick = () => {
    navigator.clipboard.writeText(to);
  };

  return (
    <div className="sentEvent" key={sequence_number}>
      <ListItem>
        <FileUploadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
        <Stack>
          <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <Typography sx={{ marginRight: 1 }}>Sent to:</Typography>
            <Tooltip title="Copy address">
              <Chip label={shortenAddress(to)} onClick={handleClick} />
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

export default SentEventCard;
