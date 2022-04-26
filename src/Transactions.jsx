import React, { useContext, useEffect } from "react";
import { Container, Typography, Card, CardActions, CardContent, List } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SentEventCard from "./components/SentEventCard";
import Loading from "./components/Loading";
import { AccountContext } from "./context/AccountContext";

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};

const Transactions = () => {
  const { accountImported, getSentEvents, sentEvents } = useContext(AccountContext);

  useEffect(() => {
    if (accountImported) {
      getSentEvents();

      const updateAccountResources = window.setInterval(() => {
        getSentEvents();
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
          {sentEvents?.length > 0 ? (
            <List sx={(style, { width: 350 })} component="nav" aria-label="receivedTxns">
              {sentEvents.map((sentEvent) => (
                <SentEventCard sentEvent={sentEvent} />
              ))}
            </List>
          ) : (
            <Typography align="center" color="textPrimary" gutterBottom>
              No transactions found
            </Typography>
          )}
        </CardContent>
        <CardActions></CardActions>
      </Card>

      <Loading />
    </Container>
  );
};

export default Transactions;
