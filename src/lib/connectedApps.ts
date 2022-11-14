import { IPublicAccount, IConnectedApps } from "../interface";
import { PLATFORM } from "../utils/constants";
import { setStore, getStore } from "./store";

const _connectedApps = "connectedApps";

export const addAddress = async (publicAccount: IPublicAccount): Promise<void> => {
  if (PLATFORM === "chrome-extension:") {
    const connectedApps: Array<IConnectedApps> = await getStore(PLATFORM, _connectedApps);
    if (!connectedApps) {
      const data: Array<IConnectedApps> = [
        {
          publicAccount: publicAccount,
          urls: [],
        },
      ];
      setStore(PLATFORM, _connectedApps, data);
    } else {
      const data = connectedApps.find((i: IConnectedApps) => i.publicAccount.account === publicAccount.account);
      if (!data) {
        connectedApps.push({ publicAccount: publicAccount, urls: [] });
        setStore(PLATFORM, _connectedApps, connectedApps);
      }
    }
  }
};

export const getConnectedApps = async (publicAccount: IPublicAccount): Promise<IConnectedApps | undefined> => {
  try {
    const data: Array<IConnectedApps> = await getStore(PLATFORM, _connectedApps);
    if (data !== undefined || data !== null) {
      return data.find((i: IConnectedApps) => i.publicAccount.account === publicAccount.account);
    }
  } catch (error) {
    console.log(error);
  }
};

export const setApp = async (publicAccount: IPublicAccount, url: string): Promise<boolean | undefined> => {
  if (publicAccount && url) {
    try {
      const data: Array<IConnectedApps> = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        const result = data.find((i: IConnectedApps) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          const app = result.urls.find((i) => i === url);
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

export const getApp = async (publicAccount: IPublicAccount, url: string): Promise<boolean | undefined> => {
  if (publicAccount && url) {
    try {
      const data: Array<IConnectedApps> = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        const result = data.find((i: IConnectedApps) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          const app = result.urls.find((i: string) => i === url);
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

export const removeApp = async (publicAccount: IPublicAccount, url: string): Promise<boolean | undefined> => {
  if (publicAccount && url) {
    try {
      const data: Array<IConnectedApps> = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        const result = data.find((i: IConnectedApps) => i.publicAccount.account === publicAccount.account);
        if (result === undefined) {
          return false;
        } else {
          const app = result.urls.find((i: string) => i === url);
          if (app === undefined) {
            return false;
          } else {
            const index: number = result.urls.indexOf(url);
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
