/**
 * SpikaSwap powered by HippoSwap
 * ======================================
 * TODO:
 * - (Optional) Provide an option to review and change routes
 */

import { useContext, useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Stack,
  IconButton,
  Box,
  Input,
  DialogContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import { NoticeBox } from "../components/lib";
import { LoadingButton } from "@mui/lab";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import { NumericFormat } from "react-number-format";
import { TradeAggregator } from "@manahippo/hippo-sdk";
import { client as devnetClient, hippoClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import { stringToValue, valueToString } from "../utils/values";
import debug from "../utils/debug";

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
  const {
    getBalance,
    estimateTransaction,
    isValidTransaction,
    estimatedTxnResult,
    clearPrevEstimation,
  } = useContext(Web3Context);
  const [type, setType] = useState("");
  const [baseCoinBalance, setBaseCoinBalance] = useState(0);
  const [quoteCoinBalance, setQuoteCoinBalance] = useState(0);
  const [swapAmount, setSwapAmount] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quote, setQuote] = useState();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [swapEnabled, setSwapEnabled] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [badPair, setBadPair] = useState(false);
  const [swapPayload, setSwapPayload] = useState({});

  // Checks if account holds at least 2 swappable tokens and enables swap.
  useEffect(() => {
    if (accountAssets.length !== 0 && !isFetching) {
      if (swapSupportedAssets.length > 1 && !isFetching) {
        setSwapEnabled(true);
        setBaseCoin(swapSupportedAssets[0]);
        setQuoteCoin(swapSupportedAssets[1]);
        setDataFetched(true);
        debug.log("swap enabled", true);
      } else {
        setSwapEnabled(false);
        setBaseCoin(aptosCoin);
        setQuoteCoin(aptosCoin);
        setDataFetched(true);
        debug.log("swap enabled", false);
      }
    }
  }, [swapSupportedAssets, isFetching]);

  // Disable swap is current network !== Devnet.
  useEffect(() => {
    if (currentNetwork.name !== "Devnet") {
      setSwapEnabled(false);
      setBaseCoin(aptosCoin);
      setQuoteCoin(aptosCoin);
      setDataFetched(true);
      debug.log("not on Devnet, swap enabled: ", false);
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
      debug.log("baseCoin balance fetched");
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
      debug.log("quoteCoin balance fetched");
    }
  }, [quoteCoin]);

  // Fetch balances.
  const getCurrentBalance = async (type, coin) => {
    const balance = await getBalance(coin);
    if (type === "baseCoin") {
      setBaseCoinBalance(balance);
    } else if (type === "quoteCoin") {
      setQuoteCoinBalance(balance);
    } else {
      console.log("Unknown or undefined coin type");
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
      Number(valueToString(baseCoin, swapAmount) < Number(baseCoinBalance)) &&
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
          debug.log("insufficient balance");
          debug.log("balance", baseCoinBalance);
          debug.log("swapAmount", valueToString(baseCoin, swapAmount));
        } else {
          setInsufficientBalance(false);
          debug.log("balance OK");
          debug.log("balance", baseCoinBalance);
          debug.log("swapAmount", valueToString(baseCoin, swapAmount));
        }
      }
    } else {
      setInsufficientBalance(false);
    }
  }, [swapAmount]);

  // Opens transaction preview dialog if estimatated txn was successfull.
  useEffect(() => {
    if (isValidTransaction) {
      debug.log("estimated txn:", estimatedTxnResult);
      debug.log("best route quote:", quote);
      setOpenConfirmSendDialog(true);
    }
  }, [isValidTransaction]);

  useEffect(() => {
    if (alertSignal === 31 && baseCoin && quoteCoin) {
      clearSwap();
      getCurrentBalance("baseCoin", baseCoin);
      getCurrentBalance("quoteCoin".quoteCoin);
    }
  }, [alertSignal]);

  // Function that changes baseCoin and quoteCoin coins when button is pressed.
  const baseToQuote = () => {
    setBaseCoin(quoteCoin);
    setQuoteCoin(baseCoin);
  };

  const hippoTradeAggregator = async () => {
    let agg;
    try {
      const netConf = hippoClient();
      debug.log("netConf", netConf);
      agg = await TradeAggregator.create(devnetClient);
    } catch (error) {
      console.log(error);
    }
    debug.log(agg);
    return agg;
  };

  // Function that sends quote request.
  const aggListQuotes = async (fromSymbol, toSymbol, inputUiAmt) => {
    setIsLocalLoading(true);
    try {
      const agg = await hippoTradeAggregator();
      const xCoinInfo = agg.registryClient.getCoinInfoBySymbol(fromSymbol);
      debug.log("xCoinInfo", xCoinInfo);
      const yCoinInfo = agg.registryClient.getCoinInfoBySymbol(toSymbol);
      debug.log("yCoinInfo", toSymbol);
      const inputAmt = parseFloat(inputUiAmt);
      debug.log("inputAmt", inputUiAmt);
      const quotes = await agg.getQuotes(inputAmt, xCoinInfo, yCoinInfo);
      debug.log("quotes", quotes);
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
  const aggSwap = async (fromSymbol, toSymbol, inputUiAmt) => {
    setIsLocalLoading(true);
    clearPrevEstimation();
    try {
      const agg = await hippoTradeAggregator();
      const xCoinInfo = agg.registryClient.getCoinInfoBySymbol(fromSymbol);
      const yCoinInfo = agg.registryClient.getCoinInfoBySymbol(toSymbol);
      const inputAmt = parseFloat(inputUiAmt);
      const quotes = await agg.getQuotes(inputAmt, xCoinInfo, yCoinInfo);
      if (quotes.length === 0) {
        console.log("No route available");
        return;
      }
      const payload = quotes[0].route.makePayload(inputAmt, 0);
      setSwapPayload(payload);
      debug.log("payload", payload);
      await estimateTransaction(payload, true);
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
          <CardContent align="center" sx={{ mt: 1 }}>
            <Stack sx={{ display: "flex", alignItems: "center", maxWidth: "295px" }}>
              <Typography
                variant="subtitle2"
                color="textPrimary"
                sx={{ display: "flex", alignSelf: "start", ml: "12px", fontWeight: 600 }}
              >
                Base
              </Typography>
              <Box component={DialogContent} sx={{ border: 2, borderColor: "#9e9e9e" }}>
                <Stack
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    width: "275px",
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
                      <Typography
                        variant="h6"
                        color="textPrimary"
                        sx={{ ml: "4px", mr: "6px", mt: "4px" }}
                      >
                        {baseCoin.data.symbol}
                      </Typography>
                    </Stack>
                    <Typography color="textSecondary" align="left" variant="subtitle2">
                      Current balance:
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
                        placeholder="0.0"
                      />
                    </Stack>
                    <Typography
                      color="textSecondary"
                      sx={{ mt: "4px", mr: "12px" }}
                      align="right"
                      variant="subtitle2"
                    >
                      {stringToValue(baseCoin, baseCoinBalance)}
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
                Quote
              </Typography>
              <Box component={DialogContent} sx={{ mb: 3, border: 2, borderColor: "#9e9e9e" }}>
                <Stack
                  direction="row"
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    width: "275px",
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
                      <Typography
                        variant="h6"
                        color="textPrimary"
                        sx={{ ml: "4px", mr: "6px", mt: "4px" }}
                      >
                        {quoteCoin.data.symbol}
                      </Typography>
                    </Stack>
                    <Typography color="textSecondary" align="left" variant="subtitle2">
                      Current balance:
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
                    <Typography
                      color="textSecondary"
                      sx={{ mt: "4px", mr: "12px" }}
                      align="right"
                      variant="subtitle2"
                    >
                      {stringToValue(quoteCoin, quoteCoinBalance)}
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
                      width: "100%",
                    }
                  : { width: "100%" }
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
                aggSwap(baseCoin.data.symbol, quoteCoin.data.symbol, swapAmount, true);
              }}
            >
              {insufficientBalance && "Insufficient balance"}
              {swapAmount === "" && !insufficientBalance && !badPair && "Enter an amount"}
              {swapEnabled && !insufficientBalance && badPair && "Cannot swap same coins"}
              {swapEnabled && !insufficientBalance && swapAmount !== "" && !badPair && "Swap"}
              {!swapEnabled && !currentNetwork.name !== "Devnet" && "Not supported"}
            </LoadingButton>
            {dataFetched && !swapEnabled && currentNetwork.name === "Devnet" && (
              <NoticeBox
                mt={3}
                text="Account shall hold at least two eligible for swap assets in order to use this function."
              />
            )}
            {dataFetched && !swapEnabled && !isFetching && currentNetwork.name !== "Devnet" && (
              <NoticeBox mt={3} text={`Swap is not supported on ${currentNetwork.name} yet.`} />
            )}
            {dataFetched &&
              swapEnabled &&
              !isFetching &&
              currentNetwork.name === "Devnet" &&
              badPair && (
                <NoticeBox
                  mt={3}
                  text={`Cannot swap ${baseCoin.data.symbol} to ${quoteCoin.data.symbol}. They are the same coin.`}
                />
              )}
          </CardContent>
        </Card>
      )}
      <AccountAssetsDialog type={type} />
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
