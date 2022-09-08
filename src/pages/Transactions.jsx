import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  Box,
  Tab,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Footer from "../components/Footer";
import WithdrawEventCard from "../components/WithdrawEventCard";
import DepositEventCard from "../components/DepositEventCard";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};

const Transactions = () => {
  const { darkMode, handleAccountAssetsUI } = useContext(UIContext);
  const { accountImported, currentAddress, currentAsset } = useContext(AccountContext);
  const { getDepositEvents, getWithdrawEvents, withdrawEvents, depositEvents } =
    useContext(Web3Context);

  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (accountImported) {
      getDepositEvents();
      getWithdrawEvents();
      const updateAccountResources = window.setInterval(() => {
        getDepositEvents();
        getWithdrawEvents();
      }, 10000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [currentAsset]);

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
              <Box
                sx={{
                  borderColor: "divider",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {accountImported && (
                    <Tooltip title={"Switch active asset"}>
                      <IconButton onClick={handleAccountAssetsUI}>
                        <Box
                          sx={{ width: "24px", height: "24px" }}
                          component="img"
                          src={darkMode ? currentAsset.data.logo_alt : currentAsset.data.logo}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
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
                </Stack>
              </Box>
              <Box
                sx={{
                  height: "345px",
                  width: "295px",
                  overflow: "hidden",
                  overflowY: "scroll",
                }}
              >
                <TabPanel value="1">
                  {depositEvents?.length > 0 ? (
                    <List
                      align="start"
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
                      <Typography noWrap>
                        {depositEvents.map((depositEvent, sequence_number) => (
                          <DepositEventCard depositEvent={depositEvent} key={sequence_number} />
                        ))}
                      </Typography>
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
      <Footer />
      <AccountAssetsDialog />
    </Container>
  );
};

export default Transactions;
