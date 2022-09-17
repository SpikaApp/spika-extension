/**
 * SpikaSwap powered by HippoSwap
 * ======================================
 * TODO:
 * 1. take out coins that are not supported by swap
 * 2. implement estimateTransaction and show result or error before swap
 * 3. implement sendTransaction and show result or error after swap
 * 4. throw error and provide option to change if currentNetwork !== "Devnet"
 * 5. implement max swapValue based on U64 (?)
 * 6. correctly display values based on properties: stringToValue, valueToString
 */

import { useContext, useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Box,
  InputAdornment,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIContext";
import { AccountContext } from "../context/AccountContext";
import { Web3Context } from "../context/Web3Context";
import debug from "../utils/debug";
import { TradeAggregator } from "@manahippo/hippo-sdk";
import { client, hippoClient } from "../lib/client";

const Swap = () => {
  const { handleAccountAssetsUI, darkMode } = useContext(UIContext);
  const { accountImported, baseCoin, setBaseCoin, quoteCoin, setQuoteCoin } =
    useContext(AccountContext);
  const { estimateTransaction, clearPrevEstimation } = useContext(Web3Context);
  const [type, setType] = useState("");
  const [swapAmount, setSwapAmount] = useState("");
  const [quote, setQuote] = useState();
  const [quotedAmount, setQuotedAmount] = useState("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // if base currency is changed => clear values and clear previous estimation
  useEffect(() => {
    if (baseCoin) {
      setSwapAmount("");
      setQuotedAmount("");
      clearPrevEstimation("");
    }
  }, [baseCoin]);

  // if new quote received => set quoted amount based on best calculated route
  useEffect(() => {
    if (quote) {
      setQuotedAmount(quote[0].quote.outputUiAmt);
    }
  }, [quote]);

  // continiously send quote requests while typing swapAmount
  // todo: this might result blocking from node's API and needs to be improved
  useEffect(() => {
    if (swapAmount !== 0) {
      aggListQuotes(baseCoin.data.symbol, quoteCoin.data.symbol, swapAmount);
    }
  }, [swapAmount]);

  // function that changes baseCoin and quoteCoin coins when button is pressed
  const baseToQuote = () => {
    setBaseCoin(quoteCoin);
    setQuoteCoin(baseCoin);
  };

  //
  const hippoTradeAggregator = async () => {
    let agg;
    try {
      const netConf = hippoClient();
      debug.log("netConf", netConf);
      agg = await TradeAggregator.create(client);
    } catch (error) {
      console.log(error);
    }
    debug.log(agg);
    return agg;
  };

  // function that sends quote request
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
      setQuote(quotes);
      for (const quote of quotes) {
        console.log("###########");
        quote.route.debugPrint();
        console.log(`Quote input: ${quote.quote.inputUiAmt}`);
        console.log(`Quote output: ${quote.quote.outputUiAmt}`);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLocalLoading(false);
  };

  // function that swaps tokens
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
      debug.log("payload", payload);
      await estimateTransaction(payload, true, true);
    } catch (error) {
      console.log(error);
    }
    setIsLocalLoading(false);
  };

  return (
    <Container maxWidth="xs">
      {accountImported && (
        <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
          <CardContent align="center" sx={{ mt: 1 }}>
            <Stack sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                sx={{ mt: 4, mb: 1 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  style: { textAlignLast: "end" },
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
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
                      <Typography sx={{ ml: "4px", mr: "6px" }}>{baseCoin.data.symbol}</Typography>
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                type="number"
                label="Pay"
                placeholder="0.0"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
              />
              <IconButton onClick={() => baseToQuote()}>
                <SwapVertIcon />
              </IconButton>
              <TextField
                sx={{ mt: 1, mb: 4 }}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  style: { textAlignLast: "end" },
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
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
                      <Typography sx={{ ml: "4px", mr: "6px" }}>{quoteCoin.data.symbol}</Typography>
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                type="number"
                label="Receive"
                placeholder="0.0"
                value={quotedAmount}
                // disabled
                // onChange={(e) => setSwapAmount(e.target.value)}
              />
            </Stack>
            <LoadingButton
              sx={{
                background: "linear-gradient(126.53deg, #3FE1FF -25.78%, #1700FF 74.22%);",
                width: "100%",
              }}
              variant="contained"
              loading={isLocalLoading}
              loadingIndicator={<CircularProgress sx={{ color: "#FFFFFF" }} size={18} />}
              onClick={() => {
                aggSwap(baseCoin.data.symbol, quoteCoin.data.symbol, swapAmount);
              }}
            >
              Swap
            </LoadingButton>
          </CardContent>
        </Card>
      )}
      <AccountAssetsDialog type={type} />
      <Footer />
    </Container>
  );
};

export default Swap;
