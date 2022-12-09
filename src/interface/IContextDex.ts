import { ICoin } from "./";
import { TxnBuilderTypes, Types } from "aptos";

interface IContextDex {
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  xCoin: ICoin;
  setXCoin: React.Dispatch<React.SetStateAction<ICoin>>;
  yCoin: ICoin;
  setYCoin: React.Dispatch<React.SetStateAction<ICoin>>;
  slippage: string;
  setSlippage: React.Dispatch<React.SetStateAction<string>>;
  transactionTimeout: string;
  setTransactionTimeout: React.Dispatch<React.SetStateAction<string>>;
  maxGasAmount: string;
  setMaxGasAmount: React.Dispatch<React.SetStateAction<string>>;
  simulateSwapTransaction: (payload: TxnBuilderTypes.TransactionPayloadEntryFunction) => Promise<Types.UserTransaction>;
  submitSwapTransaction: (payload: TxnBuilderTypes.TransactionPayloadEntryFunction) => Promise<Types.Transaction>;
}

export default IContextDex;
