/* eslint-disable no-case-declarations */
import passworder from "@metamask/browser-passworder";
import * as bip39 from "@scure/bip39";
import * as english from "@scure/bip39/wordlists/english";
import * as aptos from "aptos";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import {
  IAccountType,
  IAlertArgs,
  ICoin,
  IContact,
  IContextAccount,
  IEncryptedPwd,
  INetwork,
  IPublicAccount,
} from "../interface";
import * as network from "../lib/accountNetworks";
import * as assetStore from "../lib/assetStore";
import { spikaClient } from "../lib/client";
import { aptosCoin } from "../lib/coin";
import * as apps from "../lib/connectedApps";
import { getContacts, initContacts } from "../lib/contacts";
import errorParser from "../lib/errorParser";
import * as nftStore from "../lib/nftStore";
import {
  getAccountName,
  getAptosAccount,
  getAptosDerivativePath,
  getKeystoneAccountByIndex,
  getSpikaAccountCurrentIndex,
  getSpikaMasterAccount,
  initSpikaMasterAccount,
} from "../lib/spikaAccount";
import { clearStore, getMem, getStore, removeMem, setMem, setStore } from "../lib/store";
import { APTOS_DERIVE_PATH, EXTENSION_VERSION, PLATFORM } from "../utils/constants";
import debug from "../utils/debug";
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
    sendNotification,
  } = useContext(UIContext);

  const [alertSignal, setAlertSignal] = useState<number>(0);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accountImported, setAccountImported] = useState<boolean>(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [newMnemonic, setNewMnemonic] = useState<string>("");
  const [privateKey, setPrivateKey] = useState<string | undefined>();
  const [currentAddress, setCurrentAddress] = useState<string | undefined>();
  const [currentAddressName, setCurrentAddressName] = useState<string | undefined>();
  const [currentAccountType, setCurrentAccountType] = useState<IAccountType | undefined>();
  const [publicAccount, setPublicAccount] = useState<IPublicAccount | undefined>();
  const [account, setAccount] = useState<aptos.AptosAccount | undefined>();
  const [contacts, setContacts] = useState<Array<IContact>>([]);
  const [currentNetwork, setCurrentNetwork] = useState<INetwork | undefined>();
  const [currentAsset, setCurrentAsset] = useState<ICoin | undefined>();
  const [accountAssets, setAccountAssets] = useState<Array<ICoin>>([]);
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
      debug.log("Account information saved:", data);
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
      setIsLoading(true);
      setAccountRoutesEnabled(false);
      await loadAccount();
      setIsLoading(false);
      setPassword("");
      locker("lock");
    } catch (error) {
      setOpenLoginDialog(false);
      throwAlert({
        signal: 62,
        title: "Failed to load account",
        message: `${errorParser(error, "Error occured while loading account.")}`,
        error: true,
      });
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
    debug.log("Wallet locked.");
  };

  const handleChangePassword = async (): Promise<void> => {
    const data: IEncryptedPwd = await getMem(PLATFORM, "PWD");
    const oldPassword: string = await decryptPassword(data);
    if (oldPassword === password) {
      if (newPassword === password) {
        debug.log("New password shall not be the same as old.");
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
        debug.log("Password field cannot be empty.");
        throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty", error: true });
        clearPasswords();
      } else if (newPassword !== confirmPassword) {
        debug.log("Passwords do not match.");
        throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match", error: true });
        clearPasswords();
      } else if (newPassword.length < 6) {
        debug.log("Password must be at least 6 characters long.");
        throwAlert({
          signal: 54,
          title: "Incorrect password",
          message: "Password must be at least 6 characters long.",
          error: true,
        });
        clearPasswords();
      }
    } else {
      debug.log("Current password is wrong.");
      throwAlert({ signal: 57, title: "Incorrect password", message: "Current password is wrong.", error: true });
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
      debug.log("Password successfully changed.");
      throwAlert({ signal: 56, title: "Success", message: "Password successfully changed.", error: false });
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
      debug.log("Password field cannot be empty.");
      throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty.", error: true });
      clearPasswords();
    } else if (password !== confirmPassword) {
      debug.log("Passwords do not match.");
      throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match.", error: true });
      clearPasswords();
    } else if (password.length < 6) {
      debug.log("Password must be at least 6 characters long.");
      throwAlert({
        signal: 54,
        title: "Incorrect password",
        message: "Password must be at least 6 characters long.",
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
      debug.log("Password field cannot be empty.");
      throwAlert({ signal: 52, title: "Incorrect password", message: "Password field cannot be empty.", error: true });
      clearPasswords();
    } else if (password !== confirmPassword) {
      debug.log("Passwords do not match.");
      throwAlert({ signal: 53, title: "Incorrect password", message: "Passwords do not match.", error: true });
      clearPasswords();
    } else if (password.length < 6) {
      debug.log("Password must be at least 6 characters long.");
      throwAlert({
        signal: 54,
        title: "Incorrect password",
        message: "Password must be at least 6 characters long.",
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
      debug.log("Opening recovery phrase Dialog...");
      throwAlert({ signal: 91, title: "Secret Recovery Phrase", message: decryptedMnemonic, error: false });
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      debug.log("Incorrect password.");
      throwAlert({ signal: 92, title: "Error", message: "Incorrect password.", error: true });
      setPassword("");
      setMnemonicRequired(false);
      setOpenLoginDialog(false);
    }
  };

  const handleRevealPrivateKey = async (): Promise<void> => {
    try {
      const encryptedPrivateKey: string = await getStore(PLATFORM, "DATA1");
      const decryptedPrivateKey: string = await passworder.decrypt(password, encryptedPrivateKey);
      debug.log("Opening private key Dialog...");
      throwAlert({ signal: 81, title: "Private Key", message: `0x${decryptedPrivateKey}`, error: false });
      setPassword("");
      setPrivateKeyRequired(false);
      setOpenLoginDialog(false);
    } catch (error) {
      debug.log("Incorrect password.");
      throwAlert({ signal: 92, title: "Error", message: "Incorrect password.", error: true });
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
      debug.log("Address not found on chain:", address);
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
      address: _account.address().hex(),
    };
    debug.log("Account initialized:", _publicAccount.account);

    // Encrypt mnemonic, private key and password
    const encryptedMnemonic = await passworder.encrypt(password, mnemonic);
    const encryptedPrivateKey = await passworder.encrypt(password, _privateKey);
    const encryptedPassword = await encryptPassword(password);
    debug.log("Data encrypted.");

    // Initialize wallet locker
    locker("lock");
    debug.log("Wallet locker initialized.");

    // Initialize Master Account
    await initSpikaMasterAccount(_publicAccount);
    const _currentAddressName: string = await getAccountName(_account.address().hex());

    // Local storage
    setStore(PLATFORM, "DATA0", encryptedMnemonic);
    setStore(PLATFORM, "DATA1", encryptedPrivateKey);
    setStore(PLATFORM, "ACCOUNT_IMPORTED", true);
    setStore(PLATFORM, "accountVersion", EXTENSION_VERSION);
    setStore(PLATFORM, "currentAddress", _account.address().hex());
    setStore(PLATFORM, "currentAddressName", _currentAddressName);
    setStore(PLATFORM, "currentAccountType", "master");
    setStore(PLATFORM, "currentPubAccount", _publicAccount);
    setStore(PLATFORM, "currentNetwork", network.networkList[0]);
    setStore(PLATFORM, "currentAsset", aptosCoin);

    await initContacts();
    await assetStore.addAssetStore(_account.address().hex(), aptosCoin);
    await nftStore.addNftStore(_account.address().hex());
    await network.addNetworkStore(_account.address().hex());

    apps.addAddress(_publicAccount);
    debug.log("Data saved to local storage.");

    // Session storage
    setMem(PLATFORM, "PWD", encryptedPassword);
    debug.log("Data saved to session storage.");

    // Save state
    setAccountImported(true);
    setSpikaWallet(true);
    setPrivateKey(_privateKey);
    setAccount(_account);
    setPublicAccount(_publicAccount);
    setCurrentAddress(_account.address().hex());
    setCurrentAddressName(_currentAddressName);
    setCurrentAccountType("master");
    setCurrentNetwork(network.networkList[0]);
    setCurrentAsset(aptosCoin);
    setBalance(undefined);
    setNewMnemonic("");
    setMnemonic("");
    debug.log("State initialized.");

    return _publicAccount.account;
  };

  const createAccount = async (): Promise<void> => {
    try {
      const validatedMnemonic = bip39.validateMnemonic(newMnemonic, english.wordlist);

      if (!validatedMnemonic) {
        throwAlert({
          signal: 3,
          title: "Invalid mnemonic",
          message: "Recovery phrase provided is not valid.",
          error: true,
        });
        return;
      }
      const result = await initAccount(newMnemonic);
      debug.log("Account created:", result);
      throwAlert({ signal: 1, title: "Success", message: "Account successfully created!", error: false });
    } catch (error) {
      throwAlert({
        signal: 2,
        title: "Failed to create account",
        message: `${errorParser(error, "Error occured while creating account.")}`,
        error: true,
      });
      console.log(error);
    }
  };

  const importAccount = async (): Promise<void> => {
    try {
      const validatedMnemonic = bip39.validateMnemonic(mnemonic, english.wordlist);

      if (!validatedMnemonic) {
        throwAlert({
          signal: 3,
          title: "Invalid mnemonic",
          message: "Recovery phrase provided is not valid.",
          error: true,
        });
        return;
      }
      const result = await initAccount(mnemonic);
      debug.log("Account imported:", result);
      throwAlert({ signal: 11, title: "Success", message: "Account successfully imported!", error: false });
    } catch (error) {
      throwAlert({
        signal: 12,
        title: "Failed import account",
        message: `${errorParser(error, "Error occured while importing account.")}`,
        error: true,
      });
      console.log(error);
    }
  };

  const loadAccount = async (): Promise<void> => {
    try {
      const encryptedMnemonic: string = await getStore(PLATFORM, "DATA0");
      const decryptedMnemonic: string = await passworder.decrypt(password, encryptedMnemonic);
      await initContacts();
      debug.log("Data encrypted.");

      try {
        let _accountType: IAccountType = await getStore(PLATFORM, "currentAccountType");
        if (!_accountType) {
          _accountType = "master";
        }
        let _account: aptos.AptosAccount | undefined;
        let _privateKey: string;
        let _currentAddress: string;
        let _currentAddressName: string;
        let _publicAccount: IPublicAccount;
        let _currentAsset: ICoin;
        let _currentNetwork: INetwork;

        switch (_accountType) {
          case "master":
            const spikaMasterAccount = await getSpikaMasterAccount();
            if (!spikaMasterAccount) {
              _account = aptos.AptosAccount.fromDerivePath(APTOS_DERIVE_PATH, decryptedMnemonic);
            } else {
              const _accountFromStorage = await getStore(PLATFORM, "currentAddress");
              const index = await getSpikaAccountCurrentIndex(_accountFromStorage);
              const derivativePath = getAptosDerivativePath(index);
              _account = aptos.AptosAccount.fromDerivePath(derivativePath, decryptedMnemonic);
            }
            _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
            _currentAddress = _account.address().hex();
            _currentAsset = await getStore(PLATFORM, "currentAsset");
            if (_currentAsset === undefined || _currentAsset === null) {
              _currentAsset = aptosCoin;
            }
            _currentNetwork = await getStore(PLATFORM, "currentNetwork");
            if (_currentNetwork === undefined || _currentNetwork === null) {
              _currentNetwork = network.networkList[0];
            }
            _publicAccount = {
              publicKey: _account.pubKey().hex(),
              account: _account.address().hex(),
              authKey: _account.authKey().hex(),
              address: _account.address().hex(),
            };
            if (!spikaMasterAccount) await initSpikaMasterAccount(_publicAccount);
            _currentAddressName = await getAccountName(_currentAddress);
            break;

          case "hardware":
            _privateKey = "NOT_AVAILABLE";
            _currentAddress = await getStore(PLATFORM, "currentAddress");
            _account = undefined;
            _currentAddressName = await getStore(PLATFORM, "currentAddressName");
            _publicAccount = {
              publicKey: "NOT_AVAILABLE",
              account: _currentAddress,
              authKey: _currentAddress,
              address: _currentAddress,
            };
            _currentAsset = await getStore(PLATFORM, "currentAsset");
            if (_currentAsset === undefined || _currentAsset === null) {
              _currentAsset = aptosCoin;
            }
            _currentNetwork = await getStore(PLATFORM, "currentNetwork");
            if (_currentNetwork === undefined || _currentNetwork === null) {
              _currentNetwork = network.networkList[0];
            }
            break;
        }

        const _contacts: Array<IContact> = await getContacts();
        _contacts.sort((a: IContact, b: IContact) => a.name.localeCompare(b.name));

        // Storage.
        await assetStore.addAssetStore(_currentAddress, aptosCoin);
        await nftStore.addNftStore(_currentAddress);
        await network.addNetworkStore(_currentAddress);
        await apps.addAddress(_publicAccount);
        setStore(PLATFORM, "currentAddress", _currentAddress);
        setStore(PLATFORM, "currentAddressName", _currentAddressName);
        setStore(PLATFORM, "currentAccountType", _accountType);
        setStore(PLATFORM, "currentPubAccount", _publicAccount);
        setStore(PLATFORM, "currentAsset", _currentAsset);
        setStore(PLATFORM, "currentNetwork", _currentNetwork);
        const encryptedPassword = await encryptPassword(password);
        setMem(PLATFORM, "PWD", encryptedPassword);

        // State.
        setAccountImported(true);
        setPrivateKey(_privateKey);
        setAccount(_account);
        setPublicAccount(_publicAccount);
        setCurrentAddress(_currentAddress);
        setCurrentAddressName(_currentAddressName);
        setCurrentAccountType(_accountType);
        setCurrentAsset(_currentAsset);
        setCurrentNetwork(_currentNetwork);
        setContacts(_contacts);

        // Close loging dialog on successfull login.
        setOpenLoginDialog(false);

        debug.log("Local storage, session storage, state updated.");
      } catch (error) {
        console.log(error);
        debug.log("Failed to load account.");
        sendNotification({ message: "Test" });
        throwAlert({
          signal: 42,
          title: "Failed to load account",
          message: `${errorParser(error, "Error occured while loading account.")}`,
          error: true,
        });
        setStore(PLATFORM, "currentNetwork", network.networkList[0]);
      }
    } catch (error) {
      console.log(error);
      debug.log("Incorrect password.");
      throwAlert({ signal: 55, title: "Error", message: "Incorrect password.", error: true });
      setPassword("");
      setOpenLoginDialog(true);
    }
  };

  const switchAccount = async (index: number, type?: IAccountType): Promise<void> => {
    try {
      if (type) {
        const data: IEncryptedPwd = await getMem(PLATFORM, "PWD");
        const pwd: string = await decryptPassword(data);
        switch (type) {
          case "hardware":
            const _privateKey = "NOT_AVAILABLE";
            const _encryptedPrivateKey = await passworder.encrypt(pwd, _privateKey);
            const _exAccount = await getKeystoneAccountByIndex(index);
            const _account = undefined;
            const _currentAddress = _exAccount.account;
            const _currentAddressName = _exAccount.name;
            const _publicAccount = {
              publicKey: "NOT_AVAILABLE",
              account: _exAccount.account,
              authKey: _exAccount.account,
              address: _exAccount.account,
            };
            const _currentAsset = aptosCoin;

            // Storage.
            await assetStore.addAssetStore(_currentAddress, aptosCoin);
            await nftStore.addNftStore(_currentAddress);
            await network.addNetworkStore(_currentAddress);
            await apps.addAddress(_publicAccount);
            setStore(PLATFORM, "currentAsset", _currentAsset);
            setStore(PLATFORM, "DATA1", _encryptedPrivateKey);
            setStore(PLATFORM, "currentAddress", _currentAddress);
            setStore(PLATFORM, "currentAddressName", _currentAddressName);
            setStore(PLATFORM, "currentAccountType", type);
            setStore(PLATFORM, "currentPubAccount", _publicAccount);

            // State.
            setPrivateKey(_privateKey);
            setAccount(_account);
            setPublicAccount(_publicAccount);
            setCurrentAddress(_currentAddress);
            setCurrentAddressName(_currentAddressName);
            setCurrentAccountType(type);
            setCurrentAsset(_currentAsset);
            debug.log("Local storage, session storage, state updated.");
        }
      } else {
        const data: IEncryptedPwd = await getMem(PLATFORM, "PWD");
        const pwd: string = await decryptPassword(data);
        const _account: aptos.AptosAccount = await getAptosAccount(index);
        const _privateKey = Buffer.from(_account.signingKey.secretKey).toString("hex").slice(0, 64);
        const _encryptedPrivateKey = await passworder.encrypt(pwd, _privateKey);
        const _currentAsset = aptosCoin;
        setStore(PLATFORM, "currentAsset", aptosCoin);
        const _publicAccount = {
          publicKey: _account.pubKey().hex(),
          account: _account.address().hex(),
          authKey: _account.authKey().hex(),
          address: _account.address().hex(),
        };
        const _currentAddressName: string = await getAccountName(_account.address().hex());
        await assetStore.addAssetStore(_account.address().hex(), aptosCoin);
        await nftStore.addNftStore(_account.address().hex());
        await network.addNetworkStore(_account.address().hex());
        await apps.addAddress(_publicAccount);
        setStore(PLATFORM, "DATA1", _encryptedPrivateKey);
        setStore(PLATFORM, "currentAddress", _account.address().hex());
        setStore(PLATFORM, "currentAddressName", _currentAddressName);
        setStore(PLATFORM, "currentAccountType", "master");
        setStore(PLATFORM, "currentPubAccount", _publicAccount);
        setPrivateKey(_privateKey);
        setAccount(_account);
        setPublicAccount(_publicAccount);
        setCurrentAddress(_account.address().hex());
        setCurrentAddressName(_currentAddressName);
        setCurrentAccountType("master");
        setCurrentAsset(_currentAsset);
        debug.log("Local storage, session storage, state updated.");
      }
    } catch (error) {
      console.log(error);
      debug.log("Failed to switch account.");
      throwAlert({
        signal: 43,
        title: "Failed to switch account",
        message: `${errorParser(error, "Error occured while swithing between accounts.")}`,
        error: true,
      });
    }
  };

  const throwAlert = (args: IAlertArgs): void => {
    setAlertSignal(args.signal);
    setAlertTitle(args.title);
    setAlertMessage(args.message);
    setIsError(args.error);
    debug.log(`Sending ${args.error ? "error" : "alert"} ${args.signal}:`, args.title);
  };

  const clearAlert = (): void => {
    setAlertSignal(0);
    setAlertTitle("");
    setAlertMessage("");
    setIsError(false);
    debug.log("Alert cleared.");
  };

  const clearPasswords = (): void => {
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    debug.log("Passwords cleared.");
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
        currentAddressName,
        setCurrentAddressName,
        currentAccountType,
        setCurrentAccountType,
        currentAsset,
        accountAssets,
        setAccountAssets,
        setCurrentAsset,
        contacts,
        setContacts,
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
        switchAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
