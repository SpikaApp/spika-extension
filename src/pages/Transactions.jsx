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
  Link,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ReceivedEventCard from "../components/ReceivedEventCard";
import TransactionCard from "../components/TransactionCard";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};

const Transactions = () => {
  const { accountImported, currentAddress } = useContext(AccountContext);
  const { getReceivedEvents, getSentTransactions, receivedEvents, transactions } =
    useContext(Web3Context);
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
      }, 30000);
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
      <Card sx={{ mb: 2, minHeight: 350 }}>
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
                  <Tab
                    label={
                      <Typography variant="subtitle1" color="textPrimary">
                        Sent
                      </Typography>
                    }
                    value="1"
                  />
                  <Tab
                    label={
                      <Typography variant="subtitle1" color="textPrimary">
                        Received
                      </Typography>
                    }
                    value="2"
                  />
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
                  <Typography
                    sx={{ mt: 4 }}
                    align="center"
                    variant="h6"
                    color="textPrimary"
                    gutterBottom
                  >
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
                  <Typography
                    sx={{ mt: 4 }}
                    align="center"
                    variant="h6"
                    color="textPrimary"
                    gutterBottom
                  >
                    No transactions found
                  </Typography>
                )}
              </TabPanel>
            </TabContext>
          </Box>
        </CardContent>
        <CardActions>
          <Typography variant="subtitle1" align="center" color="textPrimary" gutterBottom>
            View account in{" "}
            <Link
              href={`https://explorer.devnet.aptos.dev/account/${currentAddress}`}
              underline="none"
              target="_blank"
            >
              Aptos Explorer <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Link>
          </Typography>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Transactions;
