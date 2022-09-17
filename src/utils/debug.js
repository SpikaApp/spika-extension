import { PLATFORM } from "./constants";

const debug = (() => {
  if (PLATFORM === "http:") {
    let timestamp = () => {};
    timestamp.toString = () => {
      return `${new Date().toLocaleTimeString("en-GB")}`;
    };

    return {
      log: console.debug.bind(console, "%s", timestamp),
    };
  } else {
    return {
      log: () => {},
    };
  }
})();

export default debug;
