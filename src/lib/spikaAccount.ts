/* eslint-disable @typescript-eslint/no-non-null-assertion */
import passworder from "@metamask/browser-passworder";
import { AptosAccount } from "aptos";
import { IEncryptedPwd, IPublicAccount, ISpikaAccount, ISpikaMasterAccount } from "../interface";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";
import { decryptPassword } from "../utils/pwd";
import { getMem, getStore, setStore } from "./store";

const _spikaMasterAccount = "spikaMasterAccount";
const _encryptedMnemonic = "DATA0";
const _PWD = "PWD";

const aptosDerivativePath = (i: number): string => {
  return `m/44'/637'/${i}'/0'/0'`;
};

const getMnemonic = async (): Promise<string> => {
  const encryptedPassword: IEncryptedPwd = await getMem(PLATFORM, _PWD);
  const pwd: string = await decryptPassword(encryptedPassword);
  const encryptedMnemonic: string = await getStore(PLATFORM, _encryptedMnemonic);
  return await passworder.decrypt(pwd, encryptedMnemonic);
};

export const initSpikaMasterAccount = async (publicAccount: IPublicAccount): Promise<void> => {
  const spikaAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  if (!spikaAccount) {
    const data = [];
    const index = 0;
    const account: ISpikaAccount = {
      index: index,
      name: `Account${index + 1}`,
      data: publicAccount,
    };
    data.push(account);
    debug.log("Data:", data);

    const result: ISpikaMasterAccount = {
      master: data,
      latest: index + 1,
    };
    debug.log("Result:", result);
    setStore(PLATFORM, _spikaMasterAccount, result);
    debug.log("Master account successfully initialized.");
  } else {
    debug.log("Master account found in storage.");
  }
};

export const getSpikaAccountIndex = async (): Promise<number> => {
  const data: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const result = data.latest;
  debug.log("Last derivative index:", result);
  return result;
};

export const getSpikaAccountCurrentIndex = async (currentAddress: string): Promise<number> => {
  const data: Array<ISpikaAccount> = await getStore(PLATFORM, _spikaMasterAccount).master;
  const current = data.find((account: ISpikaAccount) => account.data.account === currentAddress);
  return current!.index;
};

export const getSpikaMasterAccount = async (): Promise<ISpikaMasterAccount> => {
  return await getStore(PLATFORM, _spikaMasterAccount);
};

export const addSpikaAccount = async (): Promise<ISpikaMasterAccount> => {
  const index = await getSpikaAccountIndex();
  const latest = index + 1;
  const mnemonic = await getMnemonic();
  const derivativePath: string = aptosDerivativePath(index);
  const account = AptosAccount.fromDerivePath(derivativePath, mnemonic);
  const publicAccount: IPublicAccount = {
    publicKey: account.pubKey().hex(),
    account: account.address().hex(),
    authKey: account.authKey().hex(),
  };
  let spikaMasterAccount = await getSpikaMasterAccount();
  const data: Array<ISpikaAccount> = spikaMasterAccount.master;
  const newAccount: ISpikaAccount = {
    index: index,
    name: `Account${index + 1}`,
    data: publicAccount,
  };
  data.push(newAccount);
  spikaMasterAccount = {
    master: data,
    latest: latest,
  };
  setStore(PLATFORM, _spikaMasterAccount, spikaMasterAccount);
  return spikaMasterAccount;
};

// Returns full AptosAccount object
export const getAptosAccount = async (index: number): Promise<AptosAccount> => {
  const mnemonic = await getMnemonic();
  const derivativePath: string = aptosDerivativePath(index);
  const result = AptosAccount.fromDerivePath(derivativePath, mnemonic);
  return result;
};

export const renameAccount = async (accountName: string, accountIndex: number): Promise<ISpikaMasterAccount> => {
  const spikaMasterAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data: Array<ISpikaAccount> = spikaMasterAccount.master;
  const account = data.find((i: ISpikaAccount) => i.index === accountIndex);
  const renamedAccount: ISpikaAccount = {
    name: accountName,
    index: account!.index,
    data: account!.data,
  };
  const findAndReplace = data.findIndex((account) => account.index == renamedAccount.index);
  data[findAndReplace] = renamedAccount;
  const result: ISpikaMasterAccount = {
    master: data,
    latest: spikaMasterAccount.latest,
  };
  setStore(PLATFORM, _spikaMasterAccount, result);
  return result;
};

export const getAccountName = async (currentAddress: string): Promise<string> => {
  const spikaMasterAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data: Array<ISpikaAccount> = spikaMasterAccount.master;
  const account = data.find((i: ISpikaAccount) => i.data.account === currentAddress);
  return account!.name;
};
