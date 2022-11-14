import { AptosAccount } from "aptos";
import React from "react";
import { ICoin, INetwork, IPublicAccount } from "./";

interface IContextAccount {
  alertSignal: number;
  setAlertSignal: React.Dispatch<React.SetStateAction<number>>;
  alertTitle: string;
  setAlertTitle: React.Dispatch<React.SetStateAction<string>>;
  alertMessage: string;
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  accountImported: boolean;
  setAccountImported: React.Dispatch<React.SetStateAction<boolean>>;
  mnemonic: string;
  newMnemonic: string;
  setNewMnemonic: React.Dispatch<React.SetStateAction<string>>;
  setMnemonic: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  clearPasswords: () => void;
  account: AptosAccount | undefined;
  privateKey: string | undefined;
  currentAddress: string | undefined;
  publicAccount: IPublicAccount | undefined;
  currentNetwork: INetwork | undefined;
  setCurrentNetwork: React.Dispatch<React.SetStateAction<INetwork | undefined>>;
  currentAsset: ICoin | undefined;
  setCurrentAsset: React.Dispatch<React.SetStateAction<ICoin | undefined>>;
  baseCoin: ICoin;
  setBaseCoin: React.Dispatch<React.SetStateAction<ICoin>>;
  quoteCoin: ICoin;
  setQuoteCoin: React.Dispatch<React.SetStateAction<ICoin>>;
  accountAssets: Array<ICoin>;
  setAccountAssets: React.Dispatch<React.SetStateAction<Array<ICoin>>>;
  swapSupportedAssets: Array<ICoin>;
  setSwapSupportedAssets: React.Dispatch<React.SetStateAction<Array<ICoin>>>;
  balance: string | undefined;
  setBalance: React.Dispatch<React.SetStateAction<string | undefined>>;
  handleChangePassword: () => void;
  handleGenerate: () => void;
  handleCreate: () => Promise<void>;
  handleImport: () => Promise<void>;
  handleLogout: () => void;
  handleLock: () => void;
  handleLogin: () => Promise<void>;
  handleRevealMnemonic: () => Promise<void>;
  handleRevealPrivateKey: () => Promise<void>;
  validateAccount: (address: string) => Promise<boolean>;
  throwAlert: (args: IAlertArgs) => void;
  clearAlert: () => void;
}

export interface IAlertArgs {
  signal: number;
  title: string;
  message: string;
  error: boolean;
}

export default IContextAccount;
