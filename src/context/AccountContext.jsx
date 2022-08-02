import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as aptos from "aptos";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { sign } from "tweetnacl";
import shortenAddress from "../utils/shortenAddress";
import * as passworder from "@metamask/browser-passworder";
import { UIContext } from "./UIContext";
import { TokenClient } from "aptos";
import { saveSession, loadSession, clearSession } from "../utils/sessionStore";
import { PROTOCOL_TYPE, NODE_URL, FAUCET_URL } from "../utils/constants";

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
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionUri, setCollectionUri] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftUri, setNftUri] = useState("");
  const [nftSupply, setNftSupply] = useState(""); // number ?
  const [account, setAccount] = useState([]); // AptosAccount
  const [balance, setBalance] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [receivedEvents, setReceivedEvents] = useState([]);
  const [accountTokens, setAccountTokens] = useState([]);
  const [nftDetails, setNftDetails] = useState([]);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [data0Exist, setData0Exist] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const {
    handleLoginUI,
    setOpenLoginDialog,
    setMnemonicRequired,
    setPrivateKeyRequired,
    setOpenAlertDialog,
    setOpenLogoutDialog,
  } = useContext(UIContext);

  const navigate = useNavigate();

  const client = new aptos.AptosClient(NODE_URL);
  const tokenClient = new TokenClient(client);
  const faucetClient = new aptos.FaucetClient(NODE_URL, FAUCET_URL, null);

  useEffect(() => {
    if (PROTOCOL_TYPE === "chrome-extension:") {
      chrome.runtime.connect({ name: "spika" });
    }
    walletState();
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      if (PROTOCOL_TYPE === "chrome-extension:") {
        chrome.runtime.sendMessage({
          id: "service_worker",
          task: "listen",
        });
      }
      handleLogin();
    }
  }, [isUnlocked === true]);

  const walletState = async () => {
    const data = await loadSession(PROTOCOL_TYPE, "PWD");
    if (data === undefined || data === null) {
      checkIfLoginRequired();
      checkIfData0Exist();
    } else {
      setPassword(data);
      setIsUnlocked(true);
    }
  };

  const handleGenerate = () => {
    generateMnemonic();
  };

  const generateMnemonic = () => {
    const mn = bip39.generateMnemonic(english.wordlist);
    setNewMnemonic(mn);
  };

  const checkIfLoginRequired = () => {
    try {
      const oldMnemonic = localStorage.getItem("mnemonic"); // if unencrypted mnemonic found -> logout
      const data = JSON.parse(localStorage.getItem("accountImported"));

      if (oldMnemonic !== null && oldMnemonic.length > 0) {
        throwAlert(
          93,
          "Logout performed",
          "Unencrypted data is not supported in this version. Please login again to start using encryption"
        );
        setOpenAlertDialog(true);
      } else if (data === true) {
        handleLoginUI();
      } else {
        navigate("/");
      }
    } catch (error) {
      setAccountImported(false);
      console.log(error);
    }
  };

  const checkIfData0Exist = () => {
    const data0 = localStorage.getItem("data0");
    if (data0 !== null) {
      setData0Exist(true);
    } else {
      setData0Exist(false);
    }
  };

  const handleLogin = async () => {
    try {
      setOpenLoginDialog(false);
      setIsLoading(true);
      await loadAccount();
      setIsLoading(false);
      setPassword("");
      if (PROTOCOL_TYPE === "chrome-extension:") {
        chrome.runtime.sendMessage({
          id: "service_worker",
          task: "listen",
        });
      }
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

  const handleRevealPrivateKey = async () => {
    try {
      const encryptedPrivateKey = localStorage.getItem("data0");
      let decryptedPrivateKey = await passworder.decrypt(password, encryptedPrivateKey);
      throwAlert(81, "Private Key", `0x${decryptedPrivateKey}`);
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert(92, "Error", "Incorrect password");
      setPassword("");
      setPrivateKeyRequired(false);
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
    if (PROTOCOL_TYPE === "chrome-extension:") {
      chrome.runtime.sendMessage({
        id: "service_worker",
        task: "idle",
      });
    }
    navigate("/");
    setPrivateKey("");
    setCurrentAddress("");
    setAccount([]);
    clearPasswords();
    clearSession(PROTOCOL_TYPE, "PWD");
    setAccountImported(false);
    localStorage.clear();
    setOpenLogoutDialog(false);
  };

  const handleLock = () => {
    if (PROTOCOL_TYPE === "chrome-extension:") {
      chrome.runtime.sendMessage({
        id: "service_worker",
        task: "idle",
      });
    }
    setPrivateKey("");
    setCurrentAddress("");
    setAccount([]);
    clearPasswords();
    clearSession(PROTOCOL_TYPE, "PWD");
    setAccountImported(false);
    handleLoginUI();
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

  const handleCreateCollection = async () => {
    setIsLoading(true);
    await createCollection();
    setIsLoading(false);
    setCollectionName("");
    setCollectionDescription("");
    setCollectionUri("");
  };

  const handleCreateNft = async () => {
    setIsLoading(true);
    await createNft();
    setIsLoading(false);
    setCollectionName("");
    setNftName("");
    setNftDescription("");
    setNftUri("");
    setNftSupply("");
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
      const secretKeyHex64 = Buffer.from(keypair.secretKey).toString("hex").slice(0, 64);
      const address = keypair.publicKey.Hex;
      const account = new aptos.AptosAccount(secretKey, address);
      await faucetClient.fundAccount(account.address(), 0); // Workaround during devnet
      let resources = await client.getAccountResources(account.address());
      let accountResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      let encryptedMnemonic = await passworder.encrypt(password, newMnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, secretKeyHex64);
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("data", encryptedMnemonic);
      localStorage.setItem("data0", encryptedPrivateKey);
      saveSession(PROTOCOL_TYPE, "PWD", password);
      if (PROTOCOL_TYPE === "chrome-extension:") {
        chrome.runtime.sendMessage({
          id: "service_worker",
          task: "listen",
        });
      }
      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountResource.data.coin.value);
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
      const secretKeyHex64 = Buffer.from(keypair.secretKey).toString("hex").slice(0, 64);
      const address = keypair.publicKey.Hex;
      const account = new aptos.AptosAccount(secretKey, address);
      let resources = await client.getAccountResources(account.address());
      let accountResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      let encryptedMnemonic = await passworder.encrypt(password, mnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, secretKeyHex64);
      localStorage.setItem("accountImported", JSON.stringify(true));
      localStorage.setItem("data", encryptedMnemonic);
      localStorage.setItem("data0", encryptedPrivateKey);
      saveSession(PROTOCOL_TYPE, "PWD", password);
      if (PROTOCOL_TYPE === "chrome-extension:") {
        chrome.runtime.sendMessage({
          id: "service_worker",
          task: "listen",
        });
      }
      setAccountImported(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setCurrentAddress(account.address().toString());
      setBalance(accountResource.data.coin.value);
      setMnemonic("");
      throwAlert(
        11,
        "Account Imported",
        `Address:\n${shortenAddress(account.address().toString())}`
      );
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
        const secretKeyHex64 = Buffer.from(keypair.secretKey).toString("hex").slice(0, 64);
        const address = keypair.publicKey.Hex;
        const account = new aptos.AptosAccount(secretKey, address);
        let resources = await client.getAccountResources(account.address());
        let accountResource = resources.find(
          (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
        );
        saveSession(PROTOCOL_TYPE, "PWD", password);
        setAccountImported(true);
        setPrivateKey(secretKey);
        setAccount(account);
        setCurrentAddress(account.address().toString());
        setBalance(accountResource.data.coin.value);

        // check if current account has data0 (compatability after update)
        if (data0Exist === false) {
          let encryptedPrivateKey = await passworder.encrypt(password, secretKeyHex64);
          localStorage.setItem("data0", encryptedPrivateKey);
        }
      } catch (error) {
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
      throwAlert(21, "Success", `Received ${amount} Aptos Coin`);
    } catch (error) {
      throwAlert(22, "Error", "Mint failed");
      setIsLoading(false);
      console.log(error);
    }
  };

  const payload = {
    type: "script_function_payload",
    function: "0x1::coin::transfer",
    type_arguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: [recipientAddress, amount],
  };

  const sendTransaction = async () => {
    try {
      const txnRequest = await client.generateTransaction(currentAddress, payload);
      const signedTxn = await client.signTransaction(account, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
      throwAlert(31, "Transaction sent", `${transactionRes.hash}`);
    } catch (error) {
      throwAlert(32, "Error", "Transaction failed");
      setIsLoading(false);
      console.log(error);
    }
  };

  const createCollection = async () => {
    try {
      const collection = await tokenClient.createCollection(
        account,
        collectionName,
        collectionDescription,
        collectionUri
      );
      throwAlert(61, "Transaction sent", `${collection}`);
    } catch (error) {
      throwAlert(62, "Error", `${error}`);
      setIsLoading(false);
      console.log(error);
    }
  };

  const createNft = async () => {
    try {
      const nft = await tokenClient.createToken(
        account,
        collectionName,
        nftName,
        nftDescription,
        nftSupply,
        nftUri,
        0 // royalty_points_per_million
      );
      throwAlert(71, "Transaction sent", `${nft}`);
    } catch (error) {
      throwAlert(72, "Error", `${error}`);
      setIsLoading(false);
      console.log(error);
    }
  };

  const getBalance = async () => {
    let resources = await client.getAccountResources(account.address());
    let accountResource = resources.find(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    setBalance(accountResource.data.coin.value);
  };

  const getSentTransactions = async () => {
    let currentAccount = await client.getAccount(currentAddress);
    let sn = parseInt(currentAccount.sequence_number);
    if (sn <= 25) {
      let data = await client.getAccountTransactions(currentAddress);
      let res = data.reverse((r) => r.type === "version");
      setTransactions(res);
    } else {
      let data = await client.getAccountTransactions(currentAddress, {
        start: sn - 25,
        limit: 25,
      });
      let res = data.reverse((r) => r.type === "version");
      setTransactions(res);
    }
  };

  const getReceivedEvents = async () => {
    let accountResources = await client.getAccountResources(currentAddress);
    let accountAptosCoins = accountResources.find(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );

    let counter = parseInt(accountAptosCoins.data.deposit_events.counter);

    if (counter <= 25) {
      let data = await client.getEventsByEventHandle(
        currentAddress,
        "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        "deposit_events"
      );
      let res = data.reverse((r) => r.type === "sequence_number");
      setReceivedEvents(res);
    } else {
      let data = await client.getEventsByEventHandle(
        currentAddress,
        "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        "deposit_events",
        {
          start: counter - 25,
        }
      );
      let res = data.reverse((r) => r.type === "sequence_number");
      setReceivedEvents(res);
    }
  };

  const getAccountTokens = async () => {
    try {
      // Get total number of Token deposit_events received by an account
      let accountResources = await client.getAccountResources(currentAddress);
      let accountDepositedTokens = accountResources.find(
        (r) => r.type === "0x1::token::TokenStore"
      );

      const getTokens = async () => {
        if (accountDepositedTokens === undefined) {
          // console.log("Account doesn't hold any NFT yet");
          return setAccountTokens(0);
        } else {
          let tokenDepositCounter = parseInt(accountDepositedTokens.data.deposit_events.counter);
          // Get Token deposit_events
          let data = await client.getEventsByEventHandle(
            currentAddress,
            "0x1::token::TokenStore",
            "deposit_events",
            {
              limit: tokenDepositCounter,
            }
          );

          // Get TokenId for accountDepositedTokens and remove dublicates
          let tokenIds = [...new Set(data.map((value) => value.data.id))];

          // Returns an array of tokenId and value
          const accountTokensBalances = await Promise.all(
            tokenIds.map(async (i) => {
              let data = await tokenClient.getTokenBalanceForAccount(currentAddress, i);
              return data;
            })
          );

          // Returns an array of tokenId and value for all tokens with > 0 balance
          let result = accountTokensBalances.filter((r) => {
            return r.value !== "0";
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
  };

  const getNftDetails = async () => {
    try {
      if (accountTokens === 0) {
        // console.log("Account doesn't hold any NFT yet");
        return setNftDetails(0);
      } else {
        let data = await Promise.all(
          accountTokens.map(
            async (i) => await tokenClient.getTokenData(i.id.creator, i.id.collection, i.id.name)
          )
        );
        return setNftDetails(data);
      }
    } catch (error) {
      console.log(error);
    }
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
        collectionName,
        setCollectionName,
        collectionDescription,
        setCollectionDescription,
        collectionUri,
        setCollectionUri,
        handleCreateCollection,
        nftName,
        setNftName,
        nftDescription,
        setNftDescription,
        nftUri,
        setNftUri,
        nftSupply,
        setNftSupply,
        handleCreateNft,
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
        getSentTransactions,
        transactions,
        getReceivedEvents,
        receivedEvents,
        getAccountTokens,
        getNftDetails,
        accountTokens,
        nftDetails,
        handleLogout,
        handleLock,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleLogin,
        handleRevealMnemonic,
        handleRevealPrivateKey,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
