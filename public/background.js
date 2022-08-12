const responseHandlers = new Map();

// keys
const _locker = "WALLET_LOCKER";
const _walletLockStatus = "WALLET_LOCK_STATUS";
const _delayBeforeLock = "DELAY_BEFORE_LOCK";
const _currentRoute = "CURRENT_ROUTE";
const _method = "METHOD";

let result;

// values
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

const launchPopup = (message, sender, sendResponse) => {
  setMem(_currentRoute, permissionDialog);

  const request = JSON.stringify({
    method: message.method,
    args: message.args,
    id: message.id,
  });

  const searchParams = new URLSearchParams();
  searchParams.set("request", request);
  searchParams.set("origin", sender.origin);
  searchParams.set("isPopUp", true);

  chrome.windows.getLastFocused(async (focusedWindow) => {
    await chrome.windows.create({
      url: "index.html?" + searchParams.toString(),
      type: "popup",
      width: 375,
      height: 600,
      top: focusedWindow.top,
      left: focusedWindow.left + (focusedWindow.width - 375),
      focused: true,
    });
  });
  responseHandlers.set(message.id, sendResponse);
};

const spikaMessanger = async (message, sender, sendResponse) => {
  console.log("[worker]: spikaMessanger: ", message);
  if (message.channel === "spika_internal" && message.id === "wallet_locker") {
    setMem(_locker, message.method);
  }
  if (message.method === "connect") {
    // setMem(_method, "connect");
    // launchPopup(message, sender, sendResponse);
  }
  if (message.method === "is_connected") {
    sendResponse(true);
  }
  return true;
};

const walletLocker = async () => {
  const alarm = await getMem(_walletLockStatus);
  if (alarm) {
    const method = await getMem(_locker);
    if (method === "lock") {
      removeMem("PWD");
      console.log("[worker]: wallet locked");
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

chrome.runtime.onMessage.addListener(spikaMessanger);
chrome.alarms.onAlarm.addListener(walletLocker);
