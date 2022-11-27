import React, { createContext, useEffect, useState } from "react";
import { IContextUI, INftDetails } from "../interface";
import { getMem, getStore } from "../lib/store";
import applyUpdate from "../utils/applyUpdate";
import { PLATFORM } from "../utils/constants";
import debug from "../utils/debug";

type UIContextProps = {
  children: React.ReactNode;
};

export const UIContext = createContext<IContextUI>({} as IContextUI);

export const UIProvider = ({ children }: UIContextProps) => {
  const [spikaWallet, setSpikaWallet] = useState<boolean | undefined>();
  const [darkMode, setDarkMode] = useState<boolean>();
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [openMintDialog, setOpenMintDialog] = useState<boolean>(false);
  const [openConfirmSendDialog, setOpenConfirmSendDialog] = useState<boolean>(false);
  const [openSendDialog, setOpenSendDialog] = useState<boolean>(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState<boolean>(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState<boolean>(false);
  const [openLoginDialog, setOpenLoginDialog] = useState<boolean>(false);
  const [openAccountAssetsDialog, setOpenAccountAssetsDialog] = useState<boolean>(false);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState<boolean>(false);
  const [openNetworkDialog, setOpenNetworkDialog] = useState<boolean>(false);
  const [openAddCustomNetworkDialog, setOpenAddCustomNetworkDialog] = useState<boolean>(false);
  const [openAccountDetailsDialog, setOpenAccountDetailsDialog] = useState<boolean>(false);
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState<boolean>(false);
  const [openCreateCollectionDialog, setOpenCreateCollectionDialog] = useState<boolean>(false);
  const [openCreateNftDialog, setOpenCreateNftDialog] = useState<boolean>(false);
  const [txnType, setTxnType] = useState<number>(0); // 0: undefined, 1: inbound, 2: outbound
  const [openTxnDetailsDialog, setOpenTxnDetailsDialog] = useState<boolean>(false);
  const [openNftDetailsDialog, setOpenNftDetailsDialog] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<INftDetails | undefined>();
  const [mnemonicRequired, setMnemonicRequired] = useState<boolean>(false);
  const [privateKeyRequired, setPrivateKeyRequired] = useState<boolean>(false);
  const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState<boolean>(false);
  const [openRenameAccountDialog, setOpenRenameAccountDialog] = useState<boolean>(false);
  const [accountRoutesEnabled, setAccountRoutesEnabled] = useState<boolean>(true);
  const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false);
  const [openAccountManagerDialog, setOpenAccountManagerDialog] = useState<boolean>(false);
  const [disableAllRoutes, setDisableAllRoutes] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const [previewRequired, setPreviewRequired] = useState<boolean>(true);
  const [somethingChanged, setSomethingChanged] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [devMode] = useState<boolean>(PLATFORM === "http:" ? true : false);
  const [isTest, setIsTest] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
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

  const getWallet = async (): Promise<void> => {
    const status: boolean = await getStore(PLATFORM, "ACCOUNT_IMPORTED");
    debug.log("Account imported:", status);
    if (!status) {
      setSpikaWallet(false);
    } else {
      setSpikaWallet(status);
    }
  };

  const getCurrentRoute = async (): Promise<void> => {
    const route: string = await getMem(PLATFORM, _currentRoute);
    debug.log("Current route:", route);
    if (route === undefined || route === null) {
      setCurrentRoute("/");
    } else {
      setCurrentRoute(route);
    }
  };

  const dialogProvider = async (): Promise<void> => {
    switch (currentRoute) {
      case "/":
        setDisableAllRoutes(false);
        break;
      case "PermissionDialog":
        setDisableAllRoutes(true);
        setOpenPermissionDialog(true);
        break;
    }
  };

  const getSessionTheme = async (): Promise<void> => {
    const data: boolean = await getStore(PLATFORM, "DARK_MODE");
    debug.log("Dark mode enabled:", data);
    if (!data) {
      setDarkMode(false);
    } else {
      setDarkMode(data);
    }
  };

  const handleMintUI = (): void => {
    setOpenMintDialog(true);
  };

  const handleSendUI = (): void => {
    setOpenSendDialog(true);
  };

  const handleReceiveUI = (): void => {
    setOpenReceiveDialog(true);
  };

  const handleCreateCollectionUI = (): void => {
    setOpenCreateCollectionDialog(true);
  };

  const handleCreateNFTUI = (): void => {
    setOpenCreateNftDialog(true);
  };

  const handleLoginUI = (): void => {
    setOpenLoginDialog(true);
  };
  const handleLogoutUI = (): void => {
    setOpenLogoutDialog(true);
  };

  const handleMnemonicUI = (): void => {
    setMnemonicRequired(true);
    setOpenLoginDialog(true);
  };

  const handlePrivateKeyUI = (): void => {
    setPrivateKeyRequired(true);
    setOpenLoginDialog(true);
  };

  const handleChangePasswordUI = (): void => {
    setOpenChangePasswordDialog(true);
  };

  const handleAccountAssetsUI = (): void => {
    setOpenAccountAssetsDialog(true);
  };

  const handleAddAssetUI = (): void => {
    setOpenAddAssetDialog(true);
  };

  const handleChangeNetworkUI = (): void => {
    setOpenNetworkDialog(true);
  };

  const handleAddCustomNetworkUI = (): void => {
    setOpenAddCustomNetworkDialog(true);
  };

  const handleNftDetailsUI = (nft: INftDetails): void => {
    setSelectedNft(nft);
    setOpenNftDetailsDialog(true);
  };

  const handleCreateAccountDialog = (): void => {
    setOpenCreateAccountDialog(true);
  };

  const handleAccountManagerUI = (): void => {
    setOpenAccountManagerDialog(true);
  };

  const handleRenameAccountUI = (): void => {
    setOpenRenameAccountDialog(true);
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
        handleCreateAccountDialog,
        openCreateAccountDialog,
        setOpenCreateAccountDialog,
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
        openAccountManagerDialog,
        handleRenameAccountUI,
        setOpenAccountManagerDialog,
        openRenameAccountDialog,
        setOpenRenameAccountDialog,
        handleAccountManagerUI,
        disableAllRoutes,
        setDisableAllRoutes,
        previewRequired,
        setPreviewRequired,
        somethingChanged,
        setSomethingChanged,
        devMode,
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
