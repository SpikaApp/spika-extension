export const setMem = (platform, key, value) => {
  if (platform === "http:" || platform === "https:") {
    if (key === "PWD") {
      let _value = JSON.stringify(value);
      sessionStorage.setItem(key, _value);
    } else {
      sessionStorage.setItem(key, value);
    }
  }
  if (platform === "chrome-extension:") {
    chrome.storage.session.set({ [key]: value });
  }
};

export const getMem = (platform, key) => {
  if ((platform === "http:") | (platform === "https:")) {
    const value = sessionStorage.getItem(key);
    if (
      value === "true" ||
      value === "false" ||
      value === "undefined" ||
      value === "null" ||
      key === "PWD"
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

export const removeMem = (platform, key) => {
  if (platform === "http:" || platform === "https:") {
    sessionStorage.removeItem(key);
  }
  if (platform === "chrome-extension:") {
    chrome.storage.session.remove([key]);
  }
};

export const setStore = (platform, key, value) => {
  if (platform === "http:" || platform === "https:") {
    if (key === "currentAsset" || key === "accountAssets") {
      let _value = JSON.stringify(value);
      localStorage.setItem(key, _value);
    } else {
      localStorage.setItem(key, value);
    }
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.set({ [key]: value });
  }
};

export const getStore = (platform, key) => {
  if ((platform === "http:") | (platform === "https:")) {
    const value = localStorage.getItem(key);
    if (
      value === "true" ||
      value === "false" ||
      value === "undefined" ||
      value === "null" ||
      key === "currentAsset" ||
      key === "accountAssets"
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

export const removeStore = (platform, key) => {
  if (platform === "http:" || platform === "https:") {
    localStorage.removeItem(key);
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.remove([key]);
  }
};

export const clearStore = (platform) => {
  if (platform === "http:" || platform === "https:") {
    localStorage.clear();
  }
  if (platform === "chrome-extension:") {
    chrome.storage.local.clear();
  }
};
