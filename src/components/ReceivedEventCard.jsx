import React from "react";
import { ListItem, Divider } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import shortenAddress from "../utils/shortenAddress";

const ReceivedEventCard = ({
  ReceivedEvent: {
    sequence_number,
    data: { amount, from },
  },
}) => {
  return (
    <div className="sendEvent" key={sequence_number}>
      <ListItem button>
        <FileUploadIcon sx={{ fontSize: 24, marginRight: 2 }} color="primary" />
        Txn No. {sequence_number}
        <br />
        Amount sent: {amount}
        <br />
        To: {shortenAddress(from)}
      </ListItem>
      <Divider />
    </div>
  );
};

export default ReceivedEventCard;
