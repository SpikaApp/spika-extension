import React, { useEffect, useState } from "react";
import { getMem, getStore } from "../utils/store";
import { PLATFORM } from "../utils/constants";

export const UIContext = React.createContext();

export const UIProvider = ({ children }) => {
  const [spikaWallet, setSpikaWallet] = useState();
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
  const [txnType, setTxnType] = useState(0); // 0: undefined, 1: inbound, 2: outbound
  const [openTxnDetailsDialog, setOpenTxnDetailsDialog] = useState(false);
  const [mnemonicRequired, setMnemonicRequired] = useState(false);
  const [privateKeyRequired, setPrivateKeyRequired] = useState(false);
  const [accountRoutesEnabled, setAccountRoutesEnabled] = useState(true);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [disableAllRoutes, setDisableAllRoutes] = useState(false);
  const [currentRoute, setCurrentRoute] = useState();
  const _currentRoute = "currentRoute";

  useEffect(() => {
    getWallet();
    getCurrentRoute();
    getSessionTheme();
  }, []);

  useEffect(() => {
    dialogProvider();
  }, [currentRoute]);

  const getWallet = async () => {
    const wallet = await getStore(PLATFORM, "ACCOUNT_IMPORTED");
    if (wallet === undefined || wallet === null || wallet === false) {
      setSpikaWallet(false);
    } else if (wallet) {
      setSpikaWallet(wallet);
    }
  };

  const getCurrentRoute = async () => {
    const route = await getMem(PLATFORM, _currentRoute);
    if (route === undefined || route === null) {
      setCurrentRoute("/");
    } else {
      setCurrentRoute(route);
    }
  };

  const dialogProvider = async () => {
    switch (currentRoute) {
      case "/":
        setDisableAllRoutes(false);
        break;
      case "PermissionDialog":
        setDisableAllRoutes(true);
        setOpenPermissionDialog(true);
    }
  };

  const getSessionTheme = async () => {
    const data = await getStore(PLATFORM, "DARK_MODE");
    if (data === undefined || data === null) {
      setDarkMode(false);
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
        spikaWallet,
        setSpikaWallet,
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
        openTxnDetailsDialog,
        setOpenTxnDetailsDialog,
        txnType,
        setTxnType,
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
        openPermissionDialog,
        setOpenPermissionDialog,
        disableAllRoutes,
        setDisableAllRoutes,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
