import { PLATFORM } from "./constants";

const sendMessage = (channel, id, method, data) => {
  if (PLATFORM === "chrome-extension:") {
    chrome.runtime.sendMessage({
      channel: channel,
      id: id,
      method: method,
      data: data,
    });
  }
};

export default sendMessage;
