import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as aptos from "aptos";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import { sign } from "tweetnacl";
import * as passworder from "@metamask/browser-passworder";
import { UIContext } from "./UIContext";
import { client, faucetClient } from "../utils/client";
import * as token from "../utils/token";
import { PLATFORM } from "../utils/constants";
import { setMem, getMem, removeMem, setStore, getStore, clearStore } from "../utils/store";

export const AccountContext = React.createContext();

export const AccountProvider = ({ children }) => {
  const {
    spikaWallet,
    setSpikaWallet,
    handleLoginUI,
    setOpenLoginDialog,
    setMnemonicRequired,
    setPrivateKeyRequired,
    setOpenLogoutDialog,
    setAccountRoutesEnabled,
  } = useContext(UIContext);

  const [alertSignal, setAlertSignal] = useState(0);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountImported, setAccountImported] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [newMnemonic, setNewMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState([]); // Uint8Array
  const [currentAddress, setCurrentAddress] = useState(""); // AuthKey in HexString
  const [publicAccount, setPublicAccount] = useState({});
  const [account, setAccount] = useState([]); // AptosAccount
  const [currentAsset] = useState(token.aptosCoin);
  const [balance, setBalance] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const locker = (method, id) => {
    if (PLATFORM === "chrome-extension:") {
      chrome.runtime.sendMessage({
        method: method,
        id: "locker",
      });
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (spikaWallet === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [spikaWallet]);

  useEffect(() => {
    if (PLATFORM === "chrome-extension:") {
      chrome.runtime.connect({ name: "spika" });
    }
    walletState();
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      locker("lock");
      handleLogin();
    }
  }, [isUnlocked === true]);

  const walletState = async () => {
    const data = await getMem(PLATFORM, "PWD");
    if (data === undefined || data === null) {
      checkIfLoginRequired();
    } else {
      setPassword(data);
      setIsUnlocked(true);
    }
  };

  const checkIfLoginRequired = async () => {
    try {
      const data = await getStore(PLATFORM, "ACCOUNT_IMPORTED");
      if (data) {
        handleLoginUI();
      } else {
        navigate("/");
      }
    } catch (error) {
      setAccountImported(false);
      setAccountRoutesEnabled(true);
      console.log(error);
    }
  };

  const handleLogin = async () => {
    try {
      setOpenLoginDialog(false);
      setIsLoading(true);
      setAccountRoutesEnabled(false);
      await loadAccount();
      setIsLoading(false);
      setPassword("");
      locker("lock");
    } catch (error) {
      setOpenLoginDialog(false);
      throwAlert(62, "Failed load account", `${error}`);
      setPassword("");
      console.log("Error occured during loading account");
      setAccountRoutesEnabled(true);
    }
  };

  const handleLogout = () => {
    locker("idle");
    navigate("/");
    setPrivateKey("");
    setCurrentAddress("");
    setAccount([]);
    clearPasswords();
    removeMem(PLATFORM, "PWD");
    setAccountImported(false);
    setSpikaWallet(false);
    clearStore(PLATFORM);
    setOpenLogoutDialog(false);
    setAccountRoutesEnabled(true);
  };

  const handleLock = () => {
    locker("idle");
    setPrivateKey("");
    setCurrentAddress("");
    setAccount([]);
    clearPasswords();
    removeMem(PLATFORM, "PWD");
    setAccountImported(false);
    handleLoginUI();
  };

  const clearPasswords = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleCreate = async () => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await createAccount();
      clearPasswords();
      setIsLoading(false);
      navigate("/");
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
      navigate("/");
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

  const handleGenerate = () => {
    generateMnemonic();
  };

  const generateMnemonic = () => {
    const mn = bip39.generateMnemonic(english.wordlist);
    setNewMnemonic(mn);
  };

  const handleRevealMnemonic = async () => {
    try {
      const encryptedMnemonic = await getStore(PLATFORM, "DATA0");
      let decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      throwAlert(91, "Secret Recovery Phrase", decryptedMnemonic);
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
      const encryptedPrivateKey = await getStore(PLATFORM, "DATA1");
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
      let accountResource = resources.find((r) => r.type === currentAsset[1].module);
      let encryptedMnemonic = await passworder.encrypt(password, newMnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, secretKeyHex64);
      locker("lock");
      setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      setMem(PLATFORM, "PWD", password);
      setAccountImported(true);
      setSpikaWallet(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setPublicAccount({
        account: account.address().toString(),
        publicKey: account.pubKey().toString(),
      });
      setCurrentAddress(account.address().toString());
      setBalance(accountResource.data.coin.value);
      setNewMnemonic("");
      setMnemonic("");
      throwAlert(1, "Account created", `${account.address().toString()}`);
    } catch (error) {
      throwAlert(2, "Failed create account", `${error}`);
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
      await faucetClient.fundAccount(account.address(), 0); // Workaround during devnet
      let resources = await client.getAccountResources(account.address());
      let accountResource = resources.find((r) => r.type === currentAsset[1].module);
      let encryptedMnemonic = await passworder.encrypt(password, mnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, secretKeyHex64);
      locker("lock");
      setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      setMem(PLATFORM, "PWD", password);
      setAccountImported(true);
      setSpikaWallet(true);
      setPrivateKey(secretKey);
      setAccount(account);
      setPublicAccount({
        account: account.address().toString(),
        publicKey: account.pubKey().toString(),
      });
      setCurrentAddress(account.address().toString());
      setBalance(accountResource.data.coin.value);
      setMnemonic("");
      throwAlert(11, "Account imported", `${account.address().toString()}`);
    } catch (error) {
      throwAlert(12, "Failed import account", `${error}`);
      console.log(error);
    }
  };

  const loadAccount = async () => {
    try {
      const encryptedMnemonic = await getStore(PLATFORM, "DATA0");
      const decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      try {
        const accountSeed = bip39.mnemonicToSeedSync(decryptedMnemonic);
        const seed = new Uint8Array(accountSeed).slice(0, 32);
        const keypair = sign.keyPair.fromSeed(seed);
        const secretKey = keypair.secretKey;
        const address = keypair.publicKey.Hex;
        const account = new aptos.AptosAccount(secretKey, address);
        if (!isUnlocked) {
          await faucetClient.fundAccount(account.address(), 0); // Workaround during devnet
        }
        let resources = await client.getAccountResources(account.address());
        let accountResource = resources.find((r) => r.type === currentAsset[1].module);
        setMem(PLATFORM, "PWD", password);
        setAccountImported(true);
        setPrivateKey(secretKey);
        setAccount(account);
        setPublicAccount({
          account: account.address().toString(),
          publicKey: account.pubKey().toString(),
        });
        setCurrentAddress(account.address().toString());
        setBalance(accountResource.data.coin.value);
      } catch (error) {
        console.log(error);
        throwAlert(42, "Failed to load account", `${error}`);
      }
    } catch (error) {
      console.log(error);
      throwAlert(55, "Error", "Incorrect password");
      setPassword("");
      setOpenLoginDialog(true);
    }
  };

  const throwAlert = (signal, title, message) => {
    setAlertSignal(signal);
    setAlertTitle(title);
    setAlertMessage(message);
  };
  return (
    <AccountContext.Provider
      value={{
        alertTitle,
        alertSignal,
        setAlertSignal,
        setAlertTitle,
        alertMessage,
        setAlertMessage,
        throwAlert,
        isLoading,
        setIsLoading,
        mnemonic,
        newMnemonic,
        setNewMnemonic,
        setMnemonic,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        spikaWallet,
        accountImported,
        account,
        publicAccount,
        privateKey,
        currentAddress,
        currentAsset,
        balance,
        setBalance,
        handleGenerate,
        handleCreate,
        handleImport,
        handleLogout,
        handleLock,
        handleLogin,
        handleRevealMnemonic,
        handleRevealPrivateKey,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
