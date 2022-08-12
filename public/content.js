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

// // inpage -> content
// window.addEventListener("spika_injected_script_message", (event) => {
//   console.log("content script window listen message", event);
//   if (event.detail.method) {
//     // content -> background
//     chrome.runtime.sendMessage(
//       {
//         channel: "spika_external",
//         ...event.detail,
//       },
//       (response) => {
//         // Can return null response if window is killed
//         if (!response) {
//           return;
//         }

//         // background response -> inpage
//         window.postMessage({
//           detail: {
//             responseMethod: event.detail.method,
//             id: event.detail.id,
//             response,
//           },
//         });
//       }
//     );
//   }
// });
