import React, { useState } from "react";
export const UIContext = React.createContext();

export const UIProvider = ({ children }) => {
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [openMintDialog, setOpenMintDialog] = useState(false);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleMintUI = () => {
    setOpenMintDialog(true);
  };

  const handleSendUI = () => {
    setOpenSendDialog(true);
  };

  const handleLogoutUI = () => {
    setOpenLogoutDialog(true);
  };

  return (
    <UIContext.Provider
      value={{
        openAlertDialog,
        setOpenAlertDialog,
        openMintDialog,
        setOpenMintDialog,
        openSendDialog,
        setOpenSendDialog,
        handleMintUI,
        handleSendUI,
        openLogoutDialog,
        setOpenLogoutDialog,
        handleLogoutUI,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
