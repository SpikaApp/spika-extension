/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * SpikaSwap powered by HippoSwap
 * ======================================
 * TODO:
 * - (Optional) Provide an option to review and change routes
 */

import { TradeAggregator } from "@manahippo/hippo-sdk";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  DialogContent,
  IconButton,
  Input,
  Stack,
  Typography,
} from "@mui/material";
import { AptosClient } from "aptos";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import Footer from "../components/Footer";
import { NoticeBox } from "../components/lib";
import { AccountContext } from "../context/AccountContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { ICoin } from "../interface";
import { networkList } from "../lib/accountNetworks";
import { hippoClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import debug from "../utils/debug";
import { stringToValue, valueToString } from "../utils/values";

const Swap = () => {
  const { handleAccountAssetsUI, setOpenConfirmSendDialog, darkMode } = useContext(UIContext);
  const {
    alertSignal,
    accountImported,
    isFetching,
    accountAssets,
    baseCoin,
    setBaseCoin,
    quoteCoin,
    setQuoteCoin,
    swapSupportedAssets,
    currentNetwork,
  } = useContext(AccountContext);
  const { getBalance, estimateTransaction, isValidTransaction, estimatedTxnResult, clearPrevEstimation } =
    useContext(Web3Context);
  const [type, setType] = useState<string>("");
  const [baseCoinBalance, setBaseCoinBalance] = useState<number>(0);
  const [quoteCoinBalance, setQuoteCoinBalance] = useState<number>(0);
  const [swapAmount, setSwapAmount] = useState<string>("");
  const [quoteAmount, setQuoteAmount] = useState<string>("");
  const [quote, setQuote] = useState<any>();
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [swapEnabled, setSwapEnabled] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false);
  const [badPair, setBadPair] = useState<boolean>(false);
  const [swapPayload, setSwapPayload] = useState<any>({});
  const [underMaintenance] = useState<boolean>(true);

  // Checks if account holds at least 2 swappable tokens and enables swap.
  useEffect(() => {
    if (accountAssets.length !== 0 && !isFetching) {
      if (swapSupportedAssets.length > 1 && !isFetching) {
        // setSwapEnabled(true);
        setBaseCoin(swapSupportedAssets[0]);
        setQuoteCoin(swapSupportedAssets[1]);
        setDataFetched(true);
        debug.log("Swap enabled:", true);
      } else {
        setSwapEnabled(false);
        setBaseCoin(aptosCoin);
        setQuoteCoin(aptosCoin);
        setDataFetched(true);
        debug.log("Swap enabled:", false);
      }
    }
  }, [swapSupportedAssets, isFetching]);

  // Disable swap is current network !== Devnet.
  useEffect(() => {
    if (currentNetwork!.name !== "Testnet") {
      setSwapEnabled(false);
      setBaseCoin(aptosCoin);
      setQuoteCoin(aptosCoin);
      setDataFetched(true);
      debug.log("Not on Testnet, swap disabled.");
    }
  }, [swapSupportedAssets]);

  // On baseCoin change => update balance.
  useEffect(() => {
    if (accountImported) {
      if (baseCoin.data.symbol === quoteCoin.data.symbol) {
        setBadPair(true);
      } else {
        setBadPair(false);
      }
      getCurrentBalance("baseCoin", baseCoin);
      debug.log(`Sell coin ${baseCoin.data.symbol} balance fetched.`);
    }
  }, [baseCoin]);

  // On quoteCoin change => update balance
  useEffect(() => {
    if (accountImported) {
      if (quoteCoin.data.symbol === baseCoin.data.symbol) {
        setBadPair(true);
      } else {
        setBadPair(false);
      }
      getCurrentBalance("quoteCoin", quoteCoin);
      debug.log(`Buy coin ${quoteCoin.data.symbol} balance fetched.`);
    }
  }, [quoteCoin]);

  // Fetch balances.
  const getCurrentBalance = async (type: string, coin: ICoin): Promise<void> => {
    const balance = await getBalance(coin);
    if (type === "baseCoin") {
      setBaseCoinBalance(Number(balance));
    } else if (type === "quoteCoin") {
      setQuoteCoinBalance(Number(balance));
    } else {
      debug.log("Unknown or undefined coin type.");
    }
  };

  // If base currency is changed => clear values and clear previous estimation.
  useEffect(() => {
    if (baseCoin) {
      setSwapAmount("");
      setQuoteAmount("");
      clearPrevEstimation();
    }
  }, [baseCoin]);

  // If new quote received => set quoted amount based on best calculated route.
  useEffect(() => {
    if (quote) {
      setQuoteAmount(quote.quote.outputUiAmt);
    }
  }, [quote]);

  // Continiously send quote requests while typing swapAmount.
  // todo: this might result blocking from node's API and needs to be improved.
  useEffect(() => {
    debug.log(swapAmount);
    if (
      Number(valueToString(baseCoin, swapAmount)) < Number(baseCoinBalance) &&
      swapAmount !== "" &&
      Number(swapAmount) > 0 &&
      !badPair
    ) {
      aggListQuotes(baseCoin.data.symbol, quoteCoin.data.symbol, swapAmount);
    }
    if (swapAmount === "") {
      setQuoteAmount("");
    }
    if (swapAmount !== "") {
      if (baseCoin) {
        if (Number(baseCoinBalance) <= Number(valueToString(baseCoin, swapAmount))) {
          setInsufficientBalance(true);
          setQuoteAmount("");
          debug.log(
            `Insufficient balance: ${baseCoinBalance}, requested amount to swap: ${valueToString(baseCoin, swapAmount)}`
          );
        } else {
          setInsufficientBalance(false);
          debug.log(
            `Balance in range: ${baseCoinBalance}, requested amount to swap: ${valueToString(baseCoin, swapAmount)}`
          );
        }
      }
    } else {
      setInsufficientBalance(false);
    }
  }, [swapAmount]);

  // Opens transaction preview dialog if estimatated txn was successfull.
  useEffect(() => {
    if (isValidTransaction) {
      debug.log("Estimated transaction result updated:", estimatedTxnResult);
      debug.log("Best route quote updated:", quote);
      setOpenConfirmSendDialog(true);
    }
  }, [isValidTransaction]);

  useEffect(() => {
    if (alertSignal === 31 && baseCoin && quoteCoin) {
      clearSwap();
      getCurrentBalance("baseCoin", baseCoin);
      getCurrentBalance("quoteCoin", quoteCoin);
    }
  }, [alertSignal]);

  // Function that changes baseCoin and quoteCoin coins when button is pressed.
  const baseToQuote = (): void => {
    setBaseCoin(quoteCoin);
    setQuoteCoin(baseCoin);
  };

  const hippoTradeAggregator = async (): Promise<TradeAggregator | undefined> => {
    let agg;
    const client = new AptosClient(networkList[1].data.node_url);
    debug.log(client);
    try {
      const netConf = hippoClient();
      debug.log(netConf);
      debug.log("netConf:", netConf);
      agg = await TradeAggregator.create(client as any, netConf);
    } catch (error) {
      console.log(error);
    }
    debug.log("Trade Aggregator client:", agg);
    return agg;
  };

  // Function that sends quote request.
  const aggListQuotes = async (fromSymbol: string, toSymbol: string, inputUiAmt: string): Promise<void> => {
    setIsLocalLoading(true);
    try {
      const agg = await hippoTradeAggregator();
      const xCoinInfo = agg!.registryClient.getCoinInfoBySymbol(fromSymbol);
      debug.log("xCoinInfo:", xCoinInfo);
      const yCoinInfo = agg!.registryClient.getCoinInfoBySymbol(toSymbol);
      debug.log("yCoinInfo:", toSymbol);
      const inputAmt = parseFloat(inputUiAmt);
      debug.log("inputAmt:", inputUiAmt);
      const quotes = await agg!.getQuotes(inputAmt, xCoinInfo, yCoinInfo);
      debug.log("Quotes:", quotes);
      setQuote(quotes[0]);
      // for (const quote of quotes) {
      //   console.log("###########");
      //   quote.route.debugPrint();
      //   console.log(`Quote input: ${quote.quote.inputUiAmt}`);
      //   console.log(`Quote output: ${quote.quote.outputUiAmt}`);
      // }
    } catch (error) {
      console.log(error);
    }
    setIsLocalLoading(false);
  };

  // Function that swaps tokens.
  const aggSwap = async (fromSymbol: string, toSymbol: string, inputUiAmt: string): Promise<void> => {
    setIsLocalLoading(true);
    clearPrevEstimation();
    try {
      const agg = await hippoTradeAggregator();
      const xCoinInfo = agg!.registryClient.getCoinInfoBySymbol(fromSymbol);
      const yCoinInfo = agg!.registryClient.getCoinInfoBySymbol(toSymbol);
      const inputAmt = parseFloat(inputUiAmt);
      const quotes = await agg!.getQuotes(inputAmt, xCoinInfo, yCoinInfo);
      if (quotes.length === 0) {
        console.log("No routes available.");
        return;
      }
      const payload = quotes[0].route.makePayload(inputAmt, 0);
      setSwapPayload(payload);
      debug.log("Swap payload prepared:", payload);
      await estimateTransaction(payload as any, true);
    } catch (error) {
      console.log(error);
    }
    // clearSwap();
    setIsLocalLoading(false);
  };

  const clearSwap = () => {
    setSwapAmount("");
    setQuoteAmount("");
    clearPrevEstimation();
  };

  return (
    <Container maxWidth="xs">
      {accountImported && (
        <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
          <CardContent sx={{ mt: 1 }}>
            <Stack sx={{ display: "flex", alignItems: "center", maxWidth: "295px" }}>
              <Typography
                variant="subtitle2"
                color="textPrimary"
                sx={{ display: "flex", alignSelf: "start", ml: "12px", fontWeight: 600 }}
              >
                Sell
              </Typography>
              <Box component={DialogContent} sx={{ border: 2, borderColor: "#9e9e9e" }}>
                <Stack
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    width: "250px",
                    mt: "-8px",
                    mb: "-8px",
                  }}
                >
                  <Stack direction="column" sx={{ ml: "-6px" }}>
                    <Stack direction="row" sx={{ width: "105px" }}>
                      <IconButton
                        disabled={swapEnabled ? false : true}
                        onClick={() => {
                          setType("base");
                          handleAccountAssetsUI();
                        }}
                      >
                        <Box
                          sx={{ width: "24px", height: "24px" }}
                          component="img"
                          src={darkMode ? baseCoin.data.logo_alt : baseCoin.data.logo}
                        />
                      </IconButton>
                      <Typography variant="h6" color="textPrimary" sx={{ ml: "4px", mr: "6px", mt: "4px" }}>
                        {baseCoin.data.symbol}
                      </Typography>
                    </Stack>
                    <Typography color="textSecondary" align="left" variant="subtitle2">
                      Available {baseCoin.data.symbol}:
                    </Typography>
                  </Stack>
                  <Stack direction="column">
                    <Stack direction="row">
                      <NumericFormat
                        thousandSeparator=" "
                        allowNegative={false}
                        allowLeadingZeros={false}
                        decimalScale={baseCoin.data.decimals}
                        customInput={Input}
                        value={swapAmount}
                        onValueChange={(values) => {
                          setSwapAmount(values.value);
                        }}
                        sx={{
                          mt: "4px",
                          ml: "6px",
                          "& ::placeholder": {
                            color: "primary.main",
                          },
                          backgroundColor: darkMode ? "#232323" : "#FFFFFF",
                        }}
                        inputProps={{
                          style: {
                            textAlign: "right",
                            marginRight: "12px",
                            fontWeight: 600,
                          },
                          maxLength: "11",
                        }}
                        disabled={swapEnabled ? false : true}
                        disableUnderline
                        placeholder="0.00"
                      />
                    </Stack>
                    <Typography color="textSecondary" sx={{ mt: "4px", mr: "12px" }} align="right" variant="subtitle2">
                      {stringToValue(baseCoin, baseCoinBalance.toString())}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <IconButton
                disabled={swapEnabled ? false : true}
                sx={{
                  border: 2,
                  borderColor: "#9e9e9e",
                  backgroundColor: darkMode ? "#484848" : "#f5f5f5",
                  "&:hover": {
                    backgroundColor: darkMode ? "#232323" : "#FFFFFF",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: darkMode ? "#484848" : "#f5f5f5",
                    border: 2,
                  },
                  mt: "-10px",
                  mb: "-10px",
                }}
                onClick={() => baseToQuote()}
              >
                <SwapVertIcon />
              </IconButton>
              <Typography
                variant="subtitle2"
                color="textPrimary"
                sx={{
                  display: "flex",
                  alignSelf: "start",
                  ml: "12px",
                  mt: "-20px",
                  fontWeight: 600,
                }}
              >
                Buy
              </Typography>
              <Box component={DialogContent} sx={{ mb: 3, border: 2, borderColor: "#9e9e9e" }}>
                <Stack
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    width: "250px",
                    mt: "-8px",
                    mb: "-8px",
                  }}
                >
                  <Stack direction="column" sx={{ ml: "-6px" }}>
                    <Stack direction="row" sx={{ width: "105px" }}>
                      <IconButton
                        disabled={swapEnabled ? false : true}
                        onClick={() => {
                          setType("quote");
                          handleAccountAssetsUI();
                        }}
                      >
                        <Box
                          sx={{ width: "24px", height: "24px" }}
                          component="img"
                          src={darkMode ? quoteCoin.data.logo_alt : quoteCoin.data.logo}
                        />
                      </IconButton>
                      <Typography variant="h6" color="textPrimary" sx={{ ml: "4px", mr: "6px", mt: "4px" }}>
                        {quoteCoin.data.symbol}
                      </Typography>
                    </Stack>
                    <Typography color="textSecondary" align="left" variant="subtitle2">
                      Available {quoteCoin.data.symbol}:
                    </Typography>
                  </Stack>
                  <Stack direction="column">
                    <Stack direction="row">
                      <Input
                        sx={{
                          mt: "4px",
                          ml: "6px",
                          color: "text.primary.main",
                          "& ::placeholder": {
                            color: "text.primary",
                          },
                        }}
                        placeholder="0.00"
                        inputProps={{
                          style: {
                            textAlign: "right",
                            marginRight: "12px",
                            fontWeight: 600,
                          },
                        }}
                        disabled={swapEnabled ? false : true}
                        // disabled
                        disableUnderline
                        readOnly={true}
                        value={quoteAmount}
                        type="number"
                      />
                    </Stack>
                    <Typography color="textSecondary" sx={{ mt: "4px", mr: "12px" }} align="right" variant="subtitle2">
                      {stringToValue(quoteCoin, quoteCoinBalance.toString())}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
            <LoadingButton
              sx={
                swapEnabled && !insufficientBalance && swapAmount !== "" && !badPair
                  ? {
                      background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                      width: "250px",
                    }
                  : { width: "250px" }
              }
              variant="contained"
              loading={isLocalLoading}
              loadingIndicator={<CircularProgress sx={{ color: "#FFFFFF" }} size={18} />}
              disabled={
                (swapEnabled ? false : true) ||
                (insufficientBalance ? true : false) ||
                (swapAmount == "" ? true : false) ||
                (badPair ? true : false)
              }
              onClick={() => {
                aggSwap(baseCoin.data.symbol, quoteCoin.data.symbol, swapAmount);
              }}
            >
              {insufficientBalance && "Insufficient balance"}
              {swapAmount === "" && !insufficientBalance && !badPair && swapEnabled && "Enter an amount"}
              {swapEnabled && !insufficientBalance && badPair && "Cannot swap same coins"}
              {swapEnabled && !insufficientBalance && swapAmount !== "" && !badPair && "Swap"}
              {!swapEnabled && "Swap disabled"}
            </LoadingButton>
            {dataFetched && !swapEnabled && currentNetwork!.name === "Testnet" && !underMaintenance && (
              <NoticeBox mt={3} width="250px" text="Account shall hold at least two eligible for swap assets." />
            )}
            {dataFetched && !swapEnabled && !isFetching && currentNetwork!.name !== "Testnet" && !underMaintenance && (
              <NoticeBox mt={3} width="250px" text={`Swap is not supported on ${currentNetwork!.name} network.`} />
            )}
            {dataFetched &&
              swapEnabled &&
              !isFetching &&
              currentNetwork!.name === "Testnet" &&
              badPair &&
              !underMaintenance && (
                <NoticeBox
                  mt={3}
                  width="250px"
                  text={`Cannot swap ${baseCoin.data.symbol} to ${quoteCoin.data.symbol}. They are the same coin.`}
                />
              )}
            {dataFetched && !swapEnabled && !isFetching && underMaintenance && (
              <NoticeBox mt={3} width="250px" text={`Temporarily disabled due to maintenance.`} />
            )}
          </CardContent>
        </Card>
      )}
      <AccountAssetsDialog type={type as any} />
      <ConfirmSendDialog
        type={"swap"}
        quote={quote}
        args={{
          payload: swapPayload,
          isBcs: true,
          silent: false,
        }}
      />
      <Footer />
    </Container>
  );
};

export default Swap;
