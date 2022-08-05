import React, { useEffect, useContext } from "react";
import { UIContext } from "./UIContext";
import { PLATFORM } from "../utils/constants";
import { getStore } from "../utils/store";

export const SessionContext = React.createContext();

export const SessionProvider = ({ children }) => {
  const { setDarkMode } = useContext(UIContext);

  useEffect(() => {
    sessionTheme();
  }, []);

  const sessionTheme = async () => {
    const data = await getStore(PLATFORM, "DARK_MODE");
    if (data === undefined || data === null) {
      setDarkMode(true);
    } else {
      setDarkMode(data);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessionTheme,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
