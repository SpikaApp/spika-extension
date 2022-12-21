const injectScript = () => {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.src = chrome.runtime.getURL("app/inpage.js");
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
    // console.log("Spika wallet injected");
  } catch (error) {
    console.error("Spika wallet injection failed", error);
  }
};

injectScript();

window.addEventListener("message", function (request) {
  if (request.data.wallet === "spika" && request.data.method) {
    console.log("[content.js]: new request: ", request.data);
    chrome.runtime.sendMessage(request.data, function (response) {
      window.postMessage({ responseMethod: request.data.method, id: request.data.id, response });
    });
  }
});

const spikaEvents = (message) => {
  if (message.method === "network_change_event") {
    window.postMessage({ method: message.method, network: message.network });
  }
  if (message.method === "account_change_event") {
    window.postMessage({ method: message.method, account: message.account });
  }
};

chrome.runtime.onMessage.addListener(spikaEvents);
