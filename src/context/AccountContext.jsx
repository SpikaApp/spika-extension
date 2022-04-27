import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as aptos from "aptos";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { sign } from "tweetnacl";
import shortenAddress from "../utils/shortenAddress";

const NODE_URL = "/api";
const FAUCET_URL = "/faucet";

// const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
// const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

export const AccountContext = React.createContext();

export const AccountProvider = ({ children }) => {
  const [error, setError] = useState(true);
  const [alertSignal, setAlertSignal] = useState(0);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [newMnemonic, setNewMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState([]); // Uint8Array
  const [accountImported, setAccountImported] = useState(false);
  const [account, setAccount] = useState([]); // AptosAccount
  const [currentAddress, setCurrentAddress] = useState(""); // PublicKey in HexString
  const [balance, setBalance] = useState([]);
  const [sentEvents, setSentEvents] = useState([]);
  const [receivedEvents, setReceivedEvents] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const navigate = useNavigate();

  const client = new aptos.AptosClient(NODE_URL);
  const faucetClient = new aptos.FaucetClient(NODE_URL, FAUCET_URL, null);

  useEffect(() => {
    loadAccount();
  }, []);

  const handleGenerate = () => {
    generateMnemonic();
  };

  const generateMnemonic = () => {
    const mn = bip39.generateMnemonic(english.wordlist);
    setNewMnemonic(mn);
  };

  const handleCreate = async () => {
    setIsLoading(true);
    await createAccount();
    setIsLoading(false);
  };

  const handleImport = async () => {
    setIsLoading(true);
    await importAccount();
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleMint = async () => {
    setIsLoading(true);
    await mintCoins();
    setIsLoading(false);
    setAmount("");
  };

  const handleSend = async () => {
    setIsLoading(true);
    await sendTransaction();
    setIsLoading(false);
    setRecipientAddress("");
    setAmount("");
  };

  const createAccount = async () => {
    try {
      const accountSeed = bip39.mnemonicToSeedSync(newMnemonic);
      const seed = new Uint8Array(accountSeed).slice(0, 32);
      const keypair = sign.keyPair.fromSeed(seed);
      const secretKey = keypair.secretKey;
      const address = keypair.publicKey.Hex;
      const account = new aptos.AptosAccount(secretKey, address);
      await faucetClient.fundAccount(account.address(), 0); // Workaround during devnet
      let resources = await client.getAccountResources(account.address());
      let accountBalance = resources.find((r) => r.type === "0x1::TestCoin::Balance");
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("mnemonic", newMnemonic);
      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountBalance.data.coin.value);

      setAlertSignal(1);
      setAlertTitle("Account Created");
      setAlertMessage(`Address:\n${shortenAddress(account.address().toString())}`);
      setNewMnemonic("");
      setMnemonic("");
    } catch (error) {
      setError(true);
      setAlertSignal(2);
      setAlertTitle("Error");
      setAlertMessage("Failed create account");
      console.log(error);
    }
  };

  const importAccount = async () => {
    try {
      const accountSeed = bip39.mnemonicToSeedSync(mnemonic);
      const seed = new Uint8Array(accountSeed).slice(0, 32);
      const keypair = sign.keyPair.fromSeed(seed);
      const secretKey = keypair.secretKey;
      const address = keypair.publicKey.Hex;
      const account = new aptos.AptosAccount(secretKey, address);
      let resources = await client.getAccountResources(account.address());
      let accountBalance = resources.find((r) => r.type === "0x1::TestCoin::Balance");
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("mnemonic", mnemonic);
      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountBalance.data.coin.value);

      setAlertSignal(11);
      setAlertTitle("Account Imported");
      setAlertMessage(`Address:\n${shortenAddress(account.address().toString())}`);
      setMnemonic("");
    } catch (error) {
      setError(true);
      setAlertSignal(12);
      setAlertTitle("Error");
      setAlertMessage("Failed import account");
      console.log(error);
    }
  };

  const loadAccount = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("accountImported"));
      if (data === true) {
        const storedMnemonic = localStorage.getItem("mnemonic");
        try {
          setIsLoading(true);
          const accountSeed = bip39.mnemonicToSeedSync(storedMnemonic);
          const seed = new Uint8Array(accountSeed).slice(0, 32);
          const keypair = sign.keyPair.fromSeed(seed);
          const secretKey = keypair.secretKey;
          const address = keypair.publicKey.Hex;
          const account = new aptos.AptosAccount(secretKey, address);
          let resources = await client.getAccountResources(account.address());
          let accountBalance = resources.find((r) => r.type === "0x1::TestCoin::Balance");

          setAccountImported(true);
          setPrivateKey(secretKey);
          setAccount(account);
          setCurrentAddress(account.address().toString());
          setBalance(accountBalance.data.coin.value);
          setIsLoading(false);
        } catch (error) {
          setError(true);
          setAlertSignal(42);
          setAlertTitle("Error");
          setAlertMessage("Failed load account");
          localStorage.clear();
          console.log(error);
          setIsLoading(false);
        }
      } else {
        setAccountImported(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintCoins = async () => {
    try {
      const account = new aptos.AptosAccount(privateKey, currentAddress);
      await faucetClient.fundAccount(account.address(), amount);
      setAlertSignal(21);
      setAlertTitle("Woohoo! Airdrop :)");
      setAlertMessage(`Received ${amount} Test Coins`);
    } catch (error) {
      setError(true);
      setAlertSignal(22);
      setAlertTitle("Error");
      setAlertMessage("Failed mint coins");
      setIsLoading(false);
      console.log(error);
    }
  };

  const payload = {
    type: "script_function_payload",
    function: "0x1::TestCoin::transfer",
    type_arguments: [],
    arguments: [recipientAddress, amount],
  };

  const sendTransaction = async () => {
    try {
      const txnRequest = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transactionRes = await client.submitTransaction(account, signedTxn);
      await client.waitForTransaction(transactionRes.hash);

      setAlertSignal(31);
      setAlertTitle("Transaction sent");
      setAlertMessage(`${amount} Test Coins sent to ${shortenAddress(recipientAddress)}`);
    } catch (error) {
      setError(true);
      setAlertSignal(32);
      setAlertTitle("Error");
      setAlertMessage("Transaction failed");
      setIsLoading(false);
      console.log(error);
    }
  };

  const getBalance = async () => {
    // try-catch ?
    const account = new aptos.AptosAccount(privateKey, currentAddress);
    let resources = await client.getAccountResources(account.address());
    let accountBalance = resources.find((r) => r.type === "0x1::TestCoin::Balance");
    setBalance(accountBalance.data.coin.value);
  };

  const getSentEvents = async () => {
    // try-catch ?
    let data = await client.getEventsByEventHandle(currentAddress, "0x1::TestCoin::TransferEvents", "sent_events");
    let res = data.reverse((r) => r.type === "sequence_number");
    setSentEvents(res);
  };

  const getReceivedEvents = async () => {
    // try-catch ?
    let data = await client.getEventsByEventHandle(currentAddress, "0x1::TestCoin::TransferEvents", "received_events");
    let res = data.reverse((r) => r.type === "sequence_number");
    setReceivedEvents(res);
  };

  return (
    <AccountContext.Provider
      value={{
        mnemonic,
        newMnemonic,
        setNewMnemonic,
        setMnemonic,
        alertTitle,
        alertSignal,
        setAlertSignal,
        setAlertTitle,
        alertMessage,
        setAlertMessage,
        isLoading,
        handleImport,
        currentAddress,
        accountImported,
        balance,
        handleGenerate,
        handleCreate,
        amount,
        setAmount,
        handleMint,
        handleSend,
        getBalance,
        recipientAddress,
        setRecipientAddress,
        getSentEvents,
        sentEvents,
        getReceivedEvents,
        receivedEvents,
        handleLogout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
