// keys
const _locker = "walletLocker";
const _walletLockStatus = "walletLockStatus";
const _delayBeforeLock = "delayBeforeLock";
const _currentRoute = "currentRoute";
const _request = "currentRequest";
const _sender = "currentSender";
const _currentAddress = "currentAddress";
const _currentPubAccount = "currentPubAccount";
const _connectedApps = "connectedApps";
const _lastConnectedApp = "lastConnectedApp";

const permissionDialog = "PermissionDialog";

const setMem = (key, value) => {
  chrome.storage.session.set({ [key]: value });
};

const getMem = (key) => {
  return new Promise((resolve) => {
    chrome.storage.session.get(key, (item) => {
      resolve(item[key]);
    });
  });
};

const removeMem = (key) => {
  chrome.storage.session.remove([key]);
};

const setStore = (key, value) => {
  chrome.storage.local.set({ [key]: value });
};

const getStore = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (item) => {
      resolve(item[key]);
    });
  });
};

const getApp = async (publicAccount, url) => {
  if (publicAccount && url) {
    try {
      const data = await getStore(_connectedApps);
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

const removeApp = async (publicAccount, url) => {
  if (publicAccount && url) {
    try {
      const data = await getStore(_connectedApps);
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
            setStore(_connectedApps, data);
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

const launchPopup = (message, sender) => {
  setMem(_currentRoute, permissionDialog);
  setMem(_request, message);
  setMem(_sender, sender);

  chrome.windows.getLastFocused(async (focusedWindow) => {
    await chrome.windows.create({
      url: "index.html",
      type: "popup",
      width: 375,
      height: 600,
      top: focusedWindow.top,
      left: focusedWindow.left + (focusedWindow.width - 375),
      focused: true,
    });
  });
};

const handleLaunchPopup = (message, sender, sendResponse) => {
  launchPopup(message, sender, sendResponse);
  chrome.runtime.onMessage.addListener(function responder(response) {
    if (response.responseMethod === message.method && response.id === message.id) {
      const result = response.response;
      this.chrome.runtime.onMessage.removeListener(responder);
      // console.log("[worker]: response received :", result);
      sendResponse(result);
    }
    return true;
  });
};

const handleAutoConnect = async (message, sender, sendResponse) => {
  const data = await getMem(_lastConnectedApp);
  console.log(data);
  if (data) {
    if (data.url === sender.origin) {
      sendResponse(data.publicAccount);
    } else {
      handleLaunchPopup(message, sender, sendResponse);
    }
  } else {
    handleLaunchPopup(message, sender, sendResponse);
  }
};

const handleIsConnected = async (sender, sendResponse) => {
  const publicAccount = await getStore(_currentPubAccount);
  const url = sender.origin;
  const result = await getApp(publicAccount, url);
  if (result) {
    setMem(_lastConnectedApp, { publicAccount: publicAccount, url: url });
  }
  sendResponse(result);
};

const handleDisconnect = async (sender, sendResponse) => {
  const publicAccount = await getStore(_currentPubAccount);
  const url = sender.origin;
  const result = await removeApp(publicAccount, url);
  removeMem(_lastConnectedApp);
  sendResponse(result);
};

const spikaMessenger = (message, sender, sendResponse) => {
  // console.log("[worker]: spikaMessenger: ", message);
  if (message.id === "locker") {
    setMem(_locker, message.method);
  } else if (message.method === "connect") {
    handleAutoConnect(message, sender, sendResponse);
  } else if (message.method === "account") {
    handleLaunchPopup(message, sender, sendResponse);
  } else if (message.method === "isConnected") {
    handleIsConnected(sender, sendResponse);
  } else if (message.method === "disconnect") {
    handleDisconnect(sender, sendResponse);
  } else if (
    message.method === "account" ||
    message.method === "signMessage" ||
    message.method === "signTransaction" ||
    message.method === "signAndSubmitTransaction"
  ) {
    if (message.args === undefined || message.args === null) {
      sendResponse(false);
    } else {
      handleLaunchPopup(message, sender, sendResponse);
    }
  }
  return true;
};

const walletLocker = async () => {
  const alarm = await getMem(_walletLockStatus);
  if (alarm) {
    const method = await getMem(_locker);
    if (method === "lock") {
      removeMem("PWD");
      // console.log("[worker]: wallet locked");
      setMem(_locker, false);
    }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  setMem(_locker, false); // wallet locker initial state
  setMem(_walletLockStatus, "idle");
  setMem(_delayBeforeLock, 30); // delay before wallet lock in minutes
});

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "spika") {
    // console.log("[worker]: wallet connected");
    await chrome.alarms.clear("lock_trigger");
    setMem(_walletLockStatus, "idle");
  }

  port.onDisconnect.addListener(async () => {
    const method = await getMem(_locker);
    if (method) {
      const delay = await getMem(_delayBeforeLock);
      chrome.alarms.create(_walletLockStatus, { delayInMinutes: delay });
      setMem(_walletLockStatus, "lock");
    } else {
      await chrome.alarms.clear(_walletLockStatus);
      setMem(_walletLockStatus, "idle");
    }
    // console.log("[worker]: wallet disconnected");
  });
});

chrome.runtime.onMessage.addListener(spikaMessenger);
chrome.alarms.onAlarm.addListener(walletLocker);
