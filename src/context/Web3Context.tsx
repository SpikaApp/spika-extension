/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as aptos from "aptos";
import { Buffer } from "buffer";
import React, { useContext, useEffect, useState } from "react";
import pixel_coin from "../assets/pixel_coin.png";
import { ICoin, IContextWeb3, INftDetails, INftMetadata } from "../interface";
import { setAssetStore } from "../lib/assetStore";
import { spikaClient } from "../lib/client";
import { coinInfo, coinList, coinStore } from "../lib/coin";
import errorParser from "../lib/errorParser";
import * as token from "../lib/token";
import { DEFAULT_MAX_GAS } from "../utils/constants";
import debug from "../utils/debug";
import getCurrentNetwork from "../utils/getCurrentNetwork";
import { getNftMetadata } from "../utils/getNftMetadata";
import { valueToString } from "../utils/values";
import { AccountContext } from "./AccountContext";
import { PayloadContext } from "./PayloadContext";
import { UIContext } from "./UIContext";

type Web3ContextProps = {
  children: React.ReactNode;
};

export const Web3Context = React.createContext<IContextWeb3>({} as IContextWeb3);

export const Web3Provider = ({ children }: Web3ContextProps) => {
  const { spikaWallet, setOpenSendDialog, previewRequired } = useContext(UIContext);
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
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [maxGasAmount, setMaxGasAmount] = useState<string>(DEFAULT_MAX_GAS);
  const [gasUnitPrice, setGasUnitPrice] = useState<string>("100");
  const [estimatedTxnResult, setEstimatedTxnResult] = useState<aptos.Types.UserTransaction>();
  const [isValidTransaction, setIsValidTransaction] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [txnDetails, setTxnDetails] = useState<any>({});
  const [depositEvents, setDepositEvents] = useState<aptos.Types.Event[]>([]);
  const [withdrawEvents, setWithdrawEvents] = useState<aptos.Types.Event[]>([]);
  const [depositEventsCounter, setDepositEventsCounter] = useState<number>(0);
  const [withdrawEventsCounter, setWithdrawEventsCounter] = useState<number>(0);
  const [isValidAsset, setIsValidAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ICoin | Record<string, never>>({});
  const [aptosName, setAptosName] = useState("");
  const [aptosAddress, setAptosAddress] = useState("");
  const [chainId, setChainId] = useState<number>();
  const [mainnet, setMainnet] = useState<boolean>(false);

  useEffect(() => {
    if (spikaWallet) {
      getChainId();
    }
    if (accountImported) {
      updateAccountAssets();
    }
  }, [accountImported]);

  // Checks if current is Mainnet.
  useEffect(() => {
    if (accountImported) {
      (async () => {
        const result = await isMainnet();
        setMainnet(result);
        getCurrentNetwork();
      })();
    }
  }, [currentNetwork]);

  const submitTransactionHelper = async (
    account: aptos.AptosAccount,
    payload: aptos.TxnBuilderTypes.TransactionPayload
  ): Promise<string> => {
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

  const handleEstimate = async (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ): Promise<aptos.Types.UserTransaction | void> => {
    setIsLoading(true);
    setOpenSendDialog(false);
    const result = await estimateTransaction(payload, isBcs, silent);
    setIsLoading(false);
    return result;
  };

  const handleSend = async (
    payload?: aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ): Promise<void> => {
    setIsLoading(true);
    await sendTransaction(payload, isBcs, silent);
    setIsLoading(false);
    setIsValidTransaction(false);
    clearPrevEstimation();
    setAmount("");
    setRecipientAddress("");
  };

  const getChainId = async (): Promise<void> => {
    const spika = await spikaClient();
    const result = await spika.client.getChainId();
    setChainId(result);
  };

  const isMainnet = async (): Promise<boolean> => {
    const spika = await spikaClient();
    const result = await spika.client.getChainId();
    if (result === 1) {
      return true;
    } else {
      return false;
    }
  };

  const getAptosAddress = async (aptosName: string): Promise<void> => {
    const result = await fetch(`https://www.aptosnames.com/api/v1/address/${aptosName}`);
    const { address } = await result.json();
    setAptosAddress(address);
  };

  const getAptosName = async (address: string): Promise<void> => {
    const result = await fetch(`https://www.aptosnames.com/api/v1/name/${address}`);
    const { name } = await result.json();
    setAptosName(name);
  };

  const getTxnDetails = async (version: number | bigint): Promise<void> => {
    setIsLoading(true);
    const spika = await spikaClient();
    const data = await spika.client.getTransactionByVersion(version);
    setTxnDetails(data);
    setIsLoading(false);
  };

  // Request Faucet to fund address with test coins
  const mintCoins = async (amount: string): Promise<void> => {
    const spika = await spikaClient();
    await spika.faucetClient!.fundAccount(account!.address(), Number(amount));
  };

  const estimateGasPrice = async (): Promise<aptos.Types.GasEstimation> => {
    const spika = await spikaClient();
    return await spika.client.estimateGasPrice();
  };

  const clearTxnInput = (): void => {
    setRecipientAddress("");
    setAmount("");
    setMaxGasAmount(DEFAULT_MAX_GAS);
  };

  const estimateTransaction = async (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ): Promise<aptos.Types.UserTransaction | void> => {
    const spika = await spikaClient();
    let _payload;
    let isSilent = false;
    let transaction;
    if (silent) {
      isSilent = true;
    }
    try {
      if (payload === undefined) {
        _payload = await transfer({
          recipientAddress: recipientAddress,
          currentAsset: currentAsset!.type,
          amount: Number(valueToString(currentAsset!, amount)),
        });
        transaction = await spika.client.generateRawTransaction(account!.address(), _payload, {
          maxGasAmount: BigInt(maxGasAmount),
          gasUnitPrice: BigInt(gasUnitPrice),
        });
      } else if (isBcs === undefined || !isBcs) {
        _payload = payload as aptos.Types.EntryFunctionPayload;
        transaction = await spika.client.generateTransaction(account!.address(), _payload, {
          max_gas_amount: maxGasAmount,
          gas_unit_price: gasUnitPrice,
        });
      } else {
        _payload = payload as aptos.TxnBuilderTypes.TransactionPayload;
        transaction = await spika.client.generateRawTransaction(account!.address(), _payload, {
          maxGasAmount: BigInt(maxGasAmount),
          gasUnitPrice: BigInt(gasUnitPrice),
        });
      }
      const bcsTxn = aptos.AptosClient.generateBCSSimulation(account!, transaction);
      const estimatedTxn = (await spika.client.submitBCSSimulation(bcsTxn))[0];
      if (estimatedTxn.success === true) {
        debug.log("Estimated transaction result received:", estimatedTxn);
        debug.log("Preview required set to:", previewRequired);
        // logic if Move says wagmi
        setIsValidTransaction(true);
        setEstimatedTxnResult(estimatedTxn);
        throwAlert({ signal: 30, title: "Transaction is valid", message: `${estimatedTxn.vm_status}`, error: false });
        return estimatedTxn;
      }
      if (estimatedTxn.success === false) {
        // logic if txn aborted by Move
        setEstimatedTxnResult(estimatedTxn);
        if (!isSilent) {
          throwAlert({ signal: 33, title: "Transaction invalid", message: `${estimatedTxn.vm_status}`, error: true });
          return estimatedTxn;
        }
        setRecipientAddress("");
        setAmount("");
      }
    } catch (error) {
      // logic if txn body doesn't looks good to be submitted to VM
      if (!isSilent) {
        throwAlert({
          signal: 34,
          title: "Failed to estimate",
          message: `${errorParser(error, "Error occured while estimating transaction")}`,
          error: true,
        });
      }
      setRecipientAddress("");
      setAmount("");
      console.log(error);
    }
  };

  const sendTransaction = async (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ): Promise<aptos.Types.Transaction | void> => {
    const spika = await spikaClient();
    let _payload;
    let isSilent = false;
    let transaction;
    if (silent) {
      isSilent = true;
    }
    try {
      if (payload === undefined) {
        _payload = await transfer({
          recipientAddress: recipientAddress,
          currentAsset: currentAsset!.type,
          amount: Number(valueToString(currentAsset!, amount)),
        });
        transaction = await spika.client.generateRawTransaction(account!.address(), _payload, {
          maxGasAmount: BigInt(maxGasAmount),
          gasUnitPrice: BigInt(gasUnitPrice),
        });
      } else if (isBcs === undefined || !isBcs) {
        _payload = payload as aptos.Types.EntryFunctionPayload;
        transaction = await spika.client.generateTransaction(account!.address(), _payload, {
          max_gas_amount: maxGasAmount,
          gas_unit_price: gasUnitPrice,
        });
      } else {
        _payload = payload as aptos.TxnBuilderTypes.TransactionPayload;
        transaction = await spika.client.generateRawTransaction(account!.address(), _payload, {
          maxGasAmount: BigInt(maxGasAmount),
          gasUnitPrice: BigInt(gasUnitPrice),
        });
      }
      const bcsTxn = aptos.AptosClient.generateBCSTransaction(account!, transaction);
      const submit = await spika.client.submitSignedBCSTransaction(bcsTxn);
      const result = spika.client.waitForTransactionWithResult(submit.hash);
      if (!isSilent) {
        throwAlert({ signal: 31, title: "Transaction sent", message: `${submit.hash}`, error: false });
      }
      return result;
    } catch (error) {
      if (!isSilent) {
        throwAlert({
          signal: 32,
          title: "Transaction failed",
          message: `${errorParser(error, "Error occured while submitting transaction.")}`,
          error: true,
        });
      }
      console.log(error);
      setIsLoading(false);
    }
  };

  const findAsset = async (coinType: string, address?: string): Promise<ICoin | undefined> => {
    const spika = await spikaClient();
    try {
      let _address;
      if (!address) {
        _address = coinType.split("::")[0];
      } else {
        _address = address;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const asset: any = await spika.client.getAccountResource(_address, coinInfo(coinType));
      const result: ICoin = {
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
      setSelectedAsset({});
      setIsValidAsset(false);
      console.log(error);
    }
  };

  const registerAsset = async (coinType: string, name: string): Promise<void> => {
    const spika = await spikaClient();
    try {
      const payload = await register(coinType);
      const transaction = await spika.client.generateRawTransaction(account!.address(), payload, {
        maxGasAmount: BigInt(maxGasAmount),
        gasUnitPrice: BigInt(gasUnitPrice),
      });
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account!, transaction);
      const submitTxn = await spika.client.submitSignedBCSTransaction(signedTxn);
      await spika.client.waitForTransaction(submitTxn.hash);
      throwAlert({ signal: 101, title: "Success", message: `${name} successfully registered`, error: false });
    } catch (error) {
      throwAlert({
        signal: 102,
        title: "Failed to register asset",
        message: `${errorParser(error, `Error occured while trying to register ${name}`)}`,
        error: true,
      });
      console.log(error);
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signMessage = async (message: any): Promise<string> => {
    let messageToSign: Uint8Array;
    if (message instanceof String) {
      messageToSign = Buffer.from(message);
    } else {
      messageToSign = Buffer.from(JSON.stringify(message));
    }
    const signedMessage = account!.signBuffer(messageToSign);
    return signedMessage.hex();
  };

  const signTransaction = async (payload: aptos.Types.EntryFunctionPayload): Promise<Uint8Array | unknown> => {
    const spika = await spikaClient();
    const _gasUnitsPrice = (await estimateGasPrice()).gas_estimate.toString();
    try {
      const transaction = await spika.client.generateTransaction(account!.address(), payload, {
        max_gas_amount: maxGasAmount,
        gas_unit_price: _gasUnitsPrice,
      });
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account!, transaction);
      return signedTxn;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const signAndSubmitTransaction = async (
    payload: aptos.Types.EntryFunctionPayload
  ): Promise<aptos.Types.PendingTransaction | unknown> => {
    const spika = await spikaClient();
    const _gasUnitsPrice = (await estimateGasPrice()).gas_estimate.toString();
    try {
      const transaction = await spika.client.generateTransaction(account!.address(), payload, {
        max_gas_amount: maxGasAmount,
        gas_unit_price: _gasUnitsPrice,
      });
      const signedTxn = aptos.AptosClient.generateBCSTransaction(account!, transaction);
      const result = await spika.client.submitSignedBCSTransaction(signedTxn);
      return result;
    } catch (error) {
      return error;
    }
  };

  const createToken = async (payload: aptos.TxnBuilderTypes.TransactionPayload): Promise<void> => {
    try {
      await submitTransactionHelper(account!, payload);
      throwAlert({ signal: 61, title: "Transaction sent", message: `${payload}`, error: false });
    } catch (error) {
      throwAlert({
        signal: 62,
        title: "Transaction failed",
        message: `${errorParser(error, "Error occured while trying to create token.")}`,
        error: true,
      });
      setIsLoading(false);
      console.log(error);
    }
  };

  const getBalance = async (asset?: ICoin): Promise<string | void> => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const resources = await spika.client.getAccountResources(account!.address());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resource: any;
      if (asset) {
        resource = resources.find((r) => r.type === coinStore(asset.type));
      } else {
        resource = resources.find((r) => r.type === coinStore(currentAsset!.type));
      }
      if (resource === undefined || resource === null) {
        if (asset) {
          return "0";
        } else {
          setBalance("0");
        }
      } else {
        if (asset) {
          return resource.data.coin.value;
        } else {
          setBalance(resource.data.coin.value);
        }
      }
    } else {
      setBalance("0");
    }
  };

  const updateBalance = async (asset: ICoin): Promise<string> => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const resources = await spika.client.getAccountResources(account!.address());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _asset: any = resources.find((r) => r.type === coinStore(asset.type));
      if (_asset === undefined || _asset === null) {
        return "0";
      } else {
        return _asset.data.coin.value;
      }
    } else {
      return "0";
    }
  };

  const getTransactions = async (query?: IEventsQuery): Promise<aptos.Types.Transaction[]> => {
    const spika = await spikaClient();
    return await spika.client.getAccountTransactions(account!.address(), query);
  };

  const getEventsCount = async (events: string): Promise<void | 0> => {
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const spika = await spikaClient();
      const resources = await spika.client.getAccountResources(account!.address());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accountResource: any = resources.find((r) => r.type === coinStore(currentAsset!.type));
      if (accountResource) {
        if (events === "deposit_events") {
          const counter: number = parseInt(accountResource.data.deposit_events.counter);
          debug.log(`${currentAsset!.data.symbol} ${events} counter:`, counter);
          setDepositEventsCounter(counter);
        } else if (events === "withdraw_events") {
          const counter: number = parseInt(accountResource.data.withdraw_events.counter);
          debug.log(`${currentAsset!.data.symbol} ${events} counter:`, counter);
          setWithdrawEventsCounter(counter);
        }
      } else {
        debug.log("No resources to count.");
        return 0;
      }
    } else {
      return 0;
    }
  };

  interface IEventsQuery {
    start: number;
    limit: number;
  }

  const getDepositEvents = async (query: IEventsQuery): Promise<void> => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      if (query) {
        const result = await spika.client.getEventsByEventHandle(
          currentAddress!,
          coinStore(currentAsset!.type),
          "deposit_events",
          {
            start: query.start < 0 ? 0 : query.start,
            limit: query.limit,
          }
        );
        result.reverse();
        debug.log("Deposit events:", result);
        setDepositEvents(result);
      }
    } else {
      setDepositEvents([]);
    }
  };

  const getWithdrawEvents = async (query: IEventsQuery): Promise<void> => {
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const spika = await spikaClient();
      if (query) {
        const result = await spika.client.getEventsByEventHandle(
          currentAddress!,
          coinStore(currentAsset!.type),
          "withdraw_events",
          {
            start: query.start < 0 ? 0 : query.start,
            limit: query.limit,
          }
        );
        result.reverse();
        debug.log("Withdraw events:", result);
        setWithdrawEvents(result);
      }
    } else {
      setWithdrawEvents([]);
    }
  };

  const getAssetData = async (type: string): Promise<aptos.Types.MoveResource | undefined> => {
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const spika = await spikaClient();
      return await spika.client.getAccountResource(type.split("::")[0], coinInfo(type));
    }
  };

  const getRegisteredAssets = async (): Promise<ICoin[] | undefined> => {
    const spika = await spikaClient();
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const result: ICoin[] = [];
      const resources = await spika.client.getAccountResources(account!.address());
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.values(resources).map(async (value: any) => {
          if (value.type.startsWith("0x1::coin::CoinStore")) {
            const type = value.type.substring(value.type.indexOf("<") + 1, value.type.lastIndexOf(">"));
            // debug.log("Found new CoinStore resource:", type);

            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const asset: any = await getAssetData(type);
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
            } catch (error) {
              console.log(error);
            }
          }
        })
      );
      return result;
    }
  };

  const updateAccountAssets = async (): Promise<ICoin[] | undefined> => {
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const registeredAssets = await getRegisteredAssets();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = registeredAssets!.reduce((acc: ICoin[], curr: ICoin) => {
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
      result.sort((a: ICoin, b: ICoin) => a.data.name.localeCompare(b.data.name));
      result.sort((a: ICoin, b: ICoin) => Number(b.data.balance) - Number(a.data.balance));
      setAccountAssets(result);
      if (currentAddress) {
        setAssetStore(currentAddress, result);
      }
      return result;
    }
  };

  const getTokenStore = async (): Promise<Array<aptos.TokenTypes.Token>> => {
    let final: Array<aptos.TokenTypes.Token> = [];
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const spika = await spikaClient();
      try {
        // Get total number of Token deposit_events received by an account
        const resources = await spika.client.getAccountResources(account!.address());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tokenStore: any = resources.find((r) => r.type === token.tokenStore.type);
        // debug.log(tokenStore);

        const getTokens = async (): Promise<void> => {
          if (tokenStore === undefined) {
            debug.log("No TokenStore records found for:", currentAddress);
            final = [];
          } else {
            const counter = parseInt(tokenStore.data.deposit_events.counter);
            const events = await spika.client.getEventsByEventHandle(
              currentAddress!,
              tokenStore.type,
              "deposit_events",
              {
                limit: counter === 0 ? 1 : counter,
              }
            );

            const ids = [...new Set(events.map((event) => event.data.id))];

            const data: aptos.TokenTypes.Token[] = [];

            await Promise.all(
              ids.map(async (id) => {
                const token = await spika.tokenClient.getTokenForAccount(currentAddress!, id);
                // debug.log(data);
                if (token) {
                  data.push(token);
                }
              })
            );

            const result = data.filter((token) => {
              return token.amount !== "0";
            });

            if (result !== undefined) {
              final = result.filter(
                (value, index, self) =>
                  index === self.findIndex((t) => t.id.token_data_id.name === value.id.token_data_id.name)
              );
              final.sort((a, b) => a.id.token_data_id.name.localeCompare(b.id.token_data_id.name));
            }
          }
        };
        await getTokens();
      } catch (error) {
        console.log(error);
      }
    }
    return final;
  };

  const getNftDetails = async (tokens: Array<aptos.TokenTypes.Token>): Promise<Array<INftDetails>> => {
    let final: Array<INftDetails> = [];
    const isAccount = await validateAccount(currentAddress!);
    if (isAccount) {
      const spika = await spikaClient();
      try {
        if (tokens.length !== 0) {
          const result: Array<INftDetails> = [];
          await Promise.all(
            tokens.map(async (i) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const nft: any = await spika.tokenClient.getTokenData(
                i.id.token_data_id.creator,
                i.id.token_data_id.collection,
                i.id.token_data_id.name
              );

              let metadata: INftMetadata | undefined = undefined;

              if (nft.uri.toLowerCase().includes("ipfs")) {
                const _metadata = await getNftMetadata(nft.uri);
                if (_metadata) {
                  metadata = _metadata;
                }
              }

              if (nft.uri.substr(nft.uri.length - 4).toLowerCase() === "json") {
                const _metadata = await getNftMetadata(nft.uri);
                if (_metadata) {
                  metadata = _metadata;
                }
              }

              result.push({
                default_properties: nft.default_properties,
                description: metadata ? metadata.description : nft.description,
                largest_property_version: nft.largest_property_version,
                maximum: nft.maximum,
                mutability_config: nft.mutability_config,
                name: nft.name,
                royalty: nft.royalty,
                supply: nft.supply,
                uri: metadata ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : nft.uri,
                creator: i.id.token_data_id.creator,
                collection: i.id.token_data_id.collection,
                attributes: metadata ? metadata.attributes : [],
              });
            })
          );

          result.sort((a, b) => a.name.localeCompare(b.name));

          debug.log("NFTs metadata updated:", result);
          final = result;
        }
      } catch (error) {
        console.log(error);
      }
    }
    return final;
  };

  const clearPrevEstimation = () => {
    setIsValidTransaction(false);
    setEstimatedTxnResult(undefined);
  };

  return (
    <Web3Context.Provider
      value={{
        chainId,
        recipientAddress,
        setRecipientAddress,
        amount,
        setAmount,
        gasUnitPrice,
        setGasUnitPrice,
        maxGasAmount,
        setMaxGasAmount,
        isValidTransaction,
        setIsValidTransaction,
        estimatedTxnResult,
        setEstimatedTxnResult,
        txnDetails,
        setTxnDetails,
        mintCoins,
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
        getTokenStore,
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
        estimateGasPrice,
        estimateTransaction,
        sendTransaction,
        signMessage,
        signTransaction,
        signAndSubmitTransaction,
        updateAccountAssets,
        findAsset,
        registerAsset,
        clearPrevEstimation,
        clearTxnInput,
        mainnet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
