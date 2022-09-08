import { useState, useEffect, useContext } from "react";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import * as payload from "./payload.test";

const transaction = () => {
  const { isTest, setIsTest } = useContext(UIContext);
  const { signTransaction, signAndSubmitTransaction } = useContext(Web3Context);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isTest) {
      testSignTransaction(payload.hippoSwap);
      // testSignAndSubmitTransaction(payload.hippoFaucet);
      setIsTest(false);
    }
  }, [isTest === true]);

  const testSignTransaction = async (transaction) => {
    try {
      const test = await signTransaction(transaction);
      setResult(test);
    } catch (error) {
      console.log(error);
      setIsTest(false);
    }
  };

  const testSignAndSubmitTransaction = async (transaction) => {
    try {
      const test = await signAndSubmitTransaction(transaction);
      setResult(test);
    } catch (error) {
      console.log(error);
      setIsTest(false);
    }
  };

  return { result };
};

export default transaction;
