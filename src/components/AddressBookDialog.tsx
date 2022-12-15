import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { IContact } from "../interface";
import copyToClipboard from "../utils/copyToClipboard";

const AddressBookDialog = (): JSX.Element => {
  const { openAddressBookDialog, setOpenAddressBookDialog } = useContext(UIContext);
  const { contacts } = useContext(AccountContext);
  const { setRecipientAddress } = useContext(Web3Context);
  const [searchString, setSearchString] = useState<string>("");
  const [contactList, setContactList] = useState<Array<IContact>>([]);

  useEffect(() => {
    if (openAddressBookDialog) {
      setContactList(contacts);
    }
  }, [contacts]);

  useEffect(() => {
    if (searchString !== "") {
      setContactList(search(contacts, searchString));
    } else {
      setContactList(contacts);
    }
  }, [searchString]);

  const search = (list: Array<IContact>, searchStr: string): Array<IContact> => {
    const result: Array<IContact> = [];
    list.filter((contact) => {
      const matchByName = contact.name.toLowerCase().includes(searchStr.toLowerCase());
      const matchByAddress = contact.address.toLowerCase().includes(searchStr.toLowerCase());
      if (matchByName || matchByAddress) {
        result.push(contact);
      }
    });
    return result;
  };

  const handleSelectContact = (address: string): void => {
    setRecipientAddress(address);
    handleCancel();
  };

  const handleCancel = (): void => {
    setOpenAddressBookDialog(false);
    setSearchString("");
  };

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "12ch",
        "&:focus": {
          width: "20ch",
        },
      },
    },
  }));

  return (
    <Dialog open={openAddressBookDialog}>
      <DialogTitle align="center" sx={{ mb: "-12px" }}>
        Address book
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: "250px",
          maxWidth: "375px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ alignItems: "center", ml: "-5px", mr: "1px", minWidth: "250px" }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              autoFocus={true}
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </Search>
        </Box>
        <Paper sx={{ width: "270px", minHeight: "210px", bgcolor: "background.paper", mt: "18px" }}>
          {contactList && contactList.length > 0 ? (
            <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "210px" }}>
              {contactList.map((contact, index) => (
                <Stack key={contact.id}>
                  <ListItemButton sx={{ height: "40px" }} onClick={() => handleSelectContact(contact.address)}>
                    <ListItemText
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        justifyContent: "center",
                      }}
                      primary={contact.name}
                      primaryTypographyProps={{ fontSize: "16px", fontWeight: "450" }}
                    />
                  </ListItemButton>
                  {contactList.length !== index + 1 && <Divider />}
                  <Stack sx={{ position: "absolute", ml: "225px", mt: "2.5px" }}>
                    <Tooltip title="Copy address">
                      <ListItemIcon onClick={() => copyToClipboard(contact.address)}>
                        <IconButton>
                          <ContentCopyIcon sx={{ fontSize: "18px" }} />
                        </IconButton>
                      </ListItemIcon>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </List>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "Center" }}>
              <Typography align="center" sx={{ mt: "50px", fontSize: "20px", fontWeight: "450" }}>
                No contacts found
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressBookDialog;
