const locker = "WALLET_LOCKER";
const walletLockRequired = "WALLET_LOCK_REQUIRED";
const delayBeforeLock = "DELAY_BEFORE_LOCK";

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

const spikaMessanger = (msg) => {
  // wallet lock related messages
  console.log("[worker]: new message: ", msg);
  if (msg.ch === "spika_internal" && msg.id === "wallet_locker") {
    setMem(locker, msg.task);
  }
};

const walletLocker = async () => {
  const alarm = await getMem(walletLockRequired);
  if (alarm) {
    const task = await getMem(locker);
    if (task === true) {
      removeMem("PWD");
      console.log("[worker]: wallet locked");
      setMem(locker, false);
    }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  setMem(locker, false); // wallet locker initial state
  setMem(delayBeforeLock, 1); // delay before wallet lock in minutes
  setMem(walletLockRequired, false);
});

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "spika") {
    console.log("[worker]: wallet connected");
    await chrome.alarms.clear(walletLockRequired);
    setMem(walletLockRequired, false);
  }
  port.onDisconnect.addListener(async () => {
    const task = await getMem(locker);
    if (task === true) {
      const delay = await getMem(delayBeforeLock);
      chrome.alarms.create(walletLockRequired, { delayInMinutes: delay });
      setMem(walletLockRequired, true);
    }
    if (task === false) {
      await chrome.alarms.clear(walletLockRequired);
      setMem(walletLockRequired, false);
    }
    console.log("[worker]: wallet disconnected");
  });
});

chrome.runtime.onMessage.addListener(spikaMessanger);
chrome.alarms.onAlarm.addListener(walletLocker);
