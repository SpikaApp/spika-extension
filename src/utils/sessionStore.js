export const saveSession = (protocol, key, value) => {
  if (protocol === "http:" || protocol === "https:") {
    sessionStorage.setItem(key, value);
  }
  if (protocol === "chrome-extension:") {
    chrome.storage.session.set({ [key]: value });
  }
};

export const loadSession = (protocol, key) => {
  if (protocol === "http:" || protocol === "https:") {
    return sessionStorage.getItem(key);
  }
  if (protocol === "chrome-extension:") {
    return new Promise((resolve) => {
      chrome.storage.session.get(key, (item) => {
        resolve(item[key]);
      });
    });
  }
};

export const clearSession = (protocol, key) => {
  if (protocol === "http:" || protocol === "https:") {
    sessionStorage.removeItem(key);
  }
  if (protocol === "chrome-extension:") {
    chrome.storage.session.remove([key]);
  }
};
