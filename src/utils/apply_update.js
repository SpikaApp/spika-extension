import { setStore, getStore, removeStore, removeMem } from "../lib/store";
import { PLATFORM, EXTENSION_VERSION } from "../utils/constants";
import { compare } from "compare-versions";

const _accountVersion = "accountVersion";
const _currentAsset = "currentAsset";
const _accountAssets = "accountAssets";
const _connectedApps = "connectedApps";
const _pwd = "PWD";

let version;

const applyUpdate = async () => {
  await getVersion();
  if (version) {
    await v0_4_0();
    await v0_4_5();
    await v0_4_14();
  }
};

const getVersion = async () => {
  version = await getStore(PLATFORM, _accountVersion);
  return version;
};

const setVersion = async () => {
  setStore(PLATFORM, _accountVersion, EXTENSION_VERSION);
};

const logUpdate = (update) => {
  console.log(`Spika update v${update} applied.`);
};

const pendingUpdate = (version, currentUpdate) => {
  return compare(version, currentUpdate, "<");
};

const v0_4_0 = async () => {
  const currentUpdate = "0.4.0";
  const required = pendingUpdate(version, currentUpdate);
  if (required) {
    removeStore(PLATFORM, _currentAsset);
    removeStore(PLATFORM, _accountAssets);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_5 = async () => {
  const currentUpdate = "0.4.5";
  const required = pendingUpdate(version, currentUpdate);
  if (required) {
    removeMem(PLATFORM, _pwd);
    setVersion();
    logUpdate(currentUpdate);
  }
};

const v0_4_14 = async () => {
  const currentUpdate = "0.4.14";
  const required = pendingUpdate(version, currentUpdate);
  if (required) {
    removeStore(PLATFORM, _connectedApps);
    setVersion();
    logUpdate(currentUpdate);
  }
};

export default applyUpdate;
