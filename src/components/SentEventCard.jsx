import React from "react";
import { ListItem, Divider, Stack } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const SentEventCard = ({
  sentEvent: {
    sequence_number,
    data: { amount },
  },
}) => {
  return (
    <div className="sentEvent">
      <ListItem>
        <FileUploadIcon sx={{ fontSize: 24, marginRight: 2, marginTop: 1 }} color="primary" />
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

export default SentEventCard;
