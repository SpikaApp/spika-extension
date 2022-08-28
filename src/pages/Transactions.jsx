import React, { useContext, useState, useEffect } from "react";
import { Container, Typography, Card, CardContent, List, Box, Tab, Link } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import WithdrawEventCard from "../components/WithdrawEventCard";
import DepositEventCard from "../components/DepositEventCard";
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
  const { getEvents, withdrawEvents, depositEvents } = useContext(Web3Context);

  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (accountImported) {
      getEvents("withdraw_events");
      getEvents("deposit_events");
      const updateAccountResources = window.setInterval(() => {
        getEvents("withdraw_events");
        getEvents("deposit_events");
      }, 5000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [accountImported]);

  return (
    <Container maxWidth="xs">
      <Card sx={{ mt: "100px", minHeight: "450px" }}>
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
                        Deposit
                      </Typography>
                    }
                    value="1"
                  />
                  <Tab
                    label={
                      <Typography variant="subtitle1" color="textPrimary">
                        Withdraw
                      </Typography>
                    }
                    value="2"
                  />
                </TabList>
              </Box>
              <Box sx={{ height: "345px", overflow: "hidden", overflowY: "scroll" }}>
                <TabPanel value="1">
                  {depositEvents?.length > 0 ? (
                    <List
                      sx={
                        (style,
                        {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "start",
                        })
                      }
                      component="nav"
                    >
                      {depositEvents.map((depositEvent, sequence_number) => (
                        <DepositEventCard depositEvent={depositEvent} key={sequence_number} />
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
                  {withdrawEvents?.length > 0 ? (
                    <List
                      sx={
                        (style, { display: "flex", flexDirection: "column", alignItems: "start" })
                      }
                      component="nav"
                    >
                      {withdrawEvents.map((withdrawEvent, sequence_number) => (
                        <WithdrawEventCard withdrawEvent={withdrawEvent} key={sequence_number} />
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
              </Box>
            </TabContext>
          </Box>
        </CardContent>
      </Card>
      <Typography sx={{ mt: 2 }} variant="subtitle1" align="center" color="textPrimary">
        View account in{" "}
        <Link
          href={`https://explorer.devnet.aptos.dev/account/${currentAddress}`}
          underline="none"
          target="_blank"
          color="link"
        >
          Aptos Explorer <OpenInNewIcon sx={{ fontSize: 16 }} />
        </Link>
      </Typography>
    </Container>
  );
};

export default Transactions;
