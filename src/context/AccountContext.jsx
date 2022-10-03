import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as aptos from "aptos";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import * as passworder from "@metamask/browser-passworder";
import { UIContext } from "./UIContext";
import { spikaClient } from "../lib/client";
import { aptosCoin, coinStore } from "../lib/coin";
import { setMem, getMem, removeMem, setStore, getStore, clearStore } from "../lib/store";
import * as assetStore from "../lib/asset_store";
import * as apps from "../lib/apps";
import * as network from "../lib/network";
import { APTOS_DERIVE_PATH, PLATFORM, EXTENSION_VERSION } from "../utils/constants";
import { encryptPassword, decryptPassword } from "../utils/pwd";
import debug from "../utils/debug";

export const AccountContext = React.createContext();

export const AccountProvider = ({ children }) => {
  const {
    spikaWallet,
    setSpikaWallet,
    handleLoginUI,
    setOpenLoginDialog,
    setMnemonicRequired,
    setPrivateKeyRequired,
    setAccountRoutesEnabled,
    setIsError,
  } = useContext(UIContext);

  const [alertSignal, setAlertSignal] = useState(0);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [accountImported, setAccountImported] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [newMnemonic, setNewMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState([]); // Uint8Array
  const [currentAddress, setCurrentAddress] = useState("");
  const [publicAccount, setPublicAccount] = useState({});
  const [account, setAccount] = useState({}); // AptosAccount
  const [currentNetwork, setCurrentNetwork] = useState();
  const [currentAsset, setCurrentAsset] = useState({});
  const [baseCoin, setBaseCoin] = useState(aptosCoin);
  const [quoteCoin, setQuoteCoin] = useState(aptosCoin);
  const [accountAssets, setAccountAssets] = useState([]);
  const [swapSupportedAssets, setSwapSupportedAssets] = useState([]);
  const [balance, setBalance] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  const locker = (method) => {
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
      if (PLATFORM === "chrome-extension:") {
        chrome.runtime.connect({ name: "spika" });
      }
      walletState();
    }
  }, [spikaWallet]);

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
      const pwd = await decryptPassword(data);
      setPassword(pwd);
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
      throwAlert(62, "Failed load account", `${error}`, true);
      setPassword("");
      console.log("Error occured during loading account");
      setAccountRoutesEnabled(true);
    }
  };

  const handleLogout = () => {
    locker("idle");
    removeMem(PLATFORM, "PWD");
    clearStore(PLATFORM);
    navigate(0);
    window.close();
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

  const handleChangePassword = async () => {
    const data = await getMem(PLATFORM, "PWD");
    const oldPassword = await decryptPassword(data);
    if (oldPassword === password) {
      if (newPassword === password) {
        throwAlert(58, "Incorrect password", "New password shall not be the same", true);
        clearPasswords();
      } else if (newPassword === confirmPassword && newPassword.length > 5) {
        setIsLoading(true);
        await changePassword();
        clearPasswords();
        setIsLoading(false);
      } else if (newPassword === "") {
        throwAlert(52, "Incorrect password", "Password field cannot be empty", true);
        clearPasswords();
      } else if (newPassword !== confirmPassword) {
        throwAlert(53, "Incorrect password", "Passwords do not match", true);
        clearPasswords();
      } else if ([newPassword.length > 5]) {
        throwAlert(54, "Incorrect password", "Password must be at least 6 characters long", true);
        clearPasswords();
      }
    } else {
      throwAlert(57, "Incorrect password", "Current password is wrong", true);
      clearPasswords();
    }
  };

  const changePassword = async () => {
    try {
      let encryptedMnemonic = await getStore(PLATFORM, "DATA0");
      let encryptedPrivateKey = await getStore(PLATFORM, "DATA1");
      const decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      const decryptedPrivateKey = await passworder.decrypt(password, encryptedPrivateKey);
      encryptedMnemonic = await passworder.encrypt(newPassword, decryptedMnemonic);
      encryptedPrivateKey = await passworder.encrypt(newPassword, decryptedPrivateKey);
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      const encryptedPassword = await encryptPassword(newPassword);
      setMem(PLATFORM, "PWD", encryptedPassword);
      clearPasswords();
      throwAlert(56, "Success", "Password successfully changed", false);
    } catch (error) {
      clearPasswords();
      console.log(error);
    }
  };

  const clearPasswords = () => {
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
  };

  const handleCreate = async () => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await createAccount();
      clearPasswords();
      setIsLoading(false);
      navigate("/");
    } else if (password === "") {
      throwAlert(52, "Incorrect password", "Password field cannot be empty", true);
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert(53, "Incorrect password", "Passwords do not match", true);
      clearPasswords();
    } else if ([password.length > 5]) {
      throwAlert(54, "Incorrect password", "Password must be at least 6 characters long", true);
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
      throwAlert(52, "Incorrect password", "Password field cannot be empty", true);
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert(53, "Incorrect password", "Passwords do not match", true);
      clearPasswords();
    } else if ([password.length > 5]) {
      throwAlert(54, "Incorrect password", "Password must be at least 6 characters long", true);
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
      throwAlert(91, "Secret Recovery Phrase", decryptedMnemonic, false);
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert(92, "Error", "Incorrect password", true);
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const handleRevealPrivateKey = async () => {
    try {
      const encryptedPrivateKey = await getStore(PLATFORM, "DATA1");
      let decryptedPrivateKey = await passworder.decrypt(password, encryptedPrivateKey);
      throwAlert(81, "Private Key", `0x${decryptedPrivateKey}`, false);
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert(92, "Error", "Incorrect password", true);
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const createAccount = async () => {
    const spika = await spikaClient();
    debug.log(spika);
    try {
      const _account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, newMnemonic);
      debug.log("mnemonic: ", newMnemonic);
      const _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
      debug.log("account address", _account.address().hex());
      await spika.faucetClient.fundAccount(_account.address().hex(), 0); // Workaround during devnet
      let resources = await spika.client.getAccountResources(_account.address().hex());
      debug.log(resources);
      let accountResource = resources.find((r) => r.type === coinStore(aptosCoin.type));
      let encryptedMnemonic = await passworder.encrypt(password, newMnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, _privateKey);
      let _publicAccount = {
        publicKey: _account.pubKey().hex(),
        account: _account.address().hex(),
        authKey: _account.authKey().hex(),
      };
      locker("lock");
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
      setStore(PLATFORM, "accountVersion", EXTENSION_VERSION);
      setStore(PLATFORM, "currentAddress", _account.address().hex());
      setStore(PLATFORM, "currentPubAccount", _publicAccount);
      setStore(PLATFORM, "currentNetwork", network.networkList[0]);
      const encryptedPassword = await encryptPassword(password);
      setMem(PLATFORM, "PWD", encryptedPassword);
      setStore(PLATFORM, "currentAsset", aptosCoin);
      assetStore.addAssetStore(_account.address().hex(), aptosCoin);
      network.addNetworkStore(_account.address().hex());
      apps.addAddress(_publicAccount);
      setAccountImported(true);
      setSpikaWallet(true);
      setPrivateKey(_privateKey);
      setAccount(_account);

      setPublicAccount(_publicAccount);
      setCurrentAddress(_account.address().hex());
      setCurrentNetwork(network.networkList[0]);
      setCurrentAsset(aptosCoin);
      setBalance(accountResource.data.coin.value);
      setNewMnemonic("");
      setMnemonic("");
      throwAlert(1, "Account created", `${_account.address().hex()}`, false);
    } catch (error) {
      throwAlert(2, "Failed create account", `${error}`, true);
      console.log(error);
    }
  };

  const importAccount = async () => {
    const spika = await spikaClient();
    debug.log(spika);
    try {
      const _account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, mnemonic);
      debug.log("mnemonic: ", mnemonic);
      const _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
      debug.log(_privateKey);
      debug.log("account address", _account.address().hex());
      try {
        await spika.client.getAccount(_account.address().hex());
      } catch (error) {
        await spika.faucetClient.fundAccount(_account.address(), 0); // Workaround during devnet
        debug.log("Account not found on chain, calling faucet");
      }
      let resources = await spika.client.getAccountResources(_account.address().hex());
      debug.log(resources);
      let accountResource = resources.find((r) => r.type === coinStore(aptosCoin.type));
      let encryptedMnemonic = await passworder.encrypt(password, mnemonic);
      let encryptedPrivateKey = await passworder.encrypt(password, _privateKey);
      let _publicAccount = {
        publicKey: _account.pubKey().hex(),
        account: _account.address().hex(),
        authKey: _account.authKey().hex(),
      };
      locker("lock");
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
      setStore(PLATFORM, "accountVersion", EXTENSION_VERSION);
      setStore(PLATFORM, "currentAddress", _account.address().hex());
      setStore(PLATFORM, "currentPubAccount", _publicAccount);
      setStore(PLATFORM, "currentNetwork", network.networkList[0]);
      const encryptedPassword = await encryptPassword(password);
      setMem(PLATFORM, "PWD", encryptedPassword);
      setStore(PLATFORM, "currentAsset", aptosCoin);
      assetStore.addAssetStore(_account.address().hex(), aptosCoin);
      network.addNetworkStore(_account.address().hex());
      apps.addAddress(_publicAccount);
      setAccountImported(true);
      setSpikaWallet(true);
      setPrivateKey(_privateKey);
      setAccount(_account);
      setPublicAccount(_publicAccount);
      setCurrentAddress(_account.address().hex());
      setCurrentNetwork(network.networkList[0]);
      setCurrentAsset(aptosCoin);
      setBalance(accountResource.data.coin.value);
      setNewMnemonic("");
      setMnemonic("");
      throwAlert(11, "Account imported", `${_account.address().hex()}`, false);
    } catch (error) {
      throwAlert(12, "Failed import account", `${error}`, true);
      console.log(error);
    }
  };

  const loadAccount = async () => {
    const spika = await spikaClient();
    try {
      const encryptedMnemonic = await getStore(PLATFORM, "DATA0");
      const decryptedMnemonic = await passworder.decrypt(password, encryptedMnemonic);
      try {
        const _account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, decryptedMnemonic);
        const _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
        try {
          await spika.client.getAccount(_account.address().hex());
        } catch (error) {
          await spika.faucetClient.fundAccount(_account.address(), 0); // Workaround during devnet
          debug.log("Account not found on chain, calling faucet");
        }
        let _currentAsset = await getStore(PLATFORM, "currentAsset");
        if (_currentAsset === undefined || _currentAsset === null) {
          setStore(PLATFORM, "currentAsset", aptosCoin);
          _currentAsset = aptosCoin;
        }
        let resources = await spika.client.getAccountResources(_account.address());
        let accountResource = resources.find((r) => r.type === coinStore(_currentAsset.type));
        let _currentNetwork = await getStore(PLATFORM, "currentNetwork");
        if (_currentNetwork === undefined || _currentNetwork === null) {
          setStore(PLATFORM, "currentNetwork", network.networkList[0]);
          _currentNetwork = network.networkList[0];
        }
        let _publicAccount = {
          publicKey: _account.pubKey().hex(),
          account: _account.address().hex(),
          authKey: _account.authKey().hex(),
        };
        assetStore.addAssetStore(_account.address().hex(), aptosCoin);
        network.addNetworkStore(_account.address().hex());
        apps.addAddress(_publicAccount);
        setStore(PLATFORM, "currentAddress", _account.address().hex());
        setStore(PLATFORM, "currentPubAccount", _publicAccount);
        const encryptedPassword = await encryptPassword(password);
        setMem(PLATFORM, "PWD", encryptedPassword);
        setAccountImported(true);
        setPrivateKey(_privateKey);
        setAccount(_account);
        setPublicAccount(_publicAccount);
        setCurrentAddress(_account.address().hex());
        setCurrentNetwork(_currentNetwork);
        setCurrentAsset(_currentAsset);
        if (accountResource === undefined || accountResource === null) {
          setBalance(0);
        } else {
          setBalance(accountResource.data.coin.value);
        }
      } catch (error) {
        console.log(error);
        throwAlert(42, "Failed to load account", `${error}`, true);
        setStore(PLATFORM, "currentNetwork", network.networkList[0]);
      }
    } catch (error) {
      console.log(error);
      throwAlert(55, "Error", "Incorrect password", true);
      setPassword("");
      setOpenLoginDialog(true);
    }
  };

  const throwAlert = (signal, title, message, error) => {
    setAlertSignal(signal);
    setAlertTitle(title);
    setAlertMessage(message);
    setIsError(error);
  };

  const clearAlert = () => {
    setAlertSignal(0);
    setAlertTitle("");
    setAlertMessage("");
    setIsError();
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
        clearAlert,
        isLoading,
        setIsLoading,
        isFetching,
        setIsFetching,
        mnemonic,
        newMnemonic,
        setNewMnemonic,
        setMnemonic,
        password,
        setPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        clearPasswords,
        handleChangePassword,
        spikaWallet,
        accountImported,
        setAccountImported,
        account,
        currentNetwork,
        setCurrentNetwork,
        publicAccount,
        privateKey,
        currentAddress,
        currentAsset,
        baseCoin,
        setBaseCoin,
        quoteCoin,
        setQuoteCoin,
        accountAssets,
        setAccountAssets,
        swapSupportedAssets,
        setSwapSupportedAssets,
        setCurrentAsset,
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
