import React from "react";
import { ListItem, Divider } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import shortenAddress from "../utils/shortenAddress";

const SentEventCard = ({
  sentEvent: {
    sequence_number,
    data: { amount, to },
  },
}) => {
  return (
    <div className="sentEvent" key={sequence_number}>
      <ListItem>
        <FileUploadIcon sx={{ fontSize: 24, marginRight: 2 }} color="primary" />
        To: {shortenAddress(to)}
        <br />
        Amount sent: {amount}
        <br />
        Txn No. {sequence_number}
      </ListItem>
      <Divider />
    </div>
  );
};

export default SentEventCard;
