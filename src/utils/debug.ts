import { PLATFORM } from "./constants";

const debug = (() => {
  if (PLATFORM === "http:") {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const timestamp = () => {};
    timestamp.toString = () => {
      return `${new Date().toLocaleTimeString("en-GB")}`;
    };

    return {
      log: console.debug.bind(console, "%s", timestamp),
    };
  } else {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      log: () => {},
    };
  }
})();

export default debug;
