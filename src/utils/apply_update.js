import { setStore, getStore, removeStore } from "../lib/store";
import { PLATFORM, EXTENSION_VERSION } from "../utils/constants";

let version;
const _accountVersion = "accountVersion";
const _currentAsset = "currentAsset";
const _accountAssets = "accountAssets";

const applyUpdate = async () => {
  await getVersion();
  await v0_4_0();
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

// uptdate from v0.3.x to 0.4.x
const v0_4_0 = async () => {
  const currentUpdate = "0.4.0";
  if (version !== EXTENSION_VERSION) {
    removeStore(PLATFORM, _currentAsset);
    removeStore(PLATFORM, _accountAssets);
    setVersion();
    logUpdate(currentUpdate);
  }
};

export default applyUpdate;
