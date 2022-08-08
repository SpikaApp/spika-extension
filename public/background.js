const task = "SERVICE_WORKER_TASK";
const lockTimer = 15;

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

const removeStore = (key) => {
  chrome.storage.local.remove([key]);
};

const spikaMessanger = (msg) => {
  if (msg.id === "service_worker") {
    setStore(task, msg.task);
  }
};

const walletLocker = () => {
  removeMem("PWD");
  console.log("[worker]: wallet locked");
};

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "spika") {
    console.log("[worker]: wallet connected");
    await chrome.alarms.clear("lock_timer");
  }
  port.onDisconnect.addListener(async () => {
    const status = await getStore(task);
    if (status === "listen") {
      chrome.alarms.create("lock_timer", { delayInMinutes: lockTimer });
    }
    console.log("[worker]: wallet disconnected");
    // if (status === "idle") {
    //   console.log("[worker]: wallet disconnected");
    // }
  });
});

chrome.runtime.onMessage.addListener(spikaMessanger);
chrome.alarms.onAlarm.addListener(walletLocker);
