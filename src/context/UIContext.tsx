import React, { createContext, useEffect, useState } from "react";
import { IContextUI, INftDetails, INotification, ISpikaNews, IUR } from "../interface";
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
  const [forceUpdateNfts, setForceUpdateNfts] = useState<boolean>(false);
  const [openOfferDialog, setOpenOfferDialog] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<INftDetails | undefined>();
  const [mnemonicRequired, setMnemonicRequired] = useState<boolean>(false);
  const [privateKeyRequired, setPrivateKeyRequired] = useState<boolean>(false);
  const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState<boolean>(false);
  const [openRenameAccountDialog, setOpenRenameAccountDialog] = useState<boolean>(false);
  const [openResetWalletDialog, setOpenResetWalletDialog] = useState<boolean>(false);
  const [accountRoutesEnabled, setAccountRoutesEnabled] = useState<boolean>(true);
  const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false);
  const [openConnectedSitesDialog, setOpenConnectedSitesDialog] = useState<boolean>(false);
  const [openAccountManagerDialog, setOpenAccountManagerDialog] = useState<boolean>(false);
  const [openConnectWalletDialog, setOpenConnectWalletDialog] = useState<boolean>(false);
  const [openKeystoneQRScannerDialog, setOpenKeystoneQRScannerDialog] = useState<boolean>(false);
  const [openKeystoneImportDialog, setOpenKeystoneImportDialog] = useState<boolean>(false);
  const [keystoneScanResult, setKeystoneScanResult] = useState<IUR | undefined>(undefined);
  const [openSwapSettingsDialog, setOpenSwapSettingsDialog] = useState<boolean>(false);
  const [openNotification, setOpenNotification] = useState<boolean>(true);
  const [openContactCard, setOpenContactCard] = useState<boolean>(false);
  const [openAddressBookDialog, setOpenAddressBookDialog] = useState<boolean>(false);
  const [notification, setNotification] = useState<INotification | undefined>(undefined);
  const [notificationExpired, setNotificationExpired] = useState<boolean>(true);
  const [spikaNews, setSpikaNews] = useState<Array<ISpikaNews>>([]);
  const [spikaNewsNumber, setSpikaNewsNumber] = useState<number>(0);
  const [openConfirmClaimDialog, setOpenConfirmClaimDialog] = useState<boolean>(false);
  const [disableAllRoutes, setDisableAllRoutes] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>();
  const [previewRequired, setPreviewRequired] = useState<boolean>(true);
  const [somethingChanged, setSomethingChanged] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [devMode] = useState<boolean>(PLATFORM === "http:" ? true : false);
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

  const handleSendUI = (): void => {
    setOpenSendDialog(true);
    debug.log("Opening Send Dialog...");
  };

  const handleReceiveUI = (): void => {
    setOpenReceiveDialog(true);
    debug.log("Opening Receive Dialog...");
  };

  const handleCreateCollectionUI = (): void => {
    setOpenCreateCollectionDialog(true);
    debug.log("Opening Create Collection Dialog...");
  };

  const handleCreateNFTUI = (): void => {
    setOpenCreateNftDialog(true);
    debug.log("Opening Create NFT Dialog...");
  };

  const handleLoginUI = (): void => {
    setOpenLoginDialog(true);
    debug.log("Opening Login Dialog...");
  };
  const handleLogoutUI = (): void => {
    setOpenLogoutDialog(true);
    debug.log("Opening Logout Dialog...");
  };

  const handleMnemonicUI = (): void => {
    setMnemonicRequired(true);
    setOpenLoginDialog(true);
    debug.log("Opening Mnemonics Dialog...");
  };

  const handlePrivateKeyUI = (): void => {
    setPrivateKeyRequired(true);
    setOpenLoginDialog(true);
    debug.log("Opening Private Key Dialog...");
  };

  const handleChangePasswordUI = (): void => {
    setOpenChangePasswordDialog(true);
    debug.log("Opening Change Password Dialog...");
  };

  const handleAccountAssetsUI = (): void => {
    setOpenAccountAssetsDialog(true);
    debug.log("Opening Account Assets Dialog...");
  };

  const handleAddAssetUI = (): void => {
    setOpenAddAssetDialog(true);
    debug.log("Opening Add Asset Dialog...");
  };

  const handleChangeNetworkUI = (): void => {
    setOpenNetworkDialog(true);
    debug.log("Opening Change Network Dialog...");
  };

  const handleAddCustomNetworkUI = (): void => {
    setOpenAddCustomNetworkDialog(true);
    debug.log("Opening Add Custom Network Dialog...");
  };

  const handleNftDetailsUI = (nft: INftDetails): void => {
    setSelectedNft(nft);
    setOpenNftDetailsDialog(true);
    debug.log("Opening NFT Details Dialog...");
  };

  const handleOfferDialogUI = (): void => {
    setOpenOfferDialog(true);
    debug.log("Opening Offer Dialog...");
  };

  const handleConnectedSitesUI = (): void => {
    setOpenConnectedSitesDialog(true);
    debug.log("Opening Connected Sites Dialog...");
  };

  const handleCreateAccountDialog = (): void => {
    setOpenCreateAccountDialog(true);
    debug.log("Opening Create Account Dialog...");
  };

  const handleAccountManagerUI = (): void => {
    setOpenAccountManagerDialog(true);
    debug.log("Opening Account Manager Dialog...");
  };

  const handleRenameAccountUI = (): void => {
    setOpenRenameAccountDialog(true);
    debug.log("Opening Rename Account Dialog...");
  };

  const handleResetWalletUI = (): void => {
    setOpenResetWalletDialog(true);
    debug.log("Opening Reset Wallet Dialog...");
  };

  const handleConnectWalletUI = (): void => {
    setOpenConnectWalletDialog(true);
    debug.log("Opening Connect Wallet Dialog...");
  };

  const handleKeystoneQRScannerUI = (): void => {
    setOpenConnectWalletDialog(false);
    setOpenKeystoneQRScannerDialog(true);
    debug.log("Opening Keystone QR Scanner Dialog...");
  };

  const handleKeystoneImportUI = (): void => {
    setOpenKeystoneImportDialog(true);
    debug.log("Opening Keystone Import Dialog...");
  };

  const handleSwapSettingsUI = (): void => {
    setOpenSwapSettingsDialog(true);
    debug.log("Opening Settings Dialog...");
  };

  const handleContactCardUI = (): void => {
    setOpenContactCard(true);
    debug.log("Opening Contact Card...");
  };

  const handleAddressBookUI = (): void => {
    setOpenAddressBookDialog(true);
    debug.log("Opening Address Book Dialog...");
  };

  const handleConfirmClaimUI = (): void => {
    setOpenConfirmClaimDialog(true);
    debug.log("Opening Confirm Claim Dialog...");
  };

  const sendNotification = (args: INotification): void => {
    const _notification: INotification = {
      message: args.message,
      title: args.title,
      type: args.type,
      autoHide: args.autoHide,
      untilExpired: args.untilExpired,
    };

    if (args.untilExpired) {
      setNotificationExpired(false);
    }
    setNotification(_notification);
    setOpenNotification(true);
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
        openSendDialog,
        setOpenSendDialog,
        openConfirmSendDialog,
        setOpenConfirmSendDialog,
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
        forceUpdateNfts,
        setForceUpdateNfts,
        openNftDetailsDialog,
        setOpenNftDetailsDialog,
        selectedNft,
        setSelectedNft,
        openOfferDialog,
        setOpenOfferDialog,
        handleOfferDialogUI,
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
        openConnectedSitesDialog,
        setOpenConnectedSitesDialog,
        handleConnectedSitesUI,
        openAccountManagerDialog,
        handleRenameAccountUI,
        setOpenAccountManagerDialog,
        openRenameAccountDialog,
        setOpenRenameAccountDialog,
        handleAccountManagerUI,
        openConnectWalletDialog,
        setOpenConnectWalletDialog,
        handleConnectWalletUI,
        openKeystoneQRScannerDialog,
        setOpenKeystoneQRScannerDialog,
        handleKeystoneQRScannerUI,
        openResetWalletDialog,
        setOpenResetWalletDialog,
        handleResetWalletUI,
        openKeystoneImportDialog,
        setOpenKeystoneImportDialog,
        handleKeystoneImportUI,
        keystoneScanResult,
        setKeystoneScanResult,
        openSwapSettingsDialog,
        setOpenSwapSettingsDialog,
        openNotification,
        setOpenNotification,
        notification,
        setNotification,
        notificationExpired,
        setNotificationExpired,
        sendNotification,
        spikaNews,
        setSpikaNews,
        spikaNewsNumber,
        setSpikaNewsNumber,
        openConfirmClaimDialog,
        setOpenConfirmClaimDialog,
        handleConfirmClaimUI,
        openContactCard,
        setOpenContactCard,
        handleContactCardUI,
        openAddressBookDialog,
        setOpenAddressBookDialog,
        handleAddressBookUI,
        handleSwapSettingsUI,
        disableAllRoutes,
        setDisableAllRoutes,
        previewRequired,
        setPreviewRequired,
        somethingChanged,
        setSomethingChanged,
        devMode,
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
