import { PLATFORM } from "../utils/constants";
import { setStore, getStore } from "./store";

const _connectedApps = "connectedApps";

export const addAddress = async (currentAddress) => {
  if (PLATFORM === "chrome-extension:") {
    const connectedApps = await getStore(PLATFORM, _connectedApps);
    if (!connectedApps) {
      setStore(PLATFORM, _connectedApps, [
        {
          address: currentAddress,
          urls: [],
        },
      ]);
    } else {
      let data = connectedApps.find((i) => i.address === currentAddress);
      if (!data) {
        connectedApps.push({ address: currentAddress, urls: [] });
        setStore(PLATFORM, _connectedApps, connectedApps);
      }
    }
  }
};

export const getConnectedApps = async (currentAddress) => {
  try {
    const data = await getStore(PLATFORM, _connectedApps);
    if (data !== undefined || data !== null) {
      let result = data.find((i) => i.address === currentAddress);
      return result;
    }
  } catch (error) {
    console.log(error);
  }
};

export const setApp = async (currentAddress, url) => {
  if (currentAddress && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
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

export const getApp = async (currentAddress, url) => {
  if (currentAddress && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
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

export const removeApp = async (currentAddress, url) => {
  if (currentAddress && url) {
    try {
      const data = await getStore(PLATFORM, _connectedApps);
      if (data !== undefined || data !== null) {
        let result = data.find((i) => i.address === currentAddress);
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
