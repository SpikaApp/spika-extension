import aptos, { Types } from "aptos";
import ICoin from "./ICoin";
import INftDetails from "./INftDetails";

interface IContextWeb3 {
  chainId: number | undefined;
  recipientAddress: string;
  setRecipientAddress: React.Dispatch<React.SetStateAction<string>>;
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  gasUnitPrice: string;
  setGasUnitPrice: React.Dispatch<React.SetStateAction<string>>;
  maxGasAmount: string;
  setMaxGasAmount: React.Dispatch<React.SetStateAction<string>>;
  isValidTransaction: boolean;
  setIsValidTransaction: React.Dispatch<React.SetStateAction<boolean>>;
  estimatedTxnResult: aptos.Types.UserTransaction | undefined;
  setEstimatedTxnResult: React.Dispatch<React.SetStateAction<aptos.Types.UserTransaction | undefined>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  txnDetails: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTxnDetails: React.Dispatch<React.SetStateAction<any>>;
  nftDetails: INftDetails[];
  depositEventsCounter: number;
  setDepositEventsCounter: React.Dispatch<React.SetStateAction<number>>;
  withdrawEventsCounter: number;
  setWithdrawEventsCounter: React.Dispatch<React.SetStateAction<number>>;
  withdrawEvents: aptos.Types.Event[];
  setWithdrawEvents: React.Dispatch<React.SetStateAction<aptos.Types.Event[]>>;
  depositEvents: aptos.Types.Event[];
  setDepositEvents: React.Dispatch<React.SetStateAction<aptos.Types.Event[]>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountTokens: any;
  isValidAsset: boolean;
  setIsValidAsset: React.Dispatch<React.SetStateAction<boolean>>;
  getEventsCount: (events: string) => Promise<void | 0>;
  getDepositEvents: (query: IEventsQuery) => Promise<void>;
  getWithdrawEvents: (query: IEventsQuery) => Promise<void>;
  getTxnDetails: (version: number | bigint) => Promise<void>;
  getAccountTokens: () => Promise<void>;
  getBalance: (asset?: ICoin) => Promise<void | string>;
  updateBalance: (asset: ICoin) => Promise<string>;
  getTransactions: () => Promise<aptos.Types.Transaction[]>;
  getNftDetails: () => Promise<void>;
  createToken: (payload: aptos.TxnBuilderTypes.TransactionPayload) => Promise<void>;
  selectedAsset: ICoin | Record<string, never>;
  setSelectedAsset: React.Dispatch<React.SetStateAction<ICoin | Record<string, never>>>;
  aptosName: string;
  aptosAddress: string;
  mainnet: boolean;
  getAptosName: (address: string) => Promise<void>;
  getAptosAddress: (aptosName: string) => Promise<void>;
  handleMint: () => Promise<void>;
  estimateGasPrice: () => Promise<Types.GasEstimation>;
  handleSend: (payload?: aptos.TxnBuilderTypes.TransactionPayload, isBcs?: boolean, silent?: boolean) => Promise<void>;
  handleEstimate: (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ) => Promise<aptos.Types.UserTransaction | void>;
  estimateTransaction: (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ) => Promise<aptos.Types.UserTransaction | void>;
  sendTransaction: (
    payload?: aptos.Types.EntryFunctionPayload | aptos.TxnBuilderTypes.TransactionPayload,
    isBcs?: boolean,
    silent?: boolean
  ) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (payload: aptos.Types.EntryFunctionPayload) => Promise<Uint8Array | unknown>;
  signAndSubmitTransaction: (
    payload: aptos.Types.EntryFunctionPayload
  ) => Promise<aptos.Types.PendingTransaction | unknown>;
  updateAccountAssets: () => Promise<void>;
  findAsset: (coinType: string, address?: string) => Promise<ICoin | undefined>;
  registerAsset: (coinType: string, name: string) => Promise<void>;
  clearPrevEstimation: () => void;
  clearTxnInput: () => void;
}

interface IEventsQuery {
  start: number;
  limit: number;
}

export default IContextWeb3;
