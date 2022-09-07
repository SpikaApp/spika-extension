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
      testSignAndSubmitTransaction(payload.hippoFaucet);
    }
  }, [isTest === true]);

  const testSignTransaction = async (transaction) => {
    try {
      console.log(transaction);
      const test = await signTransaction(transaction);
      const convert = Buffer.from(test).toString();
      console.log(convert);
      setResult(test);
      console.log(test);
      setIsTest(false);
    } catch (error) {
      console.log(error);
      setIsTest(false);
    }
  };

  const testSignAndSubmitTransaction = async (transaction) => {
    try {
      const test = await signAndSubmitTransaction(transaction);
      setResult(test);
      console.log(test);
      setIsTest(false);
    } catch (error) {
      console.log(error);
      setIsTest(false);
    }
  };

  return { result };
};

export default transaction;
