/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CryptoMultiAccounts } from "@keystonehq/bc-ur-registry-aptos";
import passworder from "@metamask/browser-passworder";
import { AptosAccount } from "aptos";
import { IEncryptedPwd, IKeystoneAccount, IPublicAccount, ISpikaAccount, ISpikaMasterAccount, IUR } from "../interface";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";
import { decryptPassword } from "../utils/pwd";
import { getMem, getStore, setStore } from "./store";

const _spikaMasterAccount = "spikaMasterAccount";
const _encryptedMnemonic = "DATA0";
const _PWD = "PWD";

const getMnemonic = async (): Promise<string> => {
  const encryptedPassword: IEncryptedPwd = await getMem(PLATFORM, _PWD);
  const pwd: string = await decryptPassword(encryptedPassword);
  const encryptedMnemonic: string = await getStore(PLATFORM, _encryptedMnemonic);
  return await passworder.decrypt(pwd, encryptedMnemonic);
};

export const getAptosDerivativePath = (i: number): string => {
  return `m/44'/637'/${i}'/0'/0'`;
};

export const initSpikaMasterAccount = async (publicAccount: IPublicAccount): Promise<void> => {
  const spikaAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data = [];
  const index = 0;
  const account: ISpikaAccount = {
    index: index,
    name: `Account${index + 1}`,
    data: publicAccount,
  };
  data.push(account);
  const result: ISpikaMasterAccount = {
    master: data,
    latest: index + 1,
  };
  if (!spikaAccount) {
    setStore(PLATFORM, _spikaMasterAccount, result);
    debug.log("Master account successfully initialized.");
  } else if (spikaAccount.master[0].data.account !== publicAccount.account) {
    setStore(PLATFORM, _spikaMasterAccount, result);
    debug.log("Address missmatch. Master account recreated.");
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
  const spikaMasterAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data: Array<ISpikaAccount> = spikaMasterAccount.master;
  const result = data.find((account: ISpikaAccount) => account.data.account === currentAddress);
  return result!.index;
};

export const getSpikaMasterAccount = async (): Promise<ISpikaMasterAccount> => {
  return await getStore(PLATFORM, _spikaMasterAccount);
};

export const addSpikaAccount = async (): Promise<ISpikaMasterAccount> => {
  const index = await getSpikaAccountIndex();
  const latest = index + 1;
  const mnemonic = await getMnemonic();
  const derivativePath: string = getAptosDerivativePath(index);
  const account = AptosAccount.fromDerivePath(derivativePath, mnemonic);
  const publicAccount: IPublicAccount = {
    publicKey: account.pubKey().hex(),
    account: account.address().hex(),
    authKey: account.authKey().hex(),
    address: account.address().hex(),
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
  const derivativePath: string = getAptosDerivativePath(index);
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
  let result: ISpikaMasterAccount;
  if (spikaMasterAccount.keystone !== undefined) {
    result = {
      master: data,
      keystone: spikaMasterAccount.keystone,
      latest: spikaMasterAccount.latest,
    };
  } else {
    result = {
      master: data,
      latest: spikaMasterAccount.latest,
    };
  }
  setStore(PLATFORM, _spikaMasterAccount, result);
  return result;
};

export const getAccountName = async (currentAddress: string): Promise<string> => {
  const spikaMasterAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data: Array<ISpikaAccount> = spikaMasterAccount.master;
  const account = data.find((i: ISpikaAccount) => i.data.account === currentAddress);
  return account!.name;
};

// Decodes crypto-multi-accounts cbor and reads accounts from Keystone device.
export const getKeystoneAccounts = async (ur: IUR): Promise<IKeystoneAccount[]> => {
  const data = CryptoMultiAccounts.fromCBOR(Buffer.from(ur.cbor, "hex"));
  const keyring = data.getKeys();
  const result = keyring.map((account, index) => ({
    hdPath: account.getOrigin().getPath(),
    name: `Keystone${index + 1}`,
    account: `0x${account.getKey().toString("hex")}`,
    index,
    device: "keystone",
  }));
  return result;
};

// Compare accounts stored in local storage against accounts stored in Keystone device.
// Returns array of addresses that are not yet imported.
export const getNotImportedKeystoneAccounts = async (ur: IUR): Promise<IKeystoneAccount[] | undefined> => {
  const spikaMasterAccount = await getSpikaMasterAccount();
  const keystoneAccounts = await getKeystoneAccounts(ur);
  let importedAccounts: IKeystoneAccount[];
  if (spikaMasterAccount.keystone !== undefined) {
    importedAccounts = spikaMasterAccount.keystone;
    const result = keystoneAccounts.filter((x: IKeystoneAccount) => {
      return !importedAccounts.find((y: IKeystoneAccount) => {
        return x.account == y.account;
      });
    });
    return result;
  } else {
    return keystoneAccounts;
  }
};

// Saves single Keystone account object from Keystone device to spikaMasterAccount.
export const importKeystoneAccount = async (account: IKeystoneAccount): Promise<void> => {
  const spikaMasterAccount = await getSpikaMasterAccount();
  if (spikaMasterAccount.keystone !== undefined) {
    spikaMasterAccount.keystone.push(account);
    setStore(PLATFORM, _spikaMasterAccount, spikaMasterAccount);
  } else {
    const result: ISpikaMasterAccount = {
      master: spikaMasterAccount.master,
      keystone: [account],
      latest: spikaMasterAccount.latest,
    };
    setStore(PLATFORM, _spikaMasterAccount, result);
  }
};

export const getKeystoneAccountsFromMasterAccount = async (): Promise<IKeystoneAccount[] | undefined> => {
  const spikaMasterAccount = await getSpikaMasterAccount();
  if (spikaMasterAccount.keystone !== undefined) {
    return spikaMasterAccount.keystone;
  } else {
    return undefined;
  }
};

export const renameKeystoneAccount = async (
  accountName: string,
  accountIndex: number
): Promise<ISpikaMasterAccount> => {
  const spikaMasterAccount: ISpikaMasterAccount = await getStore(PLATFORM, _spikaMasterAccount);
  const data: Array<IKeystoneAccount> = spikaMasterAccount.keystone!;
  const account = data.find((i: IKeystoneAccount) => i.index === accountIndex);
  const renamedAccount: IKeystoneAccount = {
    hdPath: account!.hdPath,
    account: account!.account,
    index: account!.index,
    name: accountName,
    device: "keystone",
  };
  const findAndReplace = data.findIndex((account) => account.index == renamedAccount.index);
  data[findAndReplace] = renamedAccount;
  const result: ISpikaMasterAccount = {
    master: spikaMasterAccount.master,
    keystone: data,
    latest: spikaMasterAccount.latest,
  };
  setStore(PLATFORM, _spikaMasterAccount, result);
  return result;
};

export const getKeystoneAccountByIndex = async (index: number): Promise<IKeystoneAccount> => {
  const data = await getKeystoneAccountsFromMasterAccount();
  return data!.find((i: IKeystoneAccount) => i.index === index)!;
};
