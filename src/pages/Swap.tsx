/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DetailedRouteAndQuote } from "@manahippo/hippo-sdk/dist/aggregator/types";
import SettingsIcon from "@mui/icons-material/Settings";
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
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import ConfirmSendDialog from "../components/ConfirmSendDialog";
import Footer from "../components/Footer";
import { NoticeBox, Notification } from "../components/lib";
import SwapSettingsDialog from "../components/SwapSettingsDialog";
import { AccountContext } from "../context/AccountContext";
import { DexContext } from "../context/DexContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { ICoin } from "../interface";
import { dexClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import debug from "../utils/debug";
import sleep from "../utils/sleep";
import { stringToValue, valueToString } from "../utils/values";

type IAssetsDialogType = "xCoin" | "yCoin";

const Swap = () => {
  const {
    handleAccountAssetsUI,
    setOpenConfirmSendDialog,
    handleSwapSettingsUI,
    sendNotification,
    setNotificationExpired,
    darkMode,
  } = useContext(UIContext);
  const { alertSignal, accountImported, accountAssets, currentNetwork } = useContext(AccountContext);
  const { getBalance, isValidTransaction, estimatedTxnResult, clearPrevEstimation, mainnet } = useContext(Web3Context);
  const { isFetching, xCoin, setXCoin, yCoin, setYCoin, slippage, simulateSwapTransaction, submitSwapTransaction } =
    useContext(DexContext);
  const [type, setType] = useState<string>("");
  const [xCoinBalance, setXCoinBalance] = useState<number>(0);
  const [yCoinBalance, setYCoinBalance] = useState<number>(0);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [minOutputAmount, setMinOutputAmount] = useState<string>("");
  const [quotation, setQuotation] = useState<DetailedRouteAndQuote | undefined>();
  const [swapPayload, setSwapPayload] = useState<TxnBuilderTypes.TransactionPayloadEntryFunction | undefined>();
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [swapEnabled, setSwapEnabled] = useState<boolean>(false);
  const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false);
  const [badPair, setBadPair] = useState<boolean>(false);
  const [isChangeXtoY, setIsChangeXtoY] = useState<boolean>(false);
  const [noUpdates, setNoUpdates] = useState<boolean>(false);

  // Initial setup.
  useEffect(() => {
    if (accountImported) {
      debug.log("[Swap]: Account imported, looking for avaialble coins...");
      if (accountAssets) {
        debug.log("[Swap]: Found CoinStore records for account...");
        setXCoin(accountAssets[0]);
        if (accountAssets.length > 0) {
          setYCoin(accountAssets[1]);
        } else {
          setYCoin(accountAssets[0]);
        }
        setSwapEnabled(true);
      }
    }
  }, [accountAssets.length, accountImported]);

  // Disable swap if not on Mainnet.
  useEffect(() => {
    if (accountImported && !mainnet) {
      setXCoin(aptosCoin);
      setYCoin(aptosCoin);
      setSwapEnabled(false);
      debug.log(`[Swap]: Not supported on ${currentNetwork!.name} network, please switch to Mainnet.`);
    }
  }, [accountAssets]);

  // On xCoin change => update balance.
  // Skip balance update if changing X to Y.
  useEffect(() => {
    if (xCoin && yCoin && !isChangeXtoY) {
      if (xCoin.data.symbol === yCoin.data.symbol) {
        setBadPair(true);
      } else {
        setBadPair(false);
      }
      getCurrentBalance("xCoin", xCoin);
      debug.log(`[Swap]: xCoin ${xCoin.data.symbol} balance fetched.`);
    }
  }, [xCoin]);

  // On yCoin change => update balance.
  // Skip balance update if changing Y to X.
  useEffect(() => {
    if (yCoin && xCoin && !isChangeXtoY) {
      if (xCoin.data.symbol === yCoin.data.symbol) {
        setBadPair(true);
      } else {
        setBadPair(false);
      }
      getCurrentBalance("yCoin", yCoin);
      debug.log(`[Swap]: yCoin ${yCoin.data.symbol} balance fetched.`);
    }
  }, [yCoin]);

  // Fetch balances.
  const getCurrentBalance = async (type: string, coin: ICoin): Promise<void> => {
    const balance = await getBalance(coin);
    if (type === "xCoin") {
      setXCoinBalance(Number(balance));
    } else if (type === "yCoin") {
      setYCoinBalance(Number(balance));
    } else {
      debug.log("[Swap]: Unknown or undefined coin type.");
    }
  };

  // If base currency is changed => clear values and clear previous estimation.
  useEffect(() => {
    if (xCoin) {
      setInputAmount("");
      setOutputAmount("");
      clearPrevEstimation();
    }
  }, [xCoin]);

  // Continiously send quote requests while typing swapAmount.
  // todo: this might result blocking from node's API and needs to be improved.
  useEffect(() => {
    if (
      Number(valueToString(xCoin, inputAmount)) < Number(xCoinBalance) &&
      inputAmount !== "" &&
      Number(inputAmount) > 0 &&
      !badPair
    ) {
      getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
    }
    if (inputAmount === "") {
      setOutputAmount("");
    }
    if (inputAmount !== "") {
      if (xCoin) {
        if (Number(xCoinBalance) <= Number(valueToString(xCoin, inputAmount))) {
          setInsufficientBalance(true);
          setOutputAmount("");
          debug.log(`[Swap]: Low balance: ${xCoinBalance}, input amount: ${valueToString(xCoin, inputAmount)}`);
        } else {
          setInsufficientBalance(false);
          debug.log(`[Swap]: Balance ok: ${xCoinBalance}, input amount: ${valueToString(xCoin, inputAmount)}`);
        }
      }
    } else {
      setInsufficientBalance(false);
    }
  }, [inputAmount]);

  // Opens transaction preview dialog if estimatated txn was successfull.
  useEffect(() => {
    if (isValidTransaction) {
      debug.log("[Swap]: Simulation completed:", estimatedTxnResult);
      debug.log("[Swap]: Quote updated:", quotation);
      setOpenConfirmSendDialog(true);
    }
  }, [isValidTransaction]);

  useEffect(() => {
    if (alertSignal === 31 && xCoin && yCoin) {
      clearSwap();
      getCurrentBalance("xCoin", xCoin);
      getCurrentBalance("yCoin", yCoin);
    }
  }, [alertSignal]);

  // Periodically refresh quotation.
  useEffect(() => {
    if (quotation && !noUpdates) {
      const updateQuotation = window.setInterval(() => {
        getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
        debug.log("[Swap]: Thick");
      }, 20000);
      return () => window.clearInterval(updateQuotation);
    }
    return undefined;
  }, [inputAmount, noUpdates]);

  useEffect(() => {
    if (Number(outputAmount) > 0) {
      calculateMinOutputAmount(outputAmount, slippage);
      debug.log("[Swap]: Min Output Amount:", calculateMinOutputAmount(outputAmount, slippage));
    }
  }, [slippage]);

  // Function that changes X and Y coins when button is pressed.
  const baseToQuote = async (): Promise<void> => {
    setIsChangeXtoY(true);
    setXCoin(yCoin);
    setXCoinBalance(yCoinBalance);
    setYCoin(xCoin);
    setYCoinBalance(xCoinBalance);
    await sleep(1000);
    setIsChangeXtoY(false);
  };

  const calculateMinOutputAmount = (outputAmount: string, slippageTolerance: string) => {
    const slippage = 1 - Number(slippageTolerance) / 100;
    return (Number(outputAmount) * slippage).toString();
  };

  // Function that sends quote request.
  const getQuote = async (fromSymbol: string, toSymbol: string, inputUiAmt: string): Promise<void> => {
    setIsLocalLoading(true);
    try {
      const client = dexClient(currentNetwork!.data.node_url, "Mainnet");
      const xCoinInfo = client.coinListClient.getCoinInfoBySymbol(fromSymbol)[0];
      const yCoinInfo = client.coinListClient.getCoinInfoBySymbol(toSymbol)[0];
      const result = await client.getBestQuote(Number(inputUiAmt), xCoinInfo, yCoinInfo);
      if (!result) {
        console.log(`[Swap]: No route from ${fromSymbol} to ${toSymbol}`);
        return;
      } else {
        const _minOutputAmount = calculateMinOutputAmount(result.quote.outputUiAmt.toString(), slippage);
        setQuotation(result);
        setOutputAmount(result.quote.outputUiAmt.toString());
        setMinOutputAmount(_minOutputAmount);
        debug.log("[Swap]: Minumum received amount after slippage:", _minOutputAmount);
        await sleep(1000);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLocalLoading(false);
  };

  // Function that swaps tokens.
  const executeSwap = async (_quote: DetailedRouteAndQuote, inputUiAmt: string): Promise<void> => {
    setIsLocalLoading(true);
    setNoUpdates(true);
    clearPrevEstimation();
    try {
      const inputAmt = parseFloat(inputUiAmt);
      const payload = _quote.route.makeSwapPayload(inputAmt, Number(minOutputAmount));
      setSwapPayload(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
      sendNotification({
        message: "Submitting transaction, please wait...",
        untilExpired: true,
        type: "info",
      });
      const simulated = await simulateSwapTransaction(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
      if (simulated.success) {
        await sleep(1000);
        setNotificationExpired(true);
        const result: any = await submitSwapTransaction(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
        if (result.success) {
          sendNotification({
            message: `Successfully exchanged ${xCoin.data.symbol} to ${yCoin.data.symbol}`,
            autoHide: true,
          });
          await getCurrentBalance("xCoin", xCoin);
          await getCurrentBalance("yCoin", yCoin);
        } else {
          await sleep(1000);
          setNotificationExpired(true);
          sendNotification({ message: `Transaction failed`, type: "error", autoHide: true });
        }
      } else {
        await sleep(1000);
        setNotificationExpired(true);
        sendNotification({ message: "Simulation failed", type: "error", autoHide: true });
      }
    } catch (error) {
      console.log(error);
    }
    setIsLocalLoading(false);
    setNoUpdates(false);
  };

  const clearSwap = () => {
    setInputAmount("");
    setOutputAmount("");
    clearPrevEstimation();
  };

  return (
    <Container maxWidth="xs">
      {accountImported && (
        <Card sx={{ mb: 2, mt: "100px", minHeight: "450px" }}>
          <CardContent sx={{ mt: 1 }}>
            {xCoin && yCoin ? (
              <Stack sx={{ display: "flex", alignItems: "center", maxWidth: "295px" }}>
                <Typography
                  variant="subtitle2"
                  color="textPrimary"
                  sx={{ display: "flex", alignSelf: "start", ml: "12px", fontWeight: 600 }}
                >
                  Sell
                </Typography>
                <IconButton sx={{ position: "absolute", ml: "230px", mt: "-18px" }} onClick={handleSwapSettingsUI}>
                  <SettingsIcon />
                </IconButton>
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
                          sx={{ ml: "-10px" }}
                          disabled={swapEnabled ? false : true}
                          onClick={() => {
                            setType("xCoin");
                            handleAccountAssetsUI();
                          }}
                        >
                          <Box
                            sx={{ width: "24px", height: "24px" }}
                            component="img"
                            src={darkMode ? xCoin.data.logo_alt : xCoin.data.logo}
                          />
                        </IconButton>
                        <Typography variant="h6" color="textPrimary" sx={{ ml: "4px", mr: "6px", mt: "4px" }}>
                          {xCoin.data.symbol}
                        </Typography>
                      </Stack>
                      <Typography color="textSecondary" align="left" variant="subtitle2" sx={{ minWidth: "120px" }}>
                        Available {xCoin.data.symbol}:
                      </Typography>
                    </Stack>
                    <Stack direction="column">
                      <Stack direction="row">
                        <NumericFormat
                          thousandSeparator=" "
                          allowNegative={false}
                          allowLeadingZeros={false}
                          decimalScale={xCoin.data.decimals}
                          customInput={Input}
                          value={inputAmount}
                          onValueChange={(values) => {
                            setInputAmount(values.value);
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
                      <Typography
                        color="textSecondary"
                        sx={{ mt: "4px", mr: "12px" }}
                        align="right"
                        variant="subtitle2"
                      >
                        {stringToValue(xCoin, xCoinBalance.toString())}
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
                          sx={{ ml: "-10px" }}
                          disabled={swapEnabled ? false : true}
                          onClick={() => {
                            setType("yCoin");
                            handleAccountAssetsUI();
                          }}
                        >
                          <Box
                            sx={{ width: "24px", height: "24px" }}
                            component="img"
                            src={darkMode ? yCoin.data.logo_alt : yCoin.data.logo}
                          />
                        </IconButton>
                        <Typography variant="h6" color="textPrimary" sx={{ ml: "4px", mr: "6px", mt: "4px" }}>
                          {yCoin.data.symbol}
                        </Typography>
                      </Stack>
                      <Typography color="textSecondary" align="left" variant="subtitle2" sx={{ minWidth: "120px" }}>
                        Available {yCoin.data.symbol}:
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
                          value={outputAmount}
                          type="number"
                        />
                      </Stack>
                      <Typography
                        color="textSecondary"
                        sx={{ mt: "4px", mr: "12px" }}
                        align="right"
                        variant="subtitle2"
                      >
                        {stringToValue(yCoin, yCoinBalance.toString())}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            ) : (
              <Stack sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Typography align="center" variant="h5" sx={{ mt: "64px", mb: "32px" }}>
                  Warming up...
                </Typography>
                <CircularProgress sx={{ display: "flex", color: "#9e9e9e" }} size={64} />
              </Stack>
            )}
            {xCoin && yCoin && (
              <Stack sx={{ display: "flex", alignItems: "center" }}>
                <LoadingButton
                  sx={
                    swapEnabled && !insufficientBalance && inputAmount !== "" && !badPair
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
                    (inputAmount == "" ? true : false) ||
                    (badPair ? true : false)
                  }
                  onClick={() => {
                    executeSwap(quotation!, inputAmount);
                  }}
                >
                  {insufficientBalance && "Insufficient balance"}
                  {inputAmount === "" && !insufficientBalance && !badPair && swapEnabled && "Enter an amount"}
                  {swapEnabled && !insufficientBalance && badPair && "Cannot swap same coins"}
                  {swapEnabled && !insufficientBalance && inputAmount !== "" && !badPair && "Swap"}
                  {!swapEnabled && "Swap disabled"}
                </LoadingButton>
              </Stack>
            )}
            {swapEnabled && !isFetching && !mainnet && (
              <NoticeBox mt={3} width="250px" text={`Switch to Mainnet to continue.`} />
            )}
            {swapEnabled && !isFetching && mainnet && badPair && (
              <NoticeBox
                mt={3}
                width="250px"
                text={`Cannot swap ${xCoin.data.symbol} to ${yCoin.data.symbol}. They are the same coin.`}
              />
            )}
          </CardContent>
        </Card>
      )}
      {accountImported && (
        <div>
          <AccountAssetsDialog type={type as IAssetsDialogType} />
          <ConfirmSendDialog
            type={"swap"}
            quote={quotation}
            args={{
              payload: swapPayload,
              isBcs: true,
              silent: false,
            }}
          />
        </div>
      )}
      <SwapSettingsDialog />
      <Notification />
      <Footer />
    </Container>
  );
};

export default Swap;
