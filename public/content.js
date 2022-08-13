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
window.addEventListener("message", function (request) {
  if (request.data.method) {
    console.log("[content.js]: new request: ", request.data);
    // contentscript -> background
    chrome.runtime.sendMessage(request.data, function (response) {
      // contentscript -> inpage
      // console.log("[content.js]: forwarding response: ", response);
      window.postMessage({ responseMethod: request.data.method, id: request.data.id, response });
    });
  }
});
