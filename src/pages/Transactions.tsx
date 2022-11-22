/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Container,
  IconButton,
  List,
  Pagination,
  Stack,
  Tab,
  Tooltip,
  Typography,
} from "@mui/material";
import { Types } from "aptos";
import { useContext, useEffect, useState } from "react";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import DepositEventCard from "../components/DepositEventCard";
import Footer from "../components/Footer";
import WithdrawEventCard from "../components/WithdrawEventCard";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import debug from "../utils/debug";

// const style = {
//   width: "100%",
//   maxWidth: 360,
//   bgcolor: "background.paper",
// };

interface IEvent extends Types.Event {
  version: string;
}

interface IEventQuery {
  start: number;
  limit: number;
}

const Transactions = (): JSX.Element => {
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
  const [value, setValue] = useState<string>("1");
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(0);
  const [query, setQuery] = useState<IEventQuery>();

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
          getDepositEvents(query!);
        } else {
          setDepositEvents([]);
        }
      }
      if (value === "2") {
        debug.log("query", query);
        if (withdrawEventsCounter > 0) {
          getWithdrawEvents(query!);
        } else {
          setWithdrawEvents([]);
        }
      }
    }
  }, [query, value]);

  // Handles tab's change (Deposit / Withdraw).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (_event: any, newValue: string): void => {
    if (newValue === "1") {
      setQuery(undefined);
    }
    if (newValue === "2") {
      setQuery(undefined);
    }
    setValue(newValue);
    if (page !== 1) {
      setPage(1);
    }
  };

  // Handles page change.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePageChange = async (_event: any, newPage: number): Promise<void> => {
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
  const countStart = (counter: number): number => {
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
    } else {
      return 0;
    }
  };

  // Counts query limit.
  const countLimit = (counter: number): number => {
    if (counter === 0) {
      return 1;
    } else if (counter > limitPerPage) {
      return page === pages && page !== 1 ? limitPerPage - (page * limitPerPage - counter) : limitPerPage;
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
                          src={darkMode ? currentAsset!.data.logo_alt : currentAsset!.data.logo}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                  <TabList onChange={handleChange}>
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
                  // overflow: "hidden",
                  // overflowY: "scroll",
                }}
              >
                <TabPanel value="1">
                  {depositEvents?.length > 0 ? (
                    <List
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        ml: "12px",
                        mt: "-24px",
                      }}
                      component="nav"
                    >
                      <Typography noWrap>
                        {depositEvents.map((depositEvent, sequence_number) => (
                          <DepositEventCard depositEvent={depositEvent as IEvent} key={sequence_number} />
                        ))}
                      </Typography>
                    </List>
                  ) : (
                    <Typography sx={{ mt: 4 }} align="center" variant="h6" color="textPrimary" gutterBottom>
                      No transactions found
                    </Typography>
                  )}
                </TabPanel>
                <TabPanel value="2">
                  {withdrawEvents?.length > 0 ? (
                    <List
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        ml: "12px",
                        mt: "-24px",
                      }}
                      component="nav"
                    >
                      {withdrawEvents.map((withdrawEvent, sequence_number) => (
                        <WithdrawEventCard withdrawEvent={withdrawEvent as IEvent} key={sequence_number} />
                      ))}
                    </List>
                  ) : (
                    <Typography sx={{ mt: 4 }} align="center" variant="h6" color="textPrimary" gutterBottom>
                      No transactions found
                    </Typography>
                  )}
                </TabPanel>
              </Box>
            </TabContext>
          </Box>
        </CardContent>
        <CardActions sx={{ mt: "-25px", mb: "12px" }}>
          <Pagination
            count={pages}
            page={page}
            siblingCount={0}
            boundaryCount={1}
            variant="text"
            size="medium"
            shape="circular"
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
