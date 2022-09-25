import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  List,
  Box,
  Tab,
  IconButton,
  Stack,
  Tooltip,
  Pagination,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Footer from "../components/Footer";
import WithdrawEventCard from "../components/WithdrawEventCard";
import DepositEventCard from "../components/DepositEventCard";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import debug from "../utils/debug";

const style = {
  width: "100%",
  maxWidth: 360,
  bgcolor: "background.paper",
};

const Transactions = () => {
  const { darkMode, handleAccountAssetsUI } = useContext(UIContext);
  const { accountImported, currentAsset } = useContext(AccountContext);
  const {
    getEventsCount,
    depositEventsCounter,
    withdrawEventsCounter,
    getDepositEvents,
    getWithdrawEvents,
    withdrawEvents,
    setWithdrawEvents,
    depositEvents,
    setDepositEvents,
  } = useContext(Web3Context);
  const [value, setValue] = useState("1");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [query, setQuery] = useState({});

  const limitPerPage = 5;

  // GET request for deposit or withdraw event counter.
  // Interval: 10 seconds.
  useEffect(() => {
    if (accountImported) {
      getEventsCount("deposit_events");
      getEventsCount("withdraw_events");
      const updateAccountResources = window.setInterval(() => {
        getEventsCount("deposit_events");
        getEventsCount("withdraw_events");
      }, 10000);
      return () => window.clearInterval(updateAccountResources);
    }
    return undefined;
  }, [currentAsset]);

  useEffect(() => {
    handleCount();
  }, [value, depositEvents, withdrawEvents]);

  // Counts starting number for getEventsByEventHandle query.
  useEffect(() => {
    if (value === "1") {
      setQuery({
        start: countStart(depositEventsCounter),
        limit: countLimit(depositEventsCounter),
      });
    }
  }, [page, value, depositEventsCounter]);

  useEffect(() => {
    if (value === "2") {
      setQuery({
        start: countStart(withdrawEventsCounter),
        limit: countLimit(withdrawEventsCounter),
      });
    }
  }, [page, value, withdrawEventsCounter]);

  // GET request for deposit or withdraw events with calculated query.
  useEffect(() => {
    if (accountImported) {
      if (value === "1") {
        if (depositEventsCounter > 0) {
          debug.log("query", query);
          getDepositEvents(query);
        } else {
          setDepositEvents([]);
        }
      }
      if (value === "2") {
        debug.log("query", query);
        if (withdrawEventsCounter > 0) {
          getWithdrawEvents(query);
        } else {
          setWithdrawEvents([]);
        }
      }
    }
  }, [query, value]);

  // Handles tab's change (Deposit / Withdraw).
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (page !== 1) {
      setPage(1);
    }
  };

  // Handles page change.
  const handlePageChange = async (event, newPage) => {
    setPage(newPage);
  };

  const handleCount = () => {
    if (value === "1") {
      debug.log("deposit events count: ", depositEventsCounter);
      if (depositEventsCounter > 5) {
        debug.log("more then 5");
        const no = Number(depositEventsCounter / 5);
        debug.log("no", no);
        const number = Math.ceil(Number(depositEventsCounter / 5));
        debug.log("total deposit pages: ", number);
        setPages(number);
      } else {
        setPages(1);
      }
    }
    if (value === "2") {
      debug.log("withdraw events count: ", withdrawEventsCounter);
      if (withdrawEventsCounter > 5) {
        const number = Math.ceil(Number(withdrawEventsCounter / 5));
        debug.log("total withdraw pages: ", number);
        setPages(number);
      } else {
        setPages(1);
      }
    }
  };

  // Counts query start.
  const countStart = (counter) => {
    if (counter <= limitPerPage) {
      debug.log("case 1");
      return 0;
    } else if (page === 1 && counter - limitPerPage > 0) {
      debug.log("case 2");
      return counter - limitPerPage;
    } else if (counter - page * limitPerPage > 0) {
      debug.log("case 3");
      debug.log("page", page);
      return counter - page * limitPerPage;
    } else if (counter - page * limitPerPage <= 0) {
      debug.log("case 4");
      debug.log("last page");
      debug.log("page", page);
      return 0;
    }
  };

  // Counts query limit.
  const countLimit = (counter) => {
    if (counter === 0) {
      return 1;
    } else if (counter > limitPerPage) {
      return page === pages && page !== 1
        ? limitPerPage - (page * limitPerPage - counter)
        : limitPerPage;
    } else {
      return counter;
    }
  };

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
                  height: "320px",
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
        <CardActions sx={{ mt: "-25px", mb: "0px" }}>
          <Pagination
            count={pages}
            page={page}
            siblingCount={0}
            boundaryCount={1}
            variant="text"
            size="medium"
            shape="rounded"
            onChange={handlePageChange}
          />
        </CardActions>
      </Card>
      <Footer />
      <AccountAssetsDialog />
    </Container>
  );
};

export default Transactions;
