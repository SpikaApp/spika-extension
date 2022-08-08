import React, { useEffect, useState } from "react";
import { getStore } from "../utils/store";
import { PLATFORM } from "../utils/constants";

export const UIContext = React.createContext();

export const UIProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState();
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [openMintDialog, setOpenMintDialog] = useState(false);
  const [openConfirmSendDialog, setOpenConfirmSendDialog] = useState(false);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openCreateCollectionDialog, setOpenCreateCollectionDialog] = useState(false);
  const [openCreateNftDialog, setOpenCreateNftDialog] = useState(false);
  const [mnemonicRequired, setMnemonicRequired] = useState(false);
  const [privateKeyRequired, setPrivateKeyRequired] = useState(false);
  const [accountRoutesEnabled, setAccountRoutesEnabled] = useState(true);

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

  const handleMintUI = () => {
    setOpenMintDialog(true);
  };

  const handleSendUI = () => {
    setOpenSendDialog(true);
  };

  const handleReceiveUI = () => {
    setOpenReceiveDialog(true);
  };

  const handleCreateCollectionUI = () => {
    setOpenCreateCollectionDialog(true);
  };

  const handleCreateNFTUI = () => {
    setOpenCreateNftDialog(true);
  };

  const handleLoginUI = () => {
    setOpenLoginDialog(true);
  };
  const handleLogoutUI = () => {
    setOpenLogoutDialog(true);
  };

  const handleMnemonicUI = () => {
    setMnemonicRequired(true);
    setOpenLoginDialog(true);
  };

  const handlePrivateKeyUI = () => {
    setPrivateKeyRequired(true);
    setOpenLoginDialog(true);
  };

  return (
    <UIContext.Provider
      value={{
        darkMode,
        setDarkMode,
        openAlertDialog,
        setOpenAlertDialog,
        openMintDialog,
        setOpenMintDialog,
        openSendDialog,
        setOpenSendDialog,
        openConfirmSendDialog,
        setOpenConfirmSendDialog,
        handleMintUI,
        handleSendUI,
        handleReceiveUI,
        openReceiveDialog,
        setOpenReceiveDialog,
        openCreateCollectionDialog,
        setOpenCreateCollectionDialog,
        handleCreateCollectionUI,
        openCreateNftDialog,
        setOpenCreateNftDialog,
        handleCreateNFTUI,
        openLoginDialog,
        setOpenLoginDialog,
        handleLoginUI,
        openLogoutDialog,
        setOpenLogoutDialog,
        handleLogoutUI,
        handleMnemonicUI,
        mnemonicRequired,
        setMnemonicRequired,
        handlePrivateKeyUI,
        privateKeyRequired,
        setPrivateKeyRequired,
        accountRoutesEnabled,
        setAccountRoutesEnabled,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
