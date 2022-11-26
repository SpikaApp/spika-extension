import { setStore, getStore, removeStore, removeMem } from "../lib/store";
import { PLATFORM, EXTENSION_VERSION } from "./constants";
import { compare } from "compare-versions";

const _accountVersion = "accountVersion";
const _currentAsset = "currentAsset";
const _accountAssets = "accountAssets";
const _connectedApps = "connectedApps";
const _currentNetwork = "currentNetwork";
const _accountNetworks = "accountNetworks";
const _pwd = "PWD";

let version: string;

const applyUpdate = async (): Promise<void> => {
  await getVersion();
  if (version) {
    await v0_4_0();
    await v0_4_5();
    await v0_4_14();
    await v0_4_30();
    await v0_4_34();
    await v0_5_4();
  }
};

const getVersion = async (): Promise<string> => {
  return await getStore(PLATFORM, _accountVersion);
};

const setVersion = async (): Promise<void> => {
  setStore(PLATFORM, _accountVersion, EXTENSION_VERSION);
};

const logUpdate = (update: string): void => {
  console.log(`Spika update v${update} applied.`);
};

const pendingUpdate = (version: string, currentUpdate: string): boolean => {
  return compare(version, currentUpdate, "<");
};

const v0_4_0 = async (): Promise<void> => {
  const currentUpdate = "0.4.0";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeStore(PLATFORM, _currentAsset);
    removeStore(PLATFORM, _accountAssets);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_5 = async (): Promise<void> => {
  const currentUpdate = "0.4.5";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeMem(PLATFORM, _pwd);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_14 = async (): Promise<void> => {
  const currentUpdate = "0.4.14";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeStore(PLATFORM, _connectedApps);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_30 = async (): Promise<void> => {
  const currentUpdate = "0.4.30";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeStore(PLATFORM, _currentNetwork);
    removeStore(PLATFORM, _accountNetworks);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_34 = async (): Promise<void> => {
  const currentUpdate = "0.4.34";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeMem(PLATFORM, _pwd);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_5_4 = async (): Promise<void> => {
  const currentUpdate = "0.5.4";
  const required: boolean = pendingUpdate(version, currentUpdate);
  if (required) {
    removeMem(PLATFORM, _pwd);
    setVersion();
    logUpdate(currentUpdate);
  }
};

export default applyUpdate;
