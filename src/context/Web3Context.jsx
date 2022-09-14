import React, { useState, useContext, useEffect } from "react";
import * as aptos from "aptos";
import { UIContext } from "./UIContext";
import { AccountContext } from "./AccountContext";
import { PayloadContext } from "./PayloadContext";
import useSpika from "../hooks/useSpika";
import { aptosCoin, coinList, coinStore, coinInfo } from "../lib/coin";
import * as token from "../lib/token";
import { PLATFORM } from "../utils/constants";
import { stringToValue, valueToString } from "../utils/values";
import pixel_coin from "../assets/pixel_coin.png";
import { setStore } from "../lib/store";

export const Web3Context = React.createContext();

export const Web3Provider = ({ children }) => {
  const { spikaWallet, setOpenSendDialog } = useContext(UIContext);
  const {
    accountImported,
    throwAlert,
    account,
    currentAddress,
    currentNetwork,
    setBalance,
    currentAsset,
    setIsLoading,
    setAccountAssets,
  } = useContext(AccountContext);
  const { register, transfer } = useContext(PayloadContext);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [maxGasAmount] = useState("1000"); // todo: integrate to SendDialog
  const [estimatedTxnResult, setEstimatedTxnResult] = useState([]);
  const [isValidTransaction, setIsValidTransaction] = useState(false);
  const [txnDetails, setTxnDetails] = useState([]);
  const [depositEvents, setDepositEvents] = useState([]);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [accountTokens, setAccountTokens] = useState([]);
  const [isValidAsset, setIsValidAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [nftDetails, setNftDetails] = useState([]);
  const [aptosName, setAptosName] = useState("");
  const [aptosAddress, setAptosAddress] = useState("");
  const [chainId, setChainId] = useState();
  const { spikaClient: spika } = useSpika(currentNetwork);

  const _accountAssets = "accountAssets";

  useEffect(() => {
    if (spikaWallet) {
      getChainId();
    }
    if (accountImported) {
      updateAccountAssets();
    }
  }, [accountImported]);

  const submitTransactionHelper = async (account, payload) => {
    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
      spika.client.getAccount(account.address()),
      spika.client.getChainId(),
    ]);

    const rawTxn = new aptos.TxnBuilderTypes.RawTransaction(
      aptos.TxnBuilderTypes.AccountAddress.fromHex(account.address()),
      BigInt(sequenceNumber),
      payload,
      BigInt(parseInt(maxGasAmount)),
      1n,
      BigInt(Math.floor(Date.now() / 1000) + 20),
      new aptos.TxnBuilderTypes.ChainId(chainId)
    );

    const bcsTxn = aptos.AptosClient.generateBCSTransaction(account, rawTxn);
    const transactionRes = await spika.client.submitSignedBCSTransaction(bcsTxn);

    return transactionRes.hash;
  };

  const handleMint = async () => {
    setIsLoading(true);
    await mintCoins();
    setIsLoading(false);
    setAmount("");
  };

  const handleEstimate = async () => {
    setIsLoading(true);
    setOpenSendDialog(false);
    await estimateTransaction();
    setIsLoading(false);
  };

  const handleSend = async () => {
    setIsLoading(true);
    await sendTransaction();
    setIsLoading(false);
    setIsValidTransaction(false);
    setEstimatedTxnResult([]);
    setRecipientAddress("");
    setAmount("");
  };

  const getChainId = async () => {
    const result = await spika.client.getChainId();
    setChainId(result);
  };

  const getAptosAddress = async (AptosName) => {
    const name = AptosName;
    const result = await fetch(`https://www.aptosnames.com/api/v1/address/${name}`);
    const { address } = await result.json();
    setAptosAddress(address);
  };

  const getAptosName = async (AptosAddress) => {
    const address = AptosAddress;
    const result = await fetch(`https://www.aptosnames.com/api/v1/name/${address}`);
    const { name } = await result.json();
    setAptosName(name);
  };

  const getTxnDetails = async (version) => {
    setIsLoading(true);
    const data = await spika.client.getTransactionByVersion(version);
    // console.log(data);
    setTxnDetails(data);
    setIsLoading(false);
  };

  // Request Faucet to fund address with test coins
  const mintCoins = async () => {
    try {
      const _amount = "1000000";
      await spika.faucetClient.fundAccount(account.address(), _amount);
      throwAlert(
        21,
        "Success",
        `Received ${Number(stringToValue(aptosCoin, _amount)).toFixed(2)} ${aptosCoin.data.symbol}`,
        false
      );
    } catch (error) {
      throwAlert(22, "Transaction failed", `${error}`, true);
      setIsLoading(false);
      console.log(error);
    }
  };

  const estimateTransaction = async (payload, isBcs, silent) => {
    let _payload;
    let isSilent = false;
    let transaction;
    if (silent) {
      isSilent = true;
    }
    try {
      if (payload === undefined) {
        _payload = await transfer(
          recipientAddress,
          currentAsset.type,
          valueToString(currentAsset, amount)
        );
        transaction = await spika.client.generateRawTransaction(account.address(), _payload);
      } else if (isBcs === undefined || !isBcs) {
        _payload = payload;
        transaction = await spika.client.generateTransaction(account.address(), _payload);
      } else {
        _payload = payload;
        transaction = await spika.client.generateRawTransaction(account.address(), _payload);
      }
      const bcsTxn = aptos.AptosClient.generateBCSSimulation(account, transaction);
      const estimatedTxn = (await spika.client.submitBCSSimulation(bcsTxn))[0];
      if (estimatedTxn.success === true) {
        // logic if Move says wagmi
        setIsValidTransaction(true);
        setEstimatedTxnResult(estimatedTxn);
        throwAlert(30, "Transaction is valid", `${estimatedTxn.vm_status}`, false);
      }
      if (estimatedTxn.success === false) {
        // logic if txn aborted by Move
        setEstimatedTxnResult(estimatedTxn);
        if (!isSilent) {
          throwAlert(33, "Transaction invalid", `${estimatedTxn.vm_status}`, true);
        }
        setRecipientAddress("");
        setAmount("");
      }
    } catch (error) {
      // logic if txn body doesn't looks good to be submitted to VM
      if (!isSilent) {
        throwAlert(34, "Failed to estimate", `${error}`, true);
      }
      setRecipientAddress("");
      setAmount("");
      console.log(error);
    }
  };

  const sendTransaction = async () => {
    try {
      const payload = await transfer(
        recipientAddress,
        currentAsset.type,
        valueToString(currentAsset, amount)
      );
      const rawTxn = await spika.client.generateRawTransaction(currentAddress, payload);
      const bcsTxn = aptos.AptosClient.generateBCSTransaction(account, rawTxn);
      const transactionRes = await spika.client.submitSignedBCSTransaction(bcsTxn);
      await spika.client.waitForTransaction(transactionRes.hash);
      throwAlert(31, "Transaction sent", `${transactionRes.hash}`, false);
    } catch (error) {
      throwAlert(32, "Transaction failed", `${error}`, true);
      console.log(error);
      setIsLoading(false);
    }
  };

  const findAsset = async (coinType, address) => {
    try {
      let _address;
      if (!address) {
        _address = coinType.split("::")[0];
      } else {
        _address = address;
      }
      const asset = await spika.client.getAccountResource(_address, coinInfo(coinType));
      const result = {
        type: coinType,
        data: {
          name: `${asset.data.name}`,
          symbol: `${asset.data.symbol}`,
          decimals: asset.data.decimals,
          logo: pixel_coin,
          logo_alt: pixel_coin,
        },
      };

      setSelectedAsset(result);
      setIsValidAsset(true);
      return result;
    } catch (error) {
      setSelectedAsset([]);
      setIsValidAsset(false);
      console.log(error);
    }
  };

  const registerAsset = async (coinType, name) => {
    try {
      const payload = await register(coinType);
      const transaction = await spika.client.generateRawTransaction(account.address(), payload);
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      const submitTxn = await spika.client.submitSignedBCSTransaction(signedTxn);
      await spika.client.waitForTransaction(submitTxn.hash);
      throwAlert(101, "Success", `${name} successfully registered`, false);
    } catch (error) {
      throwAlert(102, "Failed to register asset", `${error}`, true);
      console.log(error);
      setIsLoading(false);
    }
  };

  const signMessage = async (message) => {
    const messageToSign = Buffer.from(message);
    const signedMessage = await account.signBuffer(messageToSign);
    const response = { signedMessage: signedMessage.hexString };
    return response;
  };

  const signTransaction = async (payload) => {
    try {
      const transaction = await spika.client.generateTransaction(account.address(), payload);
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      return signedTxn;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const signAndSubmitTransaction = async (payload) => {
    try {
      const transaction = await spika.client.generateTransaction(account.address(), payload);
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      const result = await spika.client.submitSignedBCSTransaction(signedTxn);
      return result;
    } catch (error) {
      return error;
    }
  };

  const createToken = async (payload) => {
    try {
      await submitTransactionHelper(account, payload);
      throwAlert(61, "Transaction sent", `${payload}`, false);
    } catch (error) {
      throwAlert(62, "Transaction failed", `${error}`, true);
      setIsLoading(false);
      console.log(error);
    }
  };

  const getBalance = async () => {
    let resources = await spika.client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      setBalance(0);
    } else {
      setBalance(accountResource.data.coin.value);
    }
  };

  const updateBalance = async (asset) => {
    let resources = await spika.client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === asset.type);
    if (accountResource === undefined || accountResource === null) {
      setBalance(0);
    } else {
      setBalance(accountResource.data.coin.value);
    }
  };

  const getTransactions = async () => {
    let transactions = await spika.client.getAccountTransactions(account.address());
    return transactions;
  };

  const getDepositEvents = async () => {
    let resources = await spika.client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      return;
    }
    let counter = parseInt(accountResource.data.deposit_events.counter);
    if (counter <= 25) {
      let data = await spika.client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "deposit_events"
      );
      let result = data.reverse((r) => r.type === "sequence_number");

      setDepositEvents(result);
    } else {
      let data = await spika.client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "deposit_events",
        {
          start: counter - 25,
        }
      );
      let result = data.reverse((r) => r.type === "sequence_number");
      setDepositEvents(result);
    }
  };

  const getWithdrawEvents = async () => {
    let resources = await spika.client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      return;
    }
    let counter = parseInt(accountResource.data.withdraw_events.counter);
    if (counter <= 25) {
      let data = await spika.client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "withdraw_events"
      );
      let result = data.reverse((r) => r.type === "sequence_number");

      setWithdrawEvents(result);
    } else {
      let data = await spika.client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "withdraw_events",
        {
          start: counter - 25,
        }
      );
      let result = data.reverse((r) => r.type === "sequence_number");
      setWithdrawEvents(result);
    }
  };

  const getAssetData = async (type) => {
    const data = await spika.client.getAccountResource(type.split("::")[0], coinInfo(type));
    return data;
  };

  const getRegisteredAssets = async () => {
    const result = [];
    const resources = await spika.client.getAccountResources(account.address());
    await Promise.all(
      Object.values(resources).map(async (value) => {
        if (
          value.type.startsWith("0x1::coin::CoinStore") //&&
          // value.type !== "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        ) {
          const type = value.type.substring(
            value.type.indexOf("<") + 1,
            value.type.lastIndexOf(">")
          );
          const asset = await getAssetData(type);
          result.push({
            type: type,
            data: {
              name: asset.data.name,
              symbol: asset.data.symbol,
              decimals: asset.data.decimals,
              balance: value.data.coin.value,
              logo: pixel_coin,
              logo_alt: pixel_coin,
            },
          });
        }
      })
    );

    return result;
  };

  const updateAccountAssets = async () => {
    const registeredAssets = await getRegisteredAssets();
    const result = registeredAssets.reduce((acc, curr) => {
      const stored = coinList.find(({ type }) => type === curr.type);
      if (stored) {
        stored.data.balance = curr.data.balance;
        stored.data.logo = stored.data.logo;
        stored.data.logo_alt = stored.data.logo_alt;
        acc.push(stored);
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
    result.sort((a, b) => a.data.name.localeCompare(b.data.name));
    setAccountAssets(result);
    setStore(PLATFORM, _accountAssets, result);
  };

  const getAccountTokens = async () => {
    try {
      // Get total number of Token deposit_events received by an account
      let resources = await spika.client.getAccountResources(account.address());
      let tokenStore = resources.find((r) => r.type === token.tokenStore.type);

      const getTokens = async () => {
        if (tokenStore === undefined) {
          // console.log("Account doesn't hold any NFT yet");
          return setAccountTokens(0);
        } else {
          let counter = parseInt(tokenStore.data.deposit_events.counter);
          // Get Token deposit_events
          let data = await spika.client.getEventsByEventHandle(
            currentAddress,
            tokenStore.type,
            "deposit_events",
            {
              limit: counter,
            }
          );

          // Get TokenId for accountDepositedTokens and remove dublicates
          let tokenIds = [...new Set(data.map((i) => i.data.id))];

          // Returns an array of tokenId and value
          const accountTokensBalances = await Promise.all(
            tokenIds.map(async (i) => {
              let data = await spika.tokenClient.getTokenForAccount(currentAddress, i);
              return data;
            })
          );

          // Returns an array of tokenId and value for all tokens with > 0 balance
          let result = accountTokensBalances.filter((r) => {
            return r.amount !== "0";
          });

          if (result == undefined) {
            setAccountTokens(0);
          } else {
            setAccountTokens(result);
          }
        }
      };
      getTokens();
    } catch (error) {
      console.log(error);
    }
  };

  const getNftDetails = async () => {
    try {
      if (accountTokens === 0) {
        // console.log("Account doesn't hold any NFT yet");
        return setNftDetails(0);
      } else {
        let data = await Promise.all(
          accountTokens.map(
            async (i) =>
              await spika.tokenClient.getTokenData(
                i.id.token_data_id.creator,
                i.id.token_data_id.collection,
                i.id.token_data_id.name
              )
          )
        );
        let res = data.reverse();
        return setNftDetails(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearPrevEstimation = () => {
    setIsValidTransaction(false);
    setEstimatedTxnResult(false);
  };

  return (
    <Web3Context.Provider
      value={{
        chainId,
        setRecipientAddress,
        amount,
        setAmount,
        isValidTransaction,
        setIsValidTransaction,
        estimatedTxnResult,
        setEstimatedTxnResult,
        txnDetails,
        setTxnDetails,
        nftDetails,
        handleMint,
        handleSend,
        getDepositEvents,
        getWithdrawEvents,
        withdrawEvents,
        depositEvents,
        getTxnDetails,
        handleEstimate,
        accountTokens,
        getAccountTokens,
        getBalance,
        updateBalance,
        getTransactions,
        getNftDetails,
        createToken,
        isValidAsset,
        setIsValidAsset,
        selectedAsset,
        setSelectedAsset,
        aptosName,
        aptosAddress,
        getAptosName,
        getAptosAddress,
        estimateTransaction,
        signMessage,
        signTransaction,
        signAndSubmitTransaction,
        updateAccountAssets,
        findAsset,
        registerAsset,
        clearPrevEstimation,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
