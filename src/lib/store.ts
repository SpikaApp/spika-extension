/* eslint-disable @typescript-eslint/no-explicit-any */
export const setMem = (platform: string, key: string, value: any): void => {
  if (platform === "http:" || platform === "https:") {
    if (key === "PWD") {
      const _value: string = JSON.stringify(value);
      sessionStorage.setItem(key, _value);
    } else {
      sessionStorage.setItem(key, value);
    }
  }
  if (platform === "chrome-extension:") {
    chrome.storage.session.set({ [key]: value });
  }
};

export const getMem = (platform: string, key: string) => {
  if (platform === "http:" || platform === "https:") {
    const value: string | null = sessionStorage.getItem(key);
    if (
      value === "true" ||
      value === "false" ||
      value === "undefined" ||
      value === "null" ||
      (value && key === "PWD")
    ) {
      return JSON.parse(value);
    } else {
      return value;
    }
  }
  if (platform === "chrome-extension:") {
    return new Promise((resolve) => {
      chrome.storage.session.get(key, (item) => {
        resolve(item[key]);
      });
    });
  }
};

export const removeMem = (platform: string, key: string): void => {
  if (platform === "http:" || platform === "https:") {
    sessionStorage.removeItem(key);
  }
  if (platform === "chrome-extension:") {
    chrome.storage.session.remove([key]);
  }
};

// eslint-disable-next-line
export const setStore = (platform: string, key: string, value: any): void => {
  if (platform === "http:" || platform === "https:") {
    if (
      key === "currentAsset" ||
      key === "accountAssets" ||
      key === "accountNfts" ||
      key === "accountNetworks" ||
      key === "currentNetwork" ||
      key === "currentPubAccount" ||
      key === "spikaMasterAccount"
    ) {
      const _value = JSON.stringify(value);
      localStorage.setItem(key, _value);
    } else {
      localStorage.setItem(key, value);
    }
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.set({ [key]: value });
  }
};

export const getStore = (platform: string, key: string): any => {
  if (platform === "http:" || platform === "https:") {
    const value: any = localStorage.getItem(key);
    if (
      value === "true" ||
      value === "false" ||
      value === "undefined" ||
      value === "null" ||
      key === "currentAsset" ||
      key === "accountAssets" ||
      key === "accountNfts" ||
      key === "accountNetworks" ||
      key === "currentNetwork" ||
      key === "currentPubAccount" ||
      key === "spikaMasterAccount"
    ) {
      return JSON.parse(value);
    } else {
      return value;
    }
  }
  if (platform === "chrome-extension:") {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (item) => {
        resolve(item[key]);
      });
    });
  }
};

export const removeStore = (platform: string, key: string): void => {
  if (platform === "http:" || platform === "https:") {
    localStorage.removeItem(key);
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.remove([key]);
  }
};

export const clearStore = (platform: string): void => {
  if (platform === "http:" || platform === "https:") {
    localStorage.clear();
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.clear();
  }
};
