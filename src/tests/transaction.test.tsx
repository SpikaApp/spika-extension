/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useContext } from "react";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import * as payload from "./payload.test";

const transaction = (): any => {
  const { isTest, setIsTest } = useContext(UIContext);
  const { signTransaction } = useContext(Web3Context);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (isTest) {
      testSignTransaction(payload.hippoSwap);
      setIsTest(false);
    }
  }, [isTest === true]);

  const testSignTransaction = async (transaction: any) => {
    try {
      const test = await signTransaction(transaction);
      setResult(test);
    } catch (error) {
      console.log(error);
      setIsTest(false);
    }
  };

  return { result };
};

export default transaction;
