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

// inpage -> content
window.addEventListener("spika_injected_script_message", (event) => {
  console.log("content script window listen message", event);
  if (event.detail.method) {
    // contentscript -> background
    chrome.runtime.sendMessage(
      {
        channel: "spika_external",
        ...event.detail,
      },
      (response) => {
        // Can return null response if window is killed
        if (!response) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent("spika_contentscript_message", {
            detail: {
              responseMethod: event.detail.method,
              id: event.detail.id,
              response,
            },
          })
        );
      }
    );
  }
});
