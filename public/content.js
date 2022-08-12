const injectScript = () => {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.src = chrome.runtime.getURL("app/inpage.js");
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
    console.log("Spika wallet injected");
  } catch (error) {
    console.error("Spika wallet injection failed", error);
  }
};

injectScript();

// inpage -> contentscript
window.addEventListener("message", function (event) {
  if (event.data.method) {
    console.log("[content.js]: new event: ", event);
    // contentscript -> background
    chrome.runtime.sendMessage(event.data, function (response) {
      // contentscript -> inpage
      window.postMessage({ responseMethod: event.data.method, id: event.data.id, response });
    });
  }
});
