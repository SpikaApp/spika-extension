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
  Divider,
  IconButton,
  Input,
  Stack,
  Typography,
} from "@mui/material";
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import AccountAssetsDialog from "../components/AccountAssetsDialog";
import Footer from "../components/Footer";
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

  const { accountImported, accountAssets, currentNetwork } = useContext(AccountContext);

  const { getBalance, isValidTransaction, estimatedTxnResult, clearPrevEstimation, mainnet } = useContext(Web3Context);

  const { xCoin, setXCoin, yCoin, setYCoin, slippage, maxGasAmount, simulateSwapTransaction, submitSwapTransaction } =
    useContext(DexContext);

  // Swap variables.
  const [type, setType] = useState<string>("");
  const [xCoinBalance, setXCoinBalance] = useState<number>(0);
  const [yCoinBalance, setYCoinBalance] = useState<number>(0);
  const [inputAmount, setInputAmount] = useState<string>("");
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [minOutputAmount, setMinOutputAmount] = useState<string>("");
  const [quotation, setQuotation] = useState<DetailedRouteAndQuote | undefined>();
  const [summary, setSummary] = useState<any[]>([]);

  // Swap state conditions.
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [swapEnabled, setSwapEnabled] = useState<boolean>(false);
  const [isChangeXtoY, setIsChangeXtoY] = useState<boolean>(false);

  // Swap errors.
  const [E_INSUFFICIENT_BALANCE, setE_INSUFFICIENT_BALANCE] = useState<boolean>(false);
  const [E_BAD_PAIR, setE_BAD_PAIR] = useState<boolean>(false);
  const [E_NO_ROUTE, setE_NO_ROUTE] = useState<boolean>(false);

  // Initial setup.
  useEffect(() => {
    if (accountImported) {
      if (accountAssets) {
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
    if (xCoin && yCoin && !isChangeXtoY && swapEnabled) {
      if (xCoin.data.symbol === yCoin.data.symbol) {
        setE_BAD_PAIR(true);
      } else {
        setE_BAD_PAIR(false);
      }
      getCurrentBalance("xCoin", xCoin);
      debug.log(`[Swap]: xCoin ${xCoin.data.symbol} balance fetched.`);
    }
  }, [xCoin, swapEnabled === true]);

  // On yCoin change => update balance.
  // Skip balance update if changing Y to X.
  useEffect(() => {
    if (yCoin && xCoin && !isChangeXtoY && swapEnabled) {
      if (xCoin.data.symbol === yCoin.data.symbol) {
        setE_BAD_PAIR(true);
      } else {
        setE_BAD_PAIR(false);
      }
      getCurrentBalance("yCoin", yCoin);
      debug.log(`[Swap]: yCoin ${yCoin.data.symbol} balance fetched.`);
    }
  }, [yCoin, swapEnabled === true]);

  // Fetch balance.
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

  // If xCoin changed => clearSwap().
  useEffect(() => {
    if (xCoin) {
      clearSwap();
      setE_NO_ROUTE(false);
    }
  }, [xCoin]);

  // If yCoin changed => clearSwap().
  useEffect(() => {
    if (yCoin) {
      clearSwap();
      setE_NO_ROUTE(false);
    }
  }, [yCoin]);

  // Request quotation after input amount is entered.
  useEffect(() => {
    const delay = setTimeout(() => {
      if (inputAmount) {
        setSummary([]);
        callApi();
      }
    }, 1000);

    return () => clearTimeout(delay);
  }, [inputAmount]);

  // Opens transaction preview dialog if estimatated txn was successfull.
  useEffect(() => {
    if (isValidTransaction) {
      debug.log("[Swap]: Simulation completed:", estimatedTxnResult);
      debug.log("[Swap]: Quote updated:", quotation);
      setOpenConfirmSendDialog(true);
    }
  }, [isValidTransaction]);

  // Periodically refresh quotation.
  useEffect(() => {
    if (quotation) {
      const updateQuotation = window.setInterval(() => {
        getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
        debug.log("[Swap]: Thick");
      }, 30000);
      return () => window.clearInterval(updateQuotation);
    }
    return undefined;
  }, [quotation]);

  // Once output amount received => calculate minimum output based on slippage tolerance.
  useEffect(() => {
    if (Number(outputAmount) > 0) {
      calculateMinOutputAmount(outputAmount, slippage);
      debug.log("[Swap]: Min Output Amount:", calculateMinOutputAmount(outputAmount, slippage));
    }
  }, [slippage]);

  // Clear results if no input amount.
  useEffect(() => {
    if (inputAmount === "") {
      clearSwap();
    }
  }, [inputAmount]);

  // Clear E_NO_ROUTE if quotation received.
  useEffect(() => {
    if (quotation) {
      setE_NO_ROUTE(false);
    }
  }, [quotation]);

  // Request new quotation if slippage is changed.
  useEffect(() => {
    if (inputAmount !== "" && xCoin && yCoin && slippage) {
      const delay = setTimeout(() => {
        if (inputAmount) {
          getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
        }
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [slippage]);

  // Request new quotation if maxGasAmount is changed.
  useEffect(() => {
    if (inputAmount !== "" && xCoin && yCoin && maxGasAmount) {
      const delay = setTimeout(() => {
        if (inputAmount) {
          getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
        }
      }, 1000);
      return () => clearTimeout(delay);
    }
  }, [maxGasAmount]);

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

  const callApi = async (): Promise<void> => {
    if (
      Number(valueToString(xCoin, inputAmount)) <= Number(xCoinBalance) &&
      inputAmount !== "" &&
      Number(inputAmount) > 0 &&
      !E_BAD_PAIR
    ) {
      await getQuote(xCoin.data.symbol, yCoin.data.symbol, inputAmount);
    }
    if (inputAmount === "") {
      setOutputAmount("");
    }
    if (inputAmount !== "") {
      if (xCoin) {
        if (Number(xCoinBalance) < Number(valueToString(xCoin, inputAmount))) {
          setE_INSUFFICIENT_BALANCE(true);
          setOutputAmount("");
          debug.log(`[Swap]: Low balance: ${xCoinBalance}, input amount: ${valueToString(xCoin, inputAmount)}`);
        } else {
          setE_INSUFFICIENT_BALANCE(false);
          debug.log(`[Swap]: Balance ok: ${xCoinBalance}, input amount: ${valueToString(xCoin, inputAmount)}`);
        }
      }
    } else {
      setE_INSUFFICIENT_BALANCE(false);
    }
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
        setE_NO_ROUTE(true);
      } else {
        const _minOutputAmount = calculateMinOutputAmount(result.quote.outputUiAmt.toString(), slippage);
        setQuotation(result);
        setOutputAmount(result.quote.outputUiAmt.toString());
        setMinOutputAmount(_minOutputAmount);
        makeSummary(result);
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
    clearPrevEstimation();
    setQuotation(undefined);
    try {
      const inputAmt = parseFloat(inputUiAmt);
      const payload = _quote.route.makeSwapPayload(inputAmt, Number(minOutputAmount));
      sendNotification({
        message: "Submitting transaction...",
        untilExpired: true,
        type: "info",
      });
      const simulated = await simulateSwapTransaction(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
      if (simulated.success) {
        setNotificationExpired(true);
        const result: any = await submitSwapTransaction(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
        if (result.success) {
          await sleep(1000);
          sendNotification({
            message: `Successfully exchanged ${xCoin.data.symbol} to ${yCoin.data.symbol}`,
            autoHide: true,
          });
          await getCurrentBalance("xCoin", xCoin);
          await getCurrentBalance("yCoin", yCoin);
          clearSwap();
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
  };

  const makeSummary = async (quotation: DetailedRouteAndQuote): Promise<void> => {
    const _minOutput = calculateMinOutputAmount(quotation.quote.outputUiAmt.toString(), slippage);
    const _priceImpact = quotation.quote.priceImpact ? quotation.quote.priceImpact.toFixed(4) : "-";
    const payload = quotation.route.makeSwapPayload(Number(inputAmount), Number(minOutputAmount));
    const simulated = await simulateSwapTransaction(payload as TxnBuilderTypes.TransactionPayloadEntryFunction);
    let networkFee = "";

    if (simulated) {
      networkFee = `${simulated.gas_used} (Gas Units)`;
    } else {
      networkFee = "N/A";
    }
    setSummary([
      createData("Output amount", `${quotation.quote.outputUiAmt} ${yCoin.data.symbol}`),
      createData("Minimum receive", `${Number(_minOutput).toFixed(yCoin.data.decimals)} ${yCoin.data.symbol}`),
      createData("Price impact", `${_priceImpact}`),
      createData("Network fee", `${networkFee}`),
    ]);
  };

  const createData = (name: string, value: string): any => {
    return { name, value };
  };

  const clearSwap = () => {
    setInputAmount("");
    setOutputAmount("");
    setQuotation(undefined);
    setSummary([]);
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
                <IconButton sx={{ position: "absolute", ml: "285px", mt: "-18px" }} onClick={handleSwapSettingsUI}>
                  <SettingsIcon sx={{ fontSize: "22px" }} />
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
                <Box component={DialogContent} sx={{ mb: "12px", border: 2, borderColor: "#9e9e9e" }}>
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
                    swapEnabled && !E_INSUFFICIENT_BALANCE && inputAmount !== "" && outputAmount !== "" && !E_BAD_PAIR
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
                    (inputAmount == "" ? true : false) ||
                    (outputAmount == "" ? true : false) ||
                    (E_INSUFFICIENT_BALANCE ? true : false) ||
                    (E_BAD_PAIR ? true : false) ||
                    (E_NO_ROUTE ? true : false)
                  }
                  onClick={() => {
                    executeSwap(quotation!, inputAmount);
                  }}
                >
                  {E_INSUFFICIENT_BALANCE && "Insufficient balance"}
                  {swapEnabled &&
                    inputAmount === "" &&
                    !E_INSUFFICIENT_BALANCE &&
                    !E_BAD_PAIR &&
                    !E_NO_ROUTE &&
                    "Enter an amount"}
                  {swapEnabled && !E_INSUFFICIENT_BALANCE && !E_NO_ROUTE && E_BAD_PAIR && "Select coin"}
                  {swapEnabled &&
                    !E_INSUFFICIENT_BALANCE &&
                    !E_BAD_PAIR &&
                    E_NO_ROUTE &&
                    `No route ${xCoin.data.symbol}/${yCoin.data.symbol}`}
                  {swapEnabled &&
                    inputAmount !== "" &&
                    outputAmount !== "" &&
                    !E_INSUFFICIENT_BALANCE &&
                    !E_BAD_PAIR &&
                    "Swap"}
                  {!swapEnabled && "Swap disabled"}
                </LoadingButton>
                {summary.length > 0 && (
                  <Stack
                    sx={{
                      border: 1,
                      borderRadius: "8px",
                      width: "100%",
                      height: "95px",
                      mt: "12px",
                      py: "8px",
                      px: "10px",
                    }}
                  >
                    {summary.map((data, index) => (
                      <Stack key={data.name}>
                        <Stack
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "start",
                            justifyContent: "space-between",
                            border: 0,
                            borderRadius: "8px",
                            width: "100%",
                          }}
                        >
                          <Typography color="textSecondary" variant="body2" align="left" sx={{ fontWeight: "450" }}>
                            {data.name}
                          </Typography>
                          <Typography color="textSecondary" variant="body2" align="right" sx={{ fontWeight: "450" }}>
                            {data.value}
                          </Typography>
                        </Stack>
                        {index + 1 !== summary.length && <Divider />}
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}
      {accountImported && (
        <div>
          <AccountAssetsDialog type={type as IAssetsDialogType} />
        </div>
      )}
      <SwapSettingsDialog />
      <Footer />
    </Container>
  );
};

export default Swap;
