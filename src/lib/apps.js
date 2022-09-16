import { PLATFORM } from "../utils/constants";
import { setStore, getStore } from "./store";

const _connectedApps = "connectedApps";

export const addAddress = async (publicAccount) => {
  if (PLATFORM === "chrome-extension:") {
    const connectedApps = await getStore(PLATFORM, _connectedApps);
    if (!connectedApps) {
      setStore(PLATFORM, _connectedApps, [
        {
          publicAccount: publicAccount,
          urls: [],
        },
      ]);
    } else {
      let data = connectedApps.find((i) => i.publicAccount.account === publicAccount.account);
      if (!data) {
        connectedApps.push({ publicAccount: publicAccount, urls: [] });
        setStore(PLATFORM, _connectedApps, connectedApps);
      }
    }
  }
};

export const getConnectedApps = async (publicAccount) => {
  try {
    const data = await getStore(PLATFORM, _connectedApps);
    if (data !== undefined || data !== null) {
      let result = data.find((i) => i.publicAccount.account === publicAccount.account);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const setApp = async (publicAccount, url) => {
  if (publicAccount && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          let app = result.urls.find((i) => i === url);
          if (app === undefined) {
            result.urls.push(url);
            setStore(PLATFORM, _connectedApps, data);
            return true;
          } else {
            return false;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const getApp = async (publicAccount, url) => {
  if (publicAccount && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          let app = result.urls.find((i) => i === url);
          if (app === undefined) {
            return false;
          } else {
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};

export const removeApp = async (publicAccount, url) => {
  if (publicAccount && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          let app = result.urls.find((i) => i === url);
          if (app === undefined) {
            return false;
          } else {
            let index = result.urls.indexOf(url);
            result.urls.splice(index, 1);
            setStore(PLATFORM, _connectedApps, data);
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    return false;
  }
};
