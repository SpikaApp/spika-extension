// delay in minutes before locking wallet;
const interval = 1;
let job = null;

const walletLocker = () => {
  chrome.storage.session.remove(["PWD"]);
  console.log("[service_worker]: wallet locked");
};

const onConnectListener = (msg) => {
  console.log("[service_worker]: new message ", msg);
  if (msg.id === "service_worker" && msg.task === "listen") {
    job = msg.task;
    if (chrome.alarms.onAlarm.hasListeners()) {
      console.log("[service_worker]: walletLocker active, will clear");
      chrome.alarms.onAlarm.removeListener(walletLocker);
      console.log(
        "[service_worker]: extension opened in unlocked state, walletLocker listener removed"
      );
    }
    if (msg.id === "service_worker" && msg.task === "idle") {
      job = msg.task;
    }
  } else {
    console.log("[service_worker]: connection with extension established, but no tasks received");
    job = "idle";
  }
};

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "spika") {
    console.log("[service_worker]: wallet connected");
    chrome.runtime.onMessage.addListener(onConnectListener);
    port.onDisconnect.addListener(() => {
      console.log("[service_worker]: wallet disconnected");
      if (job === "listen") {
        chrome.alarms.create("lock_timer", { delayInMinutes: interval });
        chrome.alarms.onAlarm.addListener(walletLocker);
        console.log("[service_worker]: lock_timer created and walletLocker listener added");
      }
      if (chrome.runtime.onMessage.hasListeners()) {
        console.log("[service_worker]: onConnectListener removed");
        chrome.runtime.onMessage.removeListener(onConnectListener);
      }
      job = null;
    });
  }
});
