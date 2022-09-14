import React, { useEffect, useState } from "react";
import { getMem, getStore } from "../lib/store";
import { PLATFORM } from "../utils/constants";
import applyUpdate from "../utils/apply_update";

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
  const [openAccountAssetsDialog, setOpenAccountAssetsDialog] = useState(false);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [openNetworkDialog, setOpenNetworkDialog] = useState(false);
  const [openAddCustomNetworkDialog, setOpenAddCustomNetworkDialog] = useState(false);
  const [openAccountDetailsDialog, setOpenAccountDetailsDialog] = useState(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);
  const [openCreateCollectionDialog, setOpenCreateCollectionDialog] = useState(false);
  const [openCreateNftDialog, setOpenCreateNftDialog] = useState(false);
  const [txnType, setTxnType] = useState(0); // 0: undefined, 1: inbound, 2: outbound
  const [openTxnDetailsDialog, setOpenTxnDetailsDialog] = useState(false);
  const [openNftDetailsDialog, setOpenNftDetailsDialog] = useState(false);
  const [selectedNft, setSelectedNft] = useState([]);
  const [mnemonicRequired, setMnemonicRequired] = useState(false);
  const [privateKeyRequired, setPrivateKeyRequired] = useState(false);
  const [accountRoutesEnabled, setAccountRoutesEnabled] = useState(true);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [disableAllRoutes, setDisableAllRoutes] = useState(false);
  const [currentRoute, setCurrentRoute] = useState();
  const [somethingChanged, setSomethingChanged] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [isTest, setIsTest] = useState(false);
  const [isError, setIsError] = useState();
  const _currentRoute = "currentRoute";

  useEffect(() => {
    applyUpdate();
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

  const handleChangePasswordUI = () => {
    setOpenChangePasswordDialog(true);
  };

  const handleAccountAssetsUI = () => {
    setOpenAccountAssetsDialog(true);
  };

  const handleAddAssetUI = () => {
    setOpenAddAssetDialog(true);
  };

  const handleChangeNetworkUI = () => {
    setOpenNetworkDialog(true);
  };

  const handleAddCustomNetworkUI = () => {
    setOpenAddCustomNetworkDialog(true);
  };

  const handleNftDetailsUI = (nft) => {
    setSelectedNft(nft);
    setOpenNftDetailsDialog(true);
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
        openNftDetailsDialog,
        setOpenNftDetailsDialog,
        selectedNft,
        setSelectedNft,
        handleNftDetailsUI,
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
        handleChangePasswordUI,
        openAccountAssetsDialog,
        setOpenAccountAssetsDialog,
        handleAccountAssetsUI,
        openAddAssetDialog,
        setOpenAddAssetDialog,
        handleAddAssetUI,
        openNetworkDialog,
        setOpenNetworkDialog,
        handleChangeNetworkUI,
        openAddCustomNetworkDialog,
        setOpenAddCustomNetworkDialog,
        handleAddCustomNetworkUI,
        openAccountDetailsDialog,
        setOpenAccountDetailsDialog,
        openChangePasswordDialog,
        setOpenChangePasswordDialog,
        accountRoutesEnabled,
        setAccountRoutesEnabled,
        openPermissionDialog,
        setOpenPermissionDialog,
        disableAllRoutes,
        setDisableAllRoutes,
        somethingChanged,
        setSomethingChanged,
        devMode,
        setDevMode,
        isTest,
        setIsTest,
        isPopup,
        setIsPopup,
        isError,
        setIsError,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};
