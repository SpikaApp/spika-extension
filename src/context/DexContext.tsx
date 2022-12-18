/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as aptos from "aptos";
import React, { createContext, useContext, useState } from "react";
import { ICoin, IContextDex } from "../interface";
import { spikaClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import { DEFAULT_MAX_GAS } from "../utils/constants";
import { AccountContext } from "./AccountContext";
import { Web3Context } from "./Web3Context";

type DexContextProps = {
  children: React.ReactNode;
};

export const DexContext = createContext<IContextDex>({} as IContextDex);

export const DexProvider = ({ children }: DexContextProps) => {
  const { account } = useContext(AccountContext);
  const { gasUnitPrice } = useContext(Web3Context);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [xCoin, setXCoin] = useState<ICoin>(aptosCoin);
  const [yCoin, setYCoin] = useState<ICoin>(aptosCoin);
  const [slippage, setSlippage] = useState<string>("1");
  const [transactionTimeout, setTransactionTimeout] = useState<string>("10");
  const [maxGasAmount, setMaxGasAmount] = useState<string>(DEFAULT_MAX_GAS);

  const simulateSwapTransaction = async (
    payload: aptos.TxnBuilderTypes.TransactionPayloadEntryFunction
  ): Promise<aptos.Types.UserTransaction> => {
    const spika = await spikaClient();
    const data = await spika.client.generateRawTransaction(account!.address(), payload, {
      gasUnitPrice: BigInt(gasUnitPrice),
      maxGasAmount: BigInt(maxGasAmount),
    });
    const transaction = aptos.AptosClient.generateBCSSimulation(account!, data);
    const result = (await spika.client.submitBCSSimulation(transaction))[0];
    return result;
  };

  const submitSwapTransaction = async (
    payload: aptos.TxnBuilderTypes.TransactionPayloadEntryFunction
  ): Promise<aptos.Types.Transaction> => {
    const spika = await spikaClient();
    const result = await spika.client.generateSignSubmitWaitForTransaction(account!, payload, {
      gasUnitPrice: BigInt(gasUnitPrice),
      maxGasAmount: BigInt(maxGasAmount),
      timeoutSecs: Number(transactionTimeout),
      checkSuccess: true,
    });
    return result;
  };

  return (
    <DexContext.Provider
      value={{
        isFetching,
        setIsFetching,
        xCoin,
        setXCoin,
        yCoin,
        setYCoin,
        slippage,
        setSlippage,
        transactionTimeout,
        setTransactionTimeout,
        maxGasAmount,
        setMaxGasAmount,
        simulateSwapTransaction,
        submitSwapTransaction,
      }}
    >
      {children}
    </DexContext.Provider>
  );
};
