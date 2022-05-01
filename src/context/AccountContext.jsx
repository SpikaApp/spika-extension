import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as aptos from "aptos";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { sign } from "tweetnacl";
import shortenAddress from "../utils/shortenAddress";
import * as passworder from "@metamask/browser-passworder";
import { UIContext } from "./UIContext";

// export const NODE_URL = "/api";
// export const FAUCET_URL = "/faucet";

export const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
export const FAUCET_URL = "https://faucet.devnet.aptoslabs.com";

// export const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
// export const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

export const AccountContext = React.createContext();

export const AccountProvider = ({ children }) => {
  const [alertSignal, setAlertSignal] = useState(0);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountImported, setAccountImported] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [newMnemonic, setNewMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState([]); // Uint8Array
  const [currentAddress, setCurrentAddress] = useState(""); // AuthKey in HexString
  const [account, setAccount] = useState([]); // AptosAccount
  const [balance, setBalance] = useState([]);
  const [sentEvents, setSentEvents] = useState([]);
  const [receivedEvents, setReceivedEvents] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { handleLoginUI, setOpenLoginDialog, setMnemonicRequired } = useContext(UIContext);

  const navigate = useNavigate();

  const client = new aptos.AptosClient(NODE_URL);
  const faucetClient = new aptos.FaucetClient(NODE_URL, FAUCET_URL, null);

  useEffect(() => {
    checkIfLoginRequired();
  }, []);

  const handleGenerate = () => {
    generateMnemonic();
  };

  const generateMnemonic = () => {
    const mn = bip39.generateMnemonic(english.wordlist);
    setNewMnemonic(mn);
  };

  const checkIfLoginRequired = () => {
    try {
      const data = JSON.parse(localStorage.getItem("accountImported"));
      if (data === true) {
        handleLoginUI();
      } else {
        navigate("/");
      }
    } catch (error) {
      setAccountImported(false);
      console.log(error);
    }
  };

  const handleLogin = async () => {
    try {
      setOpenLoginDialog(false);
      setIsLoading(true);
      await loadAccount();
      setIsLoading(false);
      setPassword("");
    } catch (error) {
      setOpenLoginDialog(false);
      throwAlert(62, "Error", "Failed load account");
      setPassword("");
      console.log("Error occured during loading account");
    }
  };

  const handleRevealMnemonic = async () => {
    try {
      const encryptedMnemonic = localStorage.getItem("data");
      let decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      throwAlert(91, "Mnemonic Phrase", decryptedMnemonic);
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert(92, "Error", "Incorrect password");
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const handleCreate = async () => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await createAccount();
      clearPasswords();
      setIsLoading(false);
    } else if (password === "") {
      throwAlert(52, "Incorrect password", "Password field cannot be empty");
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert(53, "Incorrect password", "Passwords do not match");
      clearPasswords();
    } else if ([password.length > 5]) {
      throwAlert(54, "Incorrect password", "Password must be at least 6 characters long");
      clearPasswords();
    }
  };

  const handleImport = async () => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await importAccount();
      clearPasswords();
      setIsLoading(false);
      setIsLoading(false);
    } else if (password === "") {
      throwAlert(52, "Incorrect password", "Password field cannot be empty");
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert(53, "Incorrect password", "Passwords do not match");
      clearPasswords();
    } else if ([password.length > 5]) {
      throwAlert(54, "Incorrect password", "Password must be at least 6 characters long");
      clearPasswords();
    }
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

  const clearPasswords = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const throwAlert = (signal, title, message) => {
    setAlertSignal(signal);
    setAlertTitle(title);
    setAlertMessage(message);
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
      let encryptedMnemonic = await passworder.encrypt(password, newMnemonic);
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("data", encryptedMnemonic);
      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountBalance.data.coin.value);
      setNewMnemonic("");
      setMnemonic("");
      throwAlert(1, "Account Created", `Address:\n${shortenAddress(account.address().toString())}`);
    } catch (error) {
      throwAlert(2, "Error", "Failed create account");
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
      let encryptedMnemonic = await passworder.encrypt(password, mnemonic);
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("data", encryptedMnemonic);

      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountBalance.data.coin.value);
      setMnemonic("");
      throwAlert(11, "Account Imported", `Address:\n${shortenAddress(account.address().toString())}`);
    } catch (error) {
      throwAlert(12, "Error", "Failed import account");
      console.log(error);
    }
  };

  const loadAccount = async () => {
    try {
      const encryptedMnemonic = localStorage.getItem("data");
      let decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      try {
        const accountSeed = bip39.mnemonicToSeedSync(decryptedMnemonic);
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
      } catch (error) {
        localStorage.clear();
        console.log(error);
        throwAlert(42, "Error", "Failed load account");
      }
    } catch (error) {
      console.log(error);
      throwAlert(55, "Error", "Incorrect password");
      setPassword("");
      setOpenLoginDialog(true);
    }
  };

  const mintCoins = async () => {
    try {
      const account = new aptos.AptosAccount(privateKey, currentAddress);
      await faucetClient.fundAccount(account.address(), amount);
      throwAlert(21, "Woohoo! Airdrop :)", `Received ${amount} TestCoin`);
    } catch (error) {
      throwAlert(22, "Error", "Mint failed");
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
      throwAlert(31, "Transaction sent", `${amount} TestCoin sent to ${shortenAddress(recipientAddress)}`);
    } catch (error) {
      throwAlert(32, "Error", "Transaction failed");
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
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleLogin,
        handleRevealMnemonic,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
