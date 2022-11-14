import * as aptos from "aptos";
import { Buffer } from "buffer";
import React, { useContext, useEffect, useState } from "react";
import pixel_coin from "../assets/pixel_coin.png";
import { spikaClient } from "../lib/client";
import { aptosCoin, coinInfo, coinList, coinStore } from "../lib/coin";
import { setStore } from "../lib/store";
import * as token from "../lib/token";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";
import { stringToValue, valueToString } from "../utils/values";
import { AccountContext } from "./AccountContext";
import { PayloadContext } from "./PayloadContext";
import { UIContext } from "./UIContext";

export const Web3Context = React.createContext();

// eslint-disable-next-line react/prop-types
export const Web3Provider = ({ children }) => {
  const { spikaWallet, setOpenSendDialog } = useContext(UIContext);
  const {
    accountImported,
    throwAlert,
    account,
    currentAddress,
    validateAccount,
    setBalance,
    currentAsset,
    setIsLoading,
    setAccountAssets,
    currentNetwork,
  } = useContext(AccountContext);
  const { register, transfer } = useContext(PayloadContext);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [maxGasAmount, setMaxGasAmount] = useState("10000");
  const [gasUnitPrice] = useState("100");
  const [estimatedTxnResult, setEstimatedTxnResult] = useState([]);
  const [isValidTransaction, setIsValidTransaction] = useState(false);
  const [txnDetails, setTxnDetails] = useState([]);
  const [depositEvents, setDepositEvents] = useState([]);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [depositEventsCounter, setDepositEventsCounter] = useState(0);
  const [withdrawEventsCounter, setWithdrawEventsCounter] = useState(0);
  const [accountTokens, setAccountTokens] = useState([]);
  const [isValidAsset, setIsValidAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [nftDetails, setNftDetails] = useState([]);
  const [aptosName, setAptosName] = useState("");
  const [aptosAddress, setAptosAddress] = useState("");
  const [chainId, setChainId] = useState();

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
    const spika = await spikaClient(currentNetwork);
    const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
      spika.client.getAccount(account.address()),
      spika.client.getChainId(),
    ]);

    const rawTxn = new aptos.TxnBuilderTypes.RawTransaction(
      aptos.TxnBuilderTypes.AccountAddress.fromHex(account.address()), // sender
      BigInt(sequenceNumber), // sequence_number
      payload, // payload
      BigInt(parseInt(maxGasAmount)), // maxGas
      BigInt(parseInt(gasUnitPrice)), // gasUnitPrice
      BigInt(Math.floor(Date.now() / 1000) + 20), // expiration timestamp
      new aptos.TxnBuilderTypes.ChainId(chainId) // chainId
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

  const handleSend = async (payload, isBcs, silent) => {
    setIsLoading(true);
    await sendTransaction(payload, isBcs, silent);
    setIsLoading(false);
    setIsValidTransaction(false);
    clearPrevEstimation();
    setAmount("");
  };

  const getChainId = async () => {
    const spika = await spikaClient();
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
    const spika = await spikaClient();
    const data = await spika.client.getTransactionByVersion(version);
    // console.log(data);
    setTxnDetails(data);
    setIsLoading(false);
  };

  // Request Faucet to fund address with test coins
  const mintCoins = async () => {
    const spika = await spikaClient();
    try {
      let _amount = "100000000";
      await spika.faucetClient.fundAccount(account.address(), _amount);
      throwAlert(
        21,
        "Success",
        `Received ${Number(stringToValue(aptosCoin, _amount))} ${aptosCoin.data.symbol}`,
        false
      );
    } catch (error) {
      throwAlert(22, "Transaction failed", `${error}`, true);
      setIsLoading(false);
      console.log(error);
    }
  };

  const estimateTransaction = async (payload, isBcs, silent) => {
    const spika = await spikaClient();
    let _payload;
    let isSilent = false;
    let transaction;
    if (silent) {
      isSilent = true;
    }
    try {
      if (payload === undefined) {
        _payload = await transfer(recipientAddress, currentAsset.type, valueToString(currentAsset, amount));
        transaction = await spika.client.generateRawTransaction(account.address(), _payload, {
          maxGasAmount: maxGasAmount,
          gasUnitPrice: gasUnitPrice,
        });
      } else if (isBcs === undefined || !isBcs) {
        _payload = payload;
        transaction = await spika.client.generateTransaction(account.address(), _payload, {
          max_gas_amount: maxGasAmount,
          gas_unit_price: gasUnitPrice,
        });
      } else {
        _payload = payload;
        transaction = await spika.client.generateRawTransaction(account.address(), _payload, {
          maxGasAmount: maxGasAmount,
          gasUnitPrice: gasUnitPrice,
        });
      }
      const bcsTxn = aptos.AptosClient.generateBCSSimulation(account, transaction);
      const estimatedTxn = (await spika.client.submitBCSSimulation(bcsTxn))[0];
      if (estimatedTxn.success === true) {
        debug.log("estimated result:", estimatedTxn);
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

  const sendTransaction = async (payload, isBcs, silent) => {
    const spika = await spikaClient();
    let _payload;
    let isSilent = false;
    let transaction;
    if (silent) {
      isSilent = true;
    }
    try {
      if (payload === undefined) {
        _payload = await transfer(recipientAddress, currentAsset.type, valueToString(currentAsset, amount));
        transaction = await spika.client.generateRawTransaction(account.address(), _payload, {
          maxGasAmount: maxGasAmount,
          gasUnitPrice: gasUnitPrice,
        });
      } else if (isBcs === undefined || !isBcs) {
        _payload = payload;
        transaction = await spika.client.generateTransaction(account.address(), _payload, {
          max_gas_amount: maxGasAmount,
          gas_unit_price: gasUnitPrice,
        });
      } else {
        _payload = payload;
        transaction = await spika.client.generateRawTransaction(account.address(), _payload, {
          maxGasAmount: maxGasAmount,
          gasUnitPrice: gasUnitPrice,
        });
      }
      const bcsTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      const result = await spika.client.submitSignedBCSTransaction(bcsTxn);
      await spika.client.waitForTransaction(result.hash);
      if (!isSilent) {
        throwAlert(31, "Transaction sent", `${result.hash}`, false);
      }
    } catch (error) {
      if (!isSilent) {
        throwAlert(32, "Transaction failed", `${error}`, true);
      }
      console.log(error);
      setIsLoading(false);
    }
  };

  const findAsset = async (coinType, address) => {
    const spika = await spikaClient();
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
    const spika = await spikaClient();
    try {
      const payload = await register(coinType);
      const transaction = await spika.client.generateRawTransaction(account.address(), payload, {
        maxGasAmount: maxGasAmount,
        gasUnitPrice: gasUnitPrice,
      });
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
    const response = signedMessage.hexString;
    return response;
  };

  const signTransaction = async (payload) => {
    const spika = await spikaClient();
    try {
      const transaction = await spika.client.generateTransaction(account.address(), payload, {
        max_gas_amount: maxGasAmount,
        gas_unit_price: gasUnitPrice,
      });
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account, transaction);
      return signedTxn;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const signAndSubmitTransaction = async (payload) => {
    const spika = await spikaClient();
    try {
      const transaction = await spika.client.generateTransaction(account.address(), payload, {
        max_gas_amount: maxGasAmount,
        gas_unit_price: gasUnitPrice,
      });
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

  const getBalance = async (asset) => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      let resources = await spika.client.getAccountResources(account.address());
      let resource;
      if (asset) {
        resource = resources.find((r) => r.type === coinStore(asset.type));
      } else {
        resource = resources.find((r) => r.type === coinStore(currentAsset.type));
      }
      if (resource === undefined || resource === null) {
        if (asset) {
          return 0;
        } else {
          setBalance(0);
        }
      } else {
        if (asset) {
          return resource.data.coin.value;
        } else {
          setBalance(resource.data.coin.value);
        }
      }
    } else {
      setBalance(0);
    }
  };

  const updateBalance = async (asset) => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      let resources = await spika.client.getAccountResources(account.address());
      let _asset = resources.find((r) => r.type === asset.type);
      if (_asset === undefined || _asset === null) {
        setBalance(0);
      } else {
        setBalance(_asset.data.coin.value);
      }
    } else {
      setBalance(0);
    }
  };

  const getTransactions = async () => {
    const spika = await spikaClient();
    let transactions = await spika.client.getAccountTransactions(account.address());
    return transactions;
  };

  const getEventsCount = async (events) => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      console.log(isAccount);
      const spika = await spikaClient();
      let resources = await spika.client.getAccountResources(account.address());
      let accountResource = resources.find((r) => r.type === coinStore(currentAsset.type));
      if (accountResource) {
        if (events === "deposit_events") {
          let counter = parseInt(accountResource.data.deposit_events.counter);
          debug.log(`${currentAsset.data.symbol} ${events} counter`, counter);
          setDepositEventsCounter(counter);
        } else if (events === "withdraw_events") {
          let counter = parseInt(accountResource.data.withdraw_events.counter);
          debug.log(`${currentAsset.data.symbol} ${events} counter`, counter);
          setWithdrawEventsCounter(counter);
        }
      } else {
        debug.log("no resource to count");
        return 0;
      }
    } else {
      return 0;
    }
  };

  const getDepositEvents = async (query) => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      if (query) {
        let data = await spika.client.getEventsByEventHandle(
          currentAddress,
          coinStore(currentAsset.type),
          "deposit_events",
          {
            start: query.start < 0 ? 0 : query.start,
            limit: query.limit,
          }
        );
        let result = data.reverse((r) => r.type === "sequence_number");
        debug.log("depositEvents: ", result);
        setDepositEvents(result);
      }
    } else {
      setDepositEvents([]);
    }
  };

  const getWithdrawEvents = async (query) => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const spika = await spikaClient();
      if (query) {
        let data = await spika.client.getEventsByEventHandle(
          currentAddress,
          coinStore(currentAsset.type),
          "withdraw_events",
          {
            start: query.start < 0 ? 0 : query.start,
            limit: query.limit,
          }
        );
        let result = data.reverse((r) => r.type === "sequence_number");
        debug.log("withdrawEvents: ", result);
        setWithdrawEvents(result);
      }
    } else {
      setWithdrawEvents([]);
    }
  };

  const getAssetData = async (type) => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const spika = await spikaClient();
      const data = await spika.client.getAccountResource(type.split("::")[0], coinInfo(type));
      return data;
    }
  };

  const getRegisteredAssets = async () => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const result = [];
      const resources = await spika.client.getAccountResources(account.address());
      await Promise.all(
        Object.values(resources).map(async (value) => {
          if (
            value.type.startsWith("0x1::coin::CoinStore") //&&
            // value.type !== "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
          ) {
            const type = value.type.substring(value.type.indexOf("<") + 1, value.type.lastIndexOf(">"));
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
                swap: false,
              },
            });
          }
        })
      );

      return result;
    }
  };

  const updateAccountAssets = async () => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const registeredAssets = await getRegisteredAssets();
      const result = registeredAssets.reduce((acc, curr) => {
        const stored = coinList.find(({ type }) => type === curr.type);
        if (stored) {
          stored.data.balance = curr.data.balance;
          stored.data.logo;
          stored.data.logo_alt;
          acc.push(stored);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
      result.sort((a, b) => a.data.name.localeCompare(b.data.name));
      setAccountAssets(result);
      setStore(PLATFORM, _accountAssets, result);
    }
  };

  const getAccountTokens = async () => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const spika = await spikaClient();
      try {
        // Get total number of Token deposit_events received by an account
        let resources = await spika.client.getAccountResources(account.address());
        let tokenStore = resources.find((r) => r.type === token.tokenStore.type);
        debug.log("resources : ", resources);
        debug.log("tokenStore : ", tokenStore);

        const getTokens = async () => {
          if (tokenStore === undefined) {
            // console.log("Account doesn't hold any NFT yet");
            return setAccountTokens(0);
          } else {
            let counter = parseInt(tokenStore.data.deposit_events.counter);
            // Get Token deposit_events
            let data = await spika.client.getEventsByEventHandle(currentAddress, tokenStore.type, "deposit_events", {
              limit: counter === 0 ? 1 : counter,
            });

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
    } else {
      setAccountTokens(0);
    }
  };

  const getNftDetails = async () => {
    const isAccount = await validateAccount(currentAddress);
    if (isAccount) {
      const spika = await spikaClient();
      try {
        if (accountTokens === 0) {
          // console.log("Account doesn't hold any NFT yet");
          return setNftDetails(0);
        } else {
          let result = [];
          await Promise.all(
            accountTokens.map(async (i) => {
              const nft = await spika.tokenClient.getTokenData(
                i.id.token_data_id.creator,
                i.id.token_data_id.collection,
                i.id.token_data_id.name
              );
              debug.log("nft details: ", nft);

              result.push({
                default_properties: nft.default_properties,
                description: nft.description,
                largest_property_version: nft.largest_property_version,
                maximum: nft.maximum,
                mutability_config: nft.mutability_config,
                name: nft.name,
                royalty: nft.royalty,
                supply: nft.supply,
                uri: nft.uri,
                creator: i.id.token_data_id.creator,
                collection: i.id.token_data_id.collection,
              });
            })
          );

          result.reverse();

          debug.log("nft details: ", result);
          return setNftDetails(result);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setNftDetails(0);
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
        maxGasAmount,
        setMaxGasAmount,
        isValidTransaction,
        setIsValidTransaction,
        estimatedTxnResult,
        setEstimatedTxnResult,
        txnDetails,
        setTxnDetails,
        nftDetails,
        handleMint,
        handleSend,
        getEventsCount,
        depositEventsCounter,
        setDepositEventsCounter,
        withdrawEventsCounter,
        setWithdrawEventsCounter,
        getDepositEvents,
        getWithdrawEvents,
        withdrawEvents,
        setWithdrawEvents,
        depositEvents,
        setDepositEvents,
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
