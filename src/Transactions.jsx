import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardActions,
  CardContent,
  List,
  Box,
  Tab,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ReceivedEventCard from "./components/ReceivedEventCard";
import TransactionCard from "./components/TransactionCard";
import Loading from "./components/Loading";
import { AccountContext } from "./context/AccountContext";

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};

const Transactions = () => {
  const { accountImported, getReceivedEvents, getSentTransactions, receivedEvents, transactions } =
    useContext(AccountContext);
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (accountImported) {
      getReceivedEvents();
      getSentTransactions();
      const updateAccountResources = window.setInterval(() => {
        getReceivedEvents();
        getSentTransactions();
      }, 10000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [accountImported]);

  return (
    <Container maxWidth="xs">
      <Typography variant="h6" align="center" color="textPrimary" gutterBottom>
        <CompareArrowsIcon sx={{ marginTop: 2, fontSize: 48 }} color="primary" />
        <br />
        Latest Transactions
      </Typography>
      <Card>
        <CardContent>
          <Box
            sx={{
              width: "100%",
              typography: "body1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                  <Tab label="Sent" value="1" />
                  <Tab label="Received" value="2" />
                </TabList>
              </Box>

              <TabPanel value="1">
                {transactions?.length > 0 ? (
                  <List
                    sx={(style, { display: "flex", flexDirection: "column", alignItems: "start" })}
                    component="nav"
                    aria-label="sentTxns"
                  >
                    {transactions.map((transaction, sequence_number) => (
                      <TransactionCard transaction={transaction} key={sequence_number} />
                    ))}
                  </List>
                ) : (
                  <Typography align="center" color="textPrimary" gutterBottom>
                    No transactions found
                  </Typography>
                )}
              </TabPanel>
              <TabPanel value="2">
                {receivedEvents?.length > 0 ? (
                  <List
                    sx={(style, { display: "flex", flexDirection: "column", alignItems: "start" })}
                    component="nav"
                    aria-label="receivedTxns"
                  >
                    {receivedEvents.map((receivedEvent, sequence_number) => (
                      <ReceivedEventCard receivedEvent={receivedEvent} key={sequence_number} />
                    ))}
                  </List>
                ) : (
                  <Typography align="center" color="textPrimary" gutterBottom>
                    No transactions found
                  </Typography>
                )}
              </TabPanel>
            </TabContext>
          </Box>
        </CardContent>
        <CardActions></CardActions>
      </Card>

      <Loading />
    </Container>
  );
};

export default Transactions;
