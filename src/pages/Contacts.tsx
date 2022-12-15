import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ContactCard from "../components/ContactCard";
import Footer from "../components/Footer";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { IContact } from "../interface";
import copyToClipboard from "../utils/copyToClipboard";

const Contacts = (): JSX.Element => {
  const { handleContactCardUI } = useContext(UIContext);
  const { accountImported, contacts } = useContext(AccountContext);
  const [contactList, setContactList] = useState<Array<IContact>>([]);
  const [selectedContact, setSelectedContact] = useState<IContact | undefined>(undefined);
  const [searchString, setSearchString] = useState<string>("");

  useEffect(() => {
    if (contacts) {
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

  const handleOpenContact = (id: string) => {
    const contact = contacts.find((contact) => contact.id === id);
    setSelectedContact(contact);
    handleContactCardUI();
  };

  const handleAddContact = () => {
    const _id = uuidv4();
    setSelectedContact({ id: _id, name: "", address: "", remarks: "", isNew: true });
    handleContactCardUI();
  };

  const clearSearch = (): void => {
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
      maxWidth: "auto",
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
    <Container maxWidth="xs">
      <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
        {accountImported && (
          <CardContent sx={{ alignSelf: "center", mt: 0.5 }}>
            <Stack sx={{ minWidth: "275px", alignItems: "center" }}>
              <Typography sx={{ fontSize: "24px", fontWeight: "450", mb: "10px" }}>Contacts</Typography>
              <Box
                sx={{
                  width: "75%",
                  display: "fex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search sx={{ width: "90%" }}>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    sx={{ width: "100%" }}
                    placeholder="Search…"
                    inputProps={{ "aria-label": "search" }}
                    autoFocus={true}
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                  />
                </Search>
              </Box>
              {searchString !== "" && (
                <Stack sx={{ position: "absolute", display: "flex", flexDirection: "row", mt: "47px", ml: "240px" }}>
                  <Tooltip title="Clear search">
                    <IconButton onClick={clearSearch}>
                      <ClearIcon sx={{ fontSize: "22px" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              <Paper sx={{ width: "270px", minHeight: "210px", bgcolor: "background.paper", mt: "18px" }}>
                {contactList && contactList.length > 0 ? (
                  <List component="nav" sx={{ overflow: "hidden", overflowY: "visible", maxHeight: "210px" }}>
                    {contactList.map((contact, index) => (
                      <Stack key={contact.id}>
                        <ListItemButton sx={{ height: "40px" }} onClick={() => handleOpenContact(contact.id)}>
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
                  <Typography align="center" sx={{ mt: "75px", fontSize: "20px", fontWeight: "450" }}>
                    No contacts found
                  </Typography>
                )}
              </Paper>
              <Button variant="outlined" sx={{ mt: "10px", height: "35px", width: "135px" }} onClick={handleAddContact}>
                Add contact
              </Button>
            </Stack>
          </CardContent>
        )}
      </Card>
      <Footer />
      {selectedContact && (
        <ContactCard
          id={selectedContact.id}
          name={selectedContact.name}
          address={selectedContact.address}
          remarks={selectedContact.remarks}
          isNew={selectedContact.isNew ? true : false}
        />
      )}
    </Container>
  );
};

export default Contacts;
