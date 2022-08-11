// keys
const locker = "WALLET_LOCKER";
const walletLockStatus = "WALLET_LOCK_STATUS";
const delayBeforeLock = "DELAY_BEFORE_LOCK";
const currentRoute = "CURRENT_ROUTE";
const messageMethod = "MESSAGE_METHOD";
const transactionForApproval = "TRANSACTION_FOR_APPROVAL";

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

const launchPopup = () => {
  // set route to PermissionDialog
  setMem(currentRoute, permissionDialog);

  // creates new Popup window
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

const spikaMessanger = (msg) => {
  console.log("[worker]: spikaMessanger: ", msg);
  if (msg.channel === "spika_internal" && msg.id === "wallet_locker") {
    setMem(locker, msg.method);
  }
  if (msg.channel === "spika_external" && msg.method === "connect") {
    setMem(messageMethod, "connect");
    launchPopup();
  }
};

const walletLocker = async () => {
  const alarm = await getMem(walletLockStatus);
  if (alarm) {
    const status = await getMem(locker);
    if (status === "lock") {
      removeMem("PWD");
      console.log("[worker]: wallet locked");
      setMem(locker, false);
    }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  setMem(locker, false); // wallet locker initial state
  setMem(delayBeforeLock, 1); // delay before wallet lock in minutes
  setMem(walletLockStatus, "idle");
});

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "spika") {
    // console.log("[worker]: wallet connected");
    await chrome.alarms.clear(walletLockStatus);
    setMem(walletLockStatus, false);
  }

  port.onDisconnect.addListener(async () => {
    const task = await getMem(locker);
    if (task) {
      const delay = await getMem(delayBeforeLock);
      chrome.alarms.create(walletLockStatus, { delayInMinutes: delay });
      setMem(walletLockStatus, "lock");
    } else {
      await chrome.alarms.clear(walletLockRequired);
      setMem(walletLockStatus, "idle");
    }
    // console.log("[worker]: wallet disconnected");
  });
});

chrome.runtime.onMessage.addListener(spikaMessanger);
chrome.alarms.onAlarm.addListener(walletLocker);
