/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { IContact } from "../interface";
import { deleteContact, editContact, getContacts } from "../lib/contacts";
import copyToClipboard from "../utils/copyToClipboard";

interface ContactCardProps {
  id: string;
  name: string;
  address: string;
  remarks: string;
  isNew?: boolean;
}

const ContactCard = (props: ContactCardProps): JSX.Element => {
  // Context.
  const { openContactCard, setOpenContactCard, sendNotification } = useContext(UIContext);
  const { contacts, setContacts } = useContext(AccountContext);

  // State.
  const [editMode, setEditMode] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  // Errors.
  const [nameError, setNameError] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<boolean>(false);
  const [nameErrMessage, setNameErrMessage] = useState<string>("");
  const [nameErrString, setNameErrString] = useState<string>("");
  const [addressErrMessage, setAddressErrMessage] = useState<string>("");
  const [addressErrString, setAddressErrString] = useState<string>("");

  useEffect(() => {
    if (openContactCard) {
      if (props.isNew) {
        setEditMode(true);
      } else {
        setEditMode(false);
      }
      setName(props.name);
      setAddress(props.address);
      setRemarks(props.remarks);
    }
  }, [openContactCard]);

  useEffect(() => {
    if (name !== nameErrString) {
      setNameError(false);
    }
    if (name !== "") {
      setNameError(false);
    }
  }, [name]);

  useEffect(() => {
    if (address !== addressErrString) {
      setAddressError(false);
    }
    if (address !== "") {
      setAddressError(false);
    }
  }, [address]);

  const handleEdit = (): void => {
    setEditMode(true);
  };

  const normalizeString = (input: string) => {
    return input.replace(" ", "");
  };

  const handleSave = async (): Promise<void> => {
    let error = false;
    if (name == "") {
      setNameError(true);
      setNameErrMessage("Name field cannot be empty");
      error = true;
    } else if (!validateName(name)) {
      setNameError(true);
      setNameErrMessage("This name is already exist");
      setNameErrString(name);
      error = true;
    }
    if (address == "") {
      setAddressError(true);
      setAddressErrMessage("Address field cannot be empty");
      error = true;
    } else if (!validateAddressInput(address)) {
      console.log(address.length);
      setAddressError(true);
      setAddressErrMessage("Please enter valid Aptos address");
      setAddressErrString(address);
      error = true;
    }
    if (error) {
      return;
    } else {
      await editContact(props.id, name, address, remarks);
      setEditMode(false);
      saveState();
      setOpenContactCard(false);
      if (props.name === name && props.address === address && props.remarks === remarks) {
        sendNotification({
          message: "No changes were made",
          type: "info",
          autoHide: true,
        });
      } else {
        sendNotification({
          message: `Contact ${name} ${props.isNew ? "saved" : "updated"}`,
          type: "success",
          autoHide: true,
        });
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    setOpenContactCard(false);
    await deleteContact(props.id);
    await saveState();
    sendNotification({ message: `Contact ${name} deleted`, type: "warning", autoHide: true });
  };

  const handleCancel = (): void => {
    setOpenContactCard(false);
    clearState();
    clearErrors();
  };

  const validateName = (name: string): boolean => {
    const result = contacts.find((contact) => contact.name === name);
    if (result) {
      if (result.id === props.id) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  const validateAddressInput = (address: string): boolean => {
    switch (address.length) {
      case 64:
      case 66:
        return true;
      default:
        return false;
    }
  };

  const saveState = async (): Promise<void> => {
    const _contacts = await getContacts();
    _contacts.sort((a: IContact, b: IContact) => a.name.localeCompare(b.name));
    setContacts(_contacts);
  };

  const clearState = (): void => {
    setName("");
    setAddress("");
    setRemarks("");
  };

  const clearErrors = (): void => {
    setNameError(false);
    setAddressError(false);
    setNameErrMessage("");
    setAddressErrMessage("");
    setAddressErrString("");
  };

  return (
    <Dialog open={openContactCard} onClose={handleCancel}>
      <DialogTitle sx={{ alignSelf: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <Typography align="center" variant="h6">
            Contact Card
          </Typography>
          {!editMode && (
            <Tooltip title="Delete contact">
              <IconButton sx={{ position: "absolute", ml: "125px", mt: "-3px" }} onClick={handleDelete}>
                <DeleteIcon sx={{ fontSize: "22px" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ maxWidth: "375px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack sx={{ display: "flex" }}>
          <Typography
            align="left"
            color="textSecondary"
            sx={{ ml: "10px", mb: "2px", fontSize: "17px", fontWeight: "450" }}
          >
            Name
          </Typography>
          <TextField
            sx={{ width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left", fontWeight: "450" } }}
            variant="outlined"
            fullWidth={true}
            type="string"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={editMode ? false : true}
            color={nameError ? "error" : "primary"}
          />
          <Box sx={{ height: "20px" }}>
            {nameError && (
              <Typography align="left" color="error" sx={{ ml: "10px", fontSize: "12px", fontWeight: "450" }}>
                {nameErrMessage}
              </Typography>
            )}
          </Box>
          <Typography
            align="left"
            color="textSecondary"
            sx={{ ml: "10px", mb: "2px", fontSize: "17px", fontWeight: "450" }}
          >
            Address
          </Typography>
          {!editMode && (
            <Tooltip title="Copy address">
              <IconButton
                sx={{ position: "absolute", mt: "98px", ml: "75px", zIndex: 1 }}
                onClick={() => copyToClipboard(address)}
              >
                <ContentCopyIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
          )}
          <TextField
            sx={{ width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left", fontWeight: "450" } }}
            variant="outlined"
            fullWidth={true}
            multiline={true}
            rows={3}
            type="string"
            value={address}
            onChange={(e) => setAddress(normalizeString(e.target.value))}
            disabled={editMode ? false : true}
            color={addressError ? "error" : "primary"}
          />
          <Box sx={{ height: "20px" }}>
            {addressError && (
              <Typography align="left" color="error" sx={{ ml: "10px", fontSize: "12px", fontWeight: "450" }}>
                {addressErrMessage}
              </Typography>
            )}
          </Box>
          <Typography
            align="left"
            color="textSecondary"
            sx={{ ml: "10px", mb: "2px", fontSize: "17px", fontWeight: "450" }}
          >
            Remarks
          </Typography>
          <TextField
            sx={{ width: "275px" }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { textAlign: "left", fontWeight: "450" } }}
            variant="outlined"
            fullWidth={true}
            type="string"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={editMode ? false : true}
          />
        </Stack>
      </DialogContent>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          mt: 2,
        }}
      >
        <Button sx={{ width: "121px", mr: 4 }} variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          sx={{
            background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
            width: "121px",
          }}
          variant="contained"
          onClick={editMode ? handleSave : handleEdit}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
      </Stack>
    </Dialog>
  );
};

export default ContactCard;
