import React, { useState, useContext } from "react";
import * as aptos from "aptos";
import { UIContext } from "./UIContext";
import { AccountContext } from "./AccountContext";
import { client, faucetClient, tokenClient } from "../lib/client";
import coin, { coinStore, coinInfo } from "../lib/coin";
import * as token from "../lib/token";
import * as bcsPayload from "../lib/payload";
import { stringToValue, valueToString } from "../utils/values";

export const Web3Context = React.createContext();

export const Web3Provider = ({ children }) => {
  const { setOpenSendDialog } = useContext(UIContext);
  const { throwAlert, account, currentAddress, setBalance, currentAsset, setIsLoading } =
    useContext(AccountContext);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [maxGasAmount] = useState("1000"); // todo: integrate to SendDialog
  const [estimatedTxnResult, setEstimatedTxnResult] = useState([]);
  const [isValidTransaction, setIsValidTransaction] = useState(false);
  const [txnDetails, setTxnDetails] = useState([]);
  const [depositEvents, setDepositEvents] = useState([]);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [accountTokens, setAccountTokens] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionUri, setCollectionUri] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftUri, setNftUri] = useState("");
  const [nftSupply, setNftSupply] = useState("");
  const [nftDetails, setNftDetails] = useState([]);
  const [aptosName, setAptosName] = useState("");
  const [aptosAddress, setAptosAddress] = useState("");

  const submitTransactionHelper = async (account, payload) => {
    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
      client.getAccount(account.address()),
      client.getChainId(),
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
    const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

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

  const handleCreateCollection = async () => {
    setIsLoading(true);
    await createCollection();
    setIsLoading(false);
    setCollectionName("");
    setCollectionDescription("");
    setCollectionUri("");
  };

  const handleCreateNft = async () => {
    setIsLoading(true);
    await createNft();
    setIsLoading(false);
    setCollectionName("");
    setNftName("");
    setNftDescription("");
    setNftUri("");
    setNftSupply("");
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
    const data = await client.getTransactionByVersion(version);
    // console.log(data);
    setTxnDetails(data);
    setIsLoading(false);
  };

  // Request Faucet to fund address with test coins
  const mintCoins = async () => {
    try {
      const _amount = "1000000";
      await faucetClient.fundAccount(account.address(), _amount);
      throwAlert(
        21,
        "Success",
        `Received ${Number(stringToValue(coin[0], _amount)).toFixed(2)} ${coin[0].data.symbol}`
      );
    } catch (error) {
      throwAlert(22, "Transaction failed", `${error}`);
      setIsLoading(false);
      console.log(error);
    }
  };

  const estimateTransaction = async (payload) => {
    let _payload;
    let transaction;
    try {
      if (payload === undefined) {
        _payload = await bcsPayload.transfer(
          recipientAddress,
          currentAsset.type,
          valueToString(currentAsset, amount)
        );
        transaction = await client.generateRawTransaction(account.address(), _payload);
      } else {
        _payload = payload;
        transaction = await client.generateTransaction(account.address(), _payload);
      }
      const bcsTxn = aptos.AptosClient.generateBCSSimulation(account, transaction);
      const estimatedTxn = (await client.submitBCSSimulation(bcsTxn))[0];
      if (estimatedTxn.success === true) {
        // logic if Move says wagmi
        setIsValidTransaction(true);
        setEstimatedTxnResult(estimatedTxn);
        throwAlert(30, "Transaction is valid", `${estimatedTxn.vm_status}`);
      }
      if (estimatedTxn.success === false) {
        // logic if txn aborted by Move
        setEstimatedTxnResult(estimatedTxn);
        throwAlert(33, "Transaction invalid", `${estimatedTxn.vm_status}`);
        setRecipientAddress("");
        setAmount("");
      }
    } catch (error) {
      // logic if txn body doesn't looks good to be submitted to VM
      throwAlert(34, "Failed to estimate", `${error}`);
      setRecipientAddress("");
      setAmount("");
      console.log(error);
    }
  };

  const sendTransaction = async () => {
    try {
      const payload = await bcsPayload.transfer(
        recipientAddress,
        currentAsset.type,
        valueToString(currentAsset, amount)
      );
      const rawTxn = await client.generateRawTransaction(currentAddress, payload);
      const bcsTxn = aptos.AptosClient.generateBCSTransaction(account, rawTxn);
      const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);
      await client.waitForTransaction(transactionRes.hash);
      throwAlert(31, "Transaction sent", `${transactionRes.hash}`);
    } catch (error) {
      throwAlert(32, "Transaction failed", `${error}`);
      console.log(error);
      setIsLoading(false);
    }
  };

  const signTransaction = async (payload) => {
    try {
      const transaction = await client.generateTransaction(account.address(), payload);
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      return signedTxn;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const signAndSubmitTransaction = async (payload) => {
    try {
      const transaction = await client.generateTransaction(account.address(), payload);
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      const result = await client.submitSignedBCSTransaction(signedTxn);
      return result;
    } catch (error) {
      return error;
    }
  };

  const createCollection = async () => {
    try {
      const collection = await bcsPayload.collection(
        collectionName,
        collectionDescription,
        collectionUri,
        1
      );
      await submitTransactionHelper(account, collection);
      throwAlert(61, "Transaction sent", `${collection}`);
    } catch (error) {
      throwAlert(62, "Transaction failed", `${error}`);
      setIsLoading(false);
      console.log(error);
    }
  };

  const createNft = async () => {
    try {
      const nft = await bcsPayload.nft(
        currentAddress,
        collectionName,
        nftName,
        nftDescription,
        nftSupply,
        nftUri,
        1
      );

      await submitTransactionHelper(account, nft);
      throwAlert(71, "Transaction sent", `${nft}`);
    } catch (error) {
      throwAlert(72, "Transaction failed", `${error}`);
      setIsLoading(false);
      console.log(error);
    }
  };

  const getBalance = async () => {
    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      setBalance(0);
    } else {
      setBalance(accountResource.data.coin.value);
    }
  };

  const updateBalance = async (asset) => {
    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === asset.type);
    if (accountResource === undefined || accountResource === null) {
      setBalance(0);
    } else {
      setBalance(accountResource.data.coin.value);
    }
  };

  const getTransactions = async () => {
    let transactions = await client.getAccountTransactions(account.address());
    return transactions;
  };

  const getDepositEvents = async () => {
    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      return;
    }
    let counter = parseInt(accountResource.data.deposit_events.counter);
    if (counter <= 25) {
      let data = await client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "deposit_events"
      );
      let result = data.reverse((r) => r.type === "sequence_number");

      setDepositEvents(result);
    } else {
      let data = await client.getEventsByEventHandle(
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
    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
    if (accountResource === undefined || accountResource === null) {
      return;
    }
    let counter = parseInt(accountResource.data.withdraw_events.counter);
    if (counter <= 25) {
      let data = await client.getEventsByEventHandle(
        currentAddress,
        coinStore(currentAsset.type),
        "withdraw_events"
      );
      let result = data.reverse((r) => r.type === "sequence_number");

      setWithdrawEvents(result);
    } else {
      let data = await client.getEventsByEventHandle(
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
    const data = await client.getAccountResource(type.split("::")[0], coinInfo(type));
    return data;
  };

  const updateAccountAssets = async () => {
    const result = [];
    const resources = await client.getAccountResources(account.address());
    await Promise.all(
      Object.values(resources).map(async (value) => {
        if (
          value.type.startsWith("0x1::coin::CoinStore") &&
          value.type !== "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        ) {
          const type = value.type.substring(
            value.type.indexOf("<") + 1,
            value.type.lastIndexOf(">")
          );
          const asset = await getAssetData(address);
          result.push({
            type: type,
            data: {
              name: asset.data.name,
              symbol: asset.data.symbol,
              decimals: asset.data.decimals,
              balance: value.data.coin.value,
            },
          });
        }
      })
    );

    return result;
  };

  const getAccountTokens = async () => {
    try {
      // Get total number of Token deposit_events received by an account
      let resources = await client.getAccountResources(account.address());
      let tokenStore = resources.find((r) => r.type === token.tokenStore.type);

      const getTokens = async () => {
        if (tokenStore === undefined) {
          // console.log("Account doesn't hold any NFT yet");
          return setAccountTokens(0);
        } else {
          let counter = parseInt(tokenStore.data.deposit_events.counter);
          // Get Token deposit_events
          let data = await client.getEventsByEventHandle(
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
              let data = await tokenClient.getTokenForAccount(currentAddress, i);
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
              await tokenClient.getTokenData(
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

  return (
    <Web3Context.Provider
      value={{
        setRecipientAddress,
        amount,
        setAmount,
        isValidTransaction,
        setIsValidTransaction,
        estimatedTxnResult,
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
        handleCreateCollection,
        handleCreateNft,
        getNftDetails,
        setCollectionName,
        setCollectionDescription,
        setCollectionUri,
        setNftName,
        setNftDescription,
        setNftSupply,
        setNftUri,
        aptosName,
        aptosAddress,
        getAptosName,
        getAptosAddress,
        estimateTransaction,
        signTransaction,
        signAndSubmitTransaction,
        updateAccountAssets,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
