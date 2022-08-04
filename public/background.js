// delay in minutes before locking wallet;
const interval = 15;
let job = null;

const walletLocker = () => {
  chrome.storage.session.remove(["PWD"]);
  console.log("[worker]: wallet locked");
};

const onConnectListener = (msg) => {
  console.log("[worker]: new message ", msg);
  if (msg.id === "service_worker" && msg.task === "listen") {
    job = msg.task;
    if (chrome.alarms.onAlarm.hasListeners()) {
      console.log("[worker]: walletLocker active, will clear");
      chrome.alarms.onAlarm.removeListener(walletLocker);
      console.log("[worker]: extension opened in unlocked state, walletLocker listener removed");
    }
    if (msg.id === "service_worker" && msg.task === "idle") {
      job = msg.task;
    }
  } else {
    console.log("[worker]: connection with extension established, but no tasks received");
    job = "idle";
  }
};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "spika") {
    console.log("[worker]: wallet connected");
    chrome.runtime.onMessage.addListener(onConnectListener);
    port.onDisconnect.addListener(() => {
      console.log("[worker]: wallet disconnected");
      if (job === "listen") {
        chrome.alarms.create("lock_timer", { delayInMinutes: interval });
        chrome.alarms.onAlarm.addListener(walletLocker);
        console.log("[worker]: lock_timer created and walletLocker listener added");
      }
      if (chrome.runtime.onMessage.hasListeners()) {
        console.log("[worker]: onConnectListener removed");
        chrome.runtime.onMessage.removeListener(onConnectListener);
      }
      job = null;
    });
  }
});
