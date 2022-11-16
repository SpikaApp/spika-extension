import passworder from "@metamask/browser-passworder";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import * as aptos from "aptos";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { IAlertArgs, ICoin, IContextAccount, IEncryptedPwd, INetwork, IPublicAccount } from "../interface";
import * as network from "../lib/accountNetworks";
import * as assetStore from "../lib/assetStore";
import { spikaClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import * as apps from "../lib/connectedApps";
import { clearStore, getMem, getStore, removeMem, setMem, setStore } from "../lib/store";
import { APTOS_DERIVE_PATH, EXTENSION_VERSION, PLATFORM } from "../utils/constants";
import { decryptPassword, encryptPassword } from "../utils/pwd";
import { UIContext } from "./UIContext";

type AccountContextProps = {
  children: React.ReactNode;
};

export const AccountContext = createContext<IContextAccount>({} as IContextAccount);

export const AccountProvider = ({ children }: AccountContextProps) => {
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

  const [alertSignal, setAlertSignal] = useState<number>(0);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [accountImported, setAccountImported] = useState<boolean>(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [newMnemonic, setNewMnemonic] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string | undefined>();
  const [currentAddress, setCurrentAddress] = useState<string | undefined>();
  const [publicAccount, setPublicAccount] = useState<IPublicAccount | undefined>();
  const [account, setAccount] = useState<aptos.AptosAccount | undefined>();
  const [currentNetwork, setCurrentNetwork] = useState<INetwork | undefined>();
  const [currentAsset, setCurrentAsset] = useState<ICoin | undefined>();
  const [baseCoin, setBaseCoin] = useState<ICoin>(aptosCoin);
  const [quoteCoin, setQuoteCoin] = useState<ICoin>(aptosCoin);
  const [accountAssets, setAccountAssets] = useState<Array<ICoin>>([]);
  const [swapSupportedAssets, setSwapSupportedAssets] = useState<Array<ICoin>>([]);
  const [balance, setBalance] = useState<string | undefined>();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const locker = (method: string): void => {
    if (PLATFORM === "chrome-extension:") {
      chrome.runtime.sendMessage({
        method: method,
        id: "locker",
      });
    }
  };

  const navigate: NavigateFunction = useNavigate();

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

  const walletState = async (): Promise<void> => {
    const data: IEncryptedPwd = await getMem(PLATFORM, "PWD");
    if (data === undefined || data === null) {
      checkIfLoginRequired();
    } else {
      const pwd: string = await decryptPassword(data);
      setPassword(pwd);
      setIsUnlocked(true);
    }
  };

  const checkIfLoginRequired = async (): Promise<void> => {
    try {
      const data: boolean = await getStore(PLATFORM, "ACCOUNT_IMPORTED");
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

  const handleLogin = async (): Promise<void> => {
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
      throwAlert({ signal: 62, title: "Failed load account", message: `${error}`, error: true });
      setPassword("");
      console.log("Error occured during loading account");
      setAccountRoutesEnabled(true);
    }
  };

  const handleLogout = (): void => {
    locker("idle");
    removeMem(PLATFORM, "PWD");
    clearStore(PLATFORM);
    navigate(0);
    window.close();
  };

  const handleLock = (): void => {
    locker("idle");
    setPrivateKey(undefined);
    setCurrentAddress(undefined);
    setAccount(undefined);
    clearPasswords();
    removeMem(PLATFORM, "PWD");
    setAccountImported(false);
    handleLoginUI();
  };

  const handleChangePassword = async (): Promise<void> => {
    const data: IEncryptedPwd = await getMem(PLATFORM, "PWD");
    const oldPassword: string = await decryptPassword(data);
    if (oldPassword === password) {
      if (newPassword === password) {
        throwAlert({
          signal: 58,
          title: "Incorrect password",
          message: "New password shall not be the same",
          error: true,
        });
        clearPasswords();
      } else if (newPassword === confirmPassword && newPassword.length > 5) {
        setIsLoading(true);
        await changePassword();
        clearPasswords();
        setIsLoading(false);
      } else if (newPassword === "") {
        throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty", error: true });
        clearPasswords();
      } else if (newPassword !== confirmPassword) {
        throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match", error: true });
        clearPasswords();
      } else if (newPassword.length > 5) {
        throwAlert({
          signal: 54,
          title: "Incorrect password",
          message: "Password must be at least 6 characters long",
          error: true,
        });
        clearPasswords();
      }
    } else {
      throwAlert({ signal: 57, title: "Incorrect password", message: "Current password is wrong", error: true });
      clearPasswords();
    }
  };

  const changePassword = async (): Promise<void> => {
    try {
      let encryptedMnemonic: string = await getStore(PLATFORM, "DATA0");
      let encryptedPrivateKey: string = await getStore(PLATFORM, "DATA1");
      const decryptedMnemonic: string = await passworder.decrypt(password, encryptedMnemonic);
      const decryptedPrivateKey: string = await passworder.decrypt(password, encryptedPrivateKey);
      encryptedMnemonic = await passworder.encrypt(newPassword, decryptedMnemonic);
      encryptedPrivateKey = await passworder.encrypt(newPassword, decryptedPrivateKey);
      setStore(PLATFORM, "DATA0", encryptedMnemonic);
      setStore(PLATFORM, "DATA1", encryptedPrivateKey);
      const encryptedPassword: IEncryptedPwd = await encryptPassword(newPassword);
      setMem(PLATFORM, "PWD", encryptedPassword);
      clearPasswords();
      throwAlert({ signal: 56, title: "Success", message: "Password successfully changed", error: false });
    } catch (error) {
      clearPasswords();
      console.log(error);
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await createAccount();
      clearPasswords();
      setIsLoading(false);
      navigate("/");
    } else if (password === "") {
      throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty", error: true });
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match", error: true });
      clearPasswords();
    } else if (password.length > 5) {
      throwAlert({
        signal: 54,
        title: "Incorrect password",
        message: "Password must be at least 6 characters long",
        error: true,
      });
      clearPasswords();
    }
  };

  const handleImport = async (): Promise<void> => {
    if (password === confirmPassword && password.length > 5) {
      setIsLoading(true);
      await importAccount();
      clearPasswords();
      setIsLoading(false);
      navigate("/");
    } else if (password === "") {
      throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty", error: true });
      clearPasswords();
    } else if (password !== confirmPassword) {
      throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match", error: true });
      clearPasswords();
    } else if (password.length > 5) {
      throwAlert({
        signal: 54,
        title: "Incorrect password",
        message: "Password must be at least 6 characters long",
        error: true,
      });
      clearPasswords();
    }
  };

  const handleGenerate = (): void => {
    generateMnemonic();
  };

  const generateMnemonic = (): void => {
    const mn: string = bip39.generateMnemonic(english.wordlist);
    setNewMnemonic(mn);
  };

  const handleRevealMnemonic = async (): Promise<void> => {
    try {
      const encryptedMnemonic: string = await getStore(PLATFORM, "DATA0");
      const decryptedMnemonic: string = await passworder.decrypt(password, encryptedMnemonic);
      throwAlert({ signal: 91, title: "Secret Recovery Phrase", message: decryptedMnemonic, error: false });
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert({ signal: 92, title: "Error", message: "Incorrect password", error: true });
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const handleRevealPrivateKey = async (): Promise<void> => {
    try {
      const encryptedPrivateKey: string = await getStore(PLATFORM, "DATA1");
      const decryptedPrivateKey: string = await passworder.decrypt(password, encryptedPrivateKey);
      throwAlert({ signal: 81, title: "Private Key", message: `0x${decryptedPrivateKey}`, error: false });
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      throwAlert({ signal: 92, title: "Error", message: "Incorrect password", error: true });
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const validateAccount = async (address: string): Promise<boolean> => {
    const spika = await spikaClient();
    try {
      await spika.client.getAccount(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const initAccount = async (mnemonic: string): Promise<string> => {
    // Initialize Aptos Account
    const _account: aptos.AptosAccount = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, mnemonic);
    const _privateKey: string = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
    const _publicAccount: IPublicAccount = {
      publicKey: _account.pubKey().hex(),
      account: _account.address().hex(),
      authKey: _account.authKey().hex(),
    };

    // Encrypt mnemonic, private key and password
    const encryptedMnemonic = await passworder.encrypt(password, mnemonic);
    const encryptedPrivateKey = await passworder.encrypt(password, _privateKey);
    const encryptedPassword = await encryptPassword(password);

    // Initialize wallet locker
    locker("lock");

    // Local storage
    setStore(PLATFORM, "DATA0", encryptedMnemonic);
    setStore(PLATFORM, "DATA1", encryptedPrivateKey);
    setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
    setStore(PLATFORM, "accountVersion", EXTENSION_VERSION);
    setStore(PLATFORM, "currentAddress", _account.address().hex());
    setStore(PLATFORM, "currentPubAccount", _publicAccount);
    setStore(PLATFORM, "currentNetwork", network.networkList[0]);
    setStore(PLATFORM, "currentAsset", aptosCoin);
    assetStore.addAssetStore(_account.address().hex(), aptosCoin);
    network.addNetworkStore(_account.address().hex());
    apps.addAddress(_publicAccount);

    // Session storage
    setMem(PLATFORM, "PWD", encryptedPassword);

    // Save state
    setAccountImported(true);
    setSpikaWallet(true);
    setPrivateKey(_privateKey);
    setAccount(_account);
    setPublicAccount(_publicAccount);
    setCurrentAddress(_account.address().hex());
    setCurrentNetwork(network.networkList[0]);
    setCurrentAsset(aptosCoin);
    setBalance(undefined);
    setNewMnemonic("");
    setMnemonic("");

    return _publicAccount.account;
  };

  const createAccount = async (): Promise<void> => {
    try {
      const result = await initAccount(newMnemonic);
      throwAlert({ signal: 1, title: "Account created", message: `${result}`, error: false });
    } catch (error) {
      throwAlert({ signal: 2, title: "Failed create account", message: `${error}`, error: true });
      console.log(error);
    }
  };

  const importAccount = async (): Promise<void> => {
    try {
      const result = await initAccount(mnemonic);
      throwAlert({ signal: 11, title: "Account imported", message: `${result}`, error: false });
    } catch (error) {
      throwAlert({ signal: 12, title: "Failed import account", message: `${error}`, error: true });
      console.log(error);
    }
  };

  const loadAccount = async (): Promise<void> => {
    try {
      const encryptedMnemonic: string = await getStore(PLATFORM, "DATA0");
      const decryptedMnemonic: string = await passworder.decrypt(password, encryptedMnemonic);
      try {
        const _account: aptos.AptosAccount = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, decryptedMnemonic);
        const _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
        let _currentAsset: ICoin = await getStore(PLATFORM, "currentAsset");
        if (_currentAsset === undefined || _currentAsset === null) {
          setStore(PLATFORM, "currentAsset", aptosCoin);
          _currentAsset = aptosCoin;
        }
        let _currentNetwork = await getStore(PLATFORM, "currentNetwork");
        if (_currentNetwork === undefined || _currentNetwork === null) {
          setStore(PLATFORM, "currentNetwork", network.networkList[0]);
          _currentNetwork = network.networkList[0];
        }
        const _publicAccount = {
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
      } catch (error) {
        console.log(error);
        throwAlert({ signal: 42, title: "Failed to load account", message: `${error}`, error: true });
        setStore(PLATFORM, "currentNetwork", network.networkList[0]);
      }
    } catch (error) {
      console.log(error);
      throwAlert({ signal: 55, title: "Error", message: "Incorrect password", error: true });
      setPassword("");
      setOpenLoginDialog(true);
    }
  };

  const throwAlert = (args: IAlertArgs): void => {
    setAlertSignal(args.signal);
    setAlertTitle(args.title);
    setAlertMessage(args.message);
    setIsError(args.error);
  };

  const clearAlert = (): void => {
    setAlertSignal(0);
    setAlertTitle("");
    setAlertMessage("");
    setIsError(false);
  };

  const clearPasswords = (): void => {
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
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
        validateAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
