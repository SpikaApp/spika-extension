/* eslint-disable @typescript-eslint/no-non-null-assertion */
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  ImageList,
  ImageListItem,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { TxnBuilderTypes } from "aptos";
import { useContext, useEffect, useState } from "react";
import default_nft from "../assets/default_nft.jpg";
import ClaimDialog from "../components/ClaimDialog";
import CreateCollectionDialog from "../components/CreateCollectionDialog";
import CreateNftDialog from "../components/CreateNftDialog";
import Footer from "../components/Footer";
import { a11yProps, StyledBadge, StyledMenu, TabPanel } from "../components/lib";
import NftDetailsDialog from "../components/NftDetailsDialog";
import { AccountContext } from "../context/AccountContext";
import { PayloadContext } from "../context/PayloadContext";
import { UIContext } from "../context/UIContext";
import { Web3Context } from "../context/Web3Context";
import { INftDetails } from "../interface";
import { IPendingClaim, IPendingClaims } from "../interface/IQueryQL";
import { fetchGraphQL } from "../core/fetchGraphQL";
import * as nftStore from "../core/nftStore";
import { pendingClaims } from "../core/query";
import { getNftMetadata } from "../utils/getNftMetadata";
import shortenAddress from "../utils/shortenAddress";

const NftButton = styled(Button)(() => ({
  borderRadius: "8px",
  "&:hover": {
    background: "none",
  },
}));

const NFTs = (): JSX.Element => {
  // Context: UIContext, AccountContext, Web3Context, PayloadContext
  const {
    handleCreateCollectionUI,
    handleCreateNFTUI,
    handleNftDetailsUI,
    handleConfirmClaimUI,
    forceUpdateNfts,
    setForceUpdateNfts,
    darkMode,
    sendNotification,
  } = useContext(UIContext);
  const { accountImported, account, currentAddress, validateAccount } = useContext(AccountContext);
  const { getTokenStore, getNftDetails, estimateTransaction, isValidTransaction, estimatedTxnResult, mainnet } =
    useContext(Web3Context);
  const { claim } = useContext(PayloadContext);

  // State variables
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [cacheChecked, setCacheChecked] = useState<boolean>(false);
  const [nfts, setNfts] = useState<Array<INftDetails>>([]);
  const [pending, setPending] = useState<Array<IPendingClaim>>([]);
  const [selectedForClaim, setSelectedForClaim] = useState<IPendingClaim | undefined>(undefined);
  const [claimPayload, setClaimPayload] = useState<TxnBuilderTypes.TransactionPayload | undefined>(undefined);
  const [pendingClaimsNumber, setPendingClaimsNumber] = useState<number>(pending.length);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // TabPanel
  const theme = useTheme();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (accountImported) {
      getCached();
    }
  }, [accountImported]);

  useEffect(() => {
    if (accountImported && cacheChecked) {
      if (forceUpdateNfts) {
        setNfts([]);
        setSelectedForClaim(undefined);
        setClaimPayload(undefined);
        setForceUpdateNfts(false);
      }
      getPendingClaims();
      getNftsForAccount();
      const updateNfts = window.setInterval(() => {
        getPendingClaims();
        getNftsForAccount();
      }, 60000);
      return () => window.clearInterval(updateNfts);
    }
    return undefined;
  }, [cacheChecked, currentAddress, forceUpdateNfts]);

  const getCached = async (): Promise<void> => {
    if (currentAddress) {
      const cached = await nftStore.getNfts(currentAddress);
      if (cached && cached.nfts.length > 0) {
        setNfts(cached.nfts);
      }
      setCacheChecked(true);
    }
  };

  useEffect(() => {
    if (isValidTransaction && estimatedTxnResult && selectedForClaim) {
      handleConfirmClaimUI();
    }
  }, [isValidTransaction]);

  useEffect(() => {
    if (pending) {
      setPendingClaimsNumber(pending.length);
    }
  }, [pending]);

  const getNftsForAccount = async (): Promise<void> => {
    let result: Array<INftDetails> = [];
    if (currentAddress) {
      setIsLocalLoading(true);
      const tokens = await getTokenStore();
      if (tokens.length !== 0) result = await getNftDetails(tokens);
      setNfts(result);
      nftStore.setNfts(currentAddress, result);
      setIsLocalLoading(false);
    }
  };

  const getPendingClaims = async (): Promise<Array<IPendingClaim>> => {
    const result: Array<IPendingClaim> = [];
    if (currentAddress) {
      try {
        const data: IPendingClaims = await fetchGraphQL(pendingClaims(currentAddress));
        if (data && data.current_token_pending_claims) {
          for (const token of data.current_token_pending_claims) {
            const imageUrl = await getPendingNftImage(token.current_token_data.metadata_uri);
            const metadata = {
              ...token,
              current_token_data: {
                ...token.current_token_data,
                image: imageUrl,
              },
            };
            result.push(metadata);
          }
          setPending(result);
        }
      } catch (error) {
        console.log(error);
      }
    }
    return result;
  };

  const getPendingNftImage = async (uri: string): Promise<string> => {
    let image = "";
    const metadata = await getNftMetadata(uri);
    if (metadata) {
      image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    } else {
      image = uri;
    }
    return image;
  };

  const makeClaimPayload = async (
    pendingClaim: IPendingClaim
  ): Promise<TxnBuilderTypes.TransactionPayload | undefined> => {
    if (account) {
      try {
        const validate = await validateAccount(account.address().hex());
        if (!validate) {
          sendNotification({ message: "Addres is not registered on chain", type: "warning", autoHide: true });
          return;
        }
        const payload = await claim({
          account: account,
          sender: pendingClaim.from_address,
          creator: pendingClaim.current_token_data.creator_address,
          collectionName: pendingClaim.current_token_data.collection_name,
          name: pendingClaim.current_token_data.name,
          property_version: pendingClaim.property_version,
        });
        return payload;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const estimateClaim = async (pendingClaim: IPendingClaim): Promise<void> => {
    if (account) {
      if (mainnet) {
        const payload = await makeClaimPayload(pendingClaim);
        await estimateTransaction(payload, true, true);
        setClaimPayload(payload);
        setSelectedForClaim(pendingClaim);
      } else {
        sendNotification({ message: "Switch to Mainnet to claim this NFT", type: "info", autoHide: true });
        return;
      }
    }
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMain = (): void => {
    setAnchorEl(null);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xs">
      <Stack direction="row" sx={{ mt: "90px", justifyContent: "center" }}>
        <StyledMenu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMain}>
          <MenuItem
            onClick={() => {
              handleCloseMain();
              handleCreateCollectionUI();
            }}
          >
            <Typography color="textPrimary" sx={{ fontSize: "16px", fontWeight: "450" }}>
              Create Collection
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMain();
              handleCreateNFTUI();
            }}
          >
            <Typography color="textPrimary" sx={{ fontSize: "16px", fontWeight: "450" }}>
              Create NFT
            </Typography>
          </MenuItem>
        </StyledMenu>
        <Box sx={{ bgcolor: "background.paper", width: "100%", borderRadius: "12px" }}>
          <AppBar position="static" sx={{ borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }}>
            <IconButton
              onClick={handleClickMenu}
              sx={{ position: "absolute", ml: "10px", mt: "5px", zIndex: 1, color: darkMode ? "white" : "white" }}
            >
              <MoreVertIcon sx={{ width: "22px", height: "22px" }} />
            </IconButton>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab
                label={<Typography sx={{ fontSize: "14px", fontWeight: "450" }}>Gallery</Typography>}
                {...a11yProps(0)}
              />
              <Tab
                label={
                  <Stack sx={{ display: "flex", flexDirection: "row" }}>
                    <Typography sx={{ mr: "20px", fontSize: "14px", fontWeight: "450" }}>Inbox</Typography>
                    <StyledBadge badgeContent={pendingClaimsNumber} color="error" sx={{ mt: "-3px" }} />
                  </Stack>
                }
                {...a11yProps(1)}
              />
            </Tabs>
          </AppBar>
        </Box>
      </Stack>
      <TabPanel value={value} index={0} dir={theme.direction}>
        {isLocalLoading && nfts.length === 0 && (
          <Stack direction="column" sx={{ display: "flex", alignItems: "center", mt: "65px", mb: "256px" }}>
            <Typography align="center" variant="h6" color="textSecondary" gutterBottom>
              Updating metadata...
            </Typography>
            <CircularProgress sx={{ mt: 4 }} color="info" />
          </Stack>
        )}
        {!isLocalLoading && nfts.length === 0 && (
          <Typography sx={{ mt: "65px", mb: "335px" }} variant="h6" align="center" color="textSecondary" gutterBottom>
            No NFTs found
          </Typography>
        )}
        {nfts.length > 0 && (
          <Stack sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ height: "340px", mb: "76px" }}>
              <ImageList
                gap={18}
                cols={3}
                rowHeight={101}
                variant="quilted"
                sx={{
                  overflow: "hidden",
                  overflowY: "visible",
                  width: "338px",
                  maxHeight: "340px",
                }}
              >
                {nfts.map((nft) => (
                  <ImageListItem key={nft.name + nft.description + nft.uri}>
                    <Tooltip title={nft.name}>
                      <NftButton
                        disableRipple
                        sx={{ width: "100px", height: "100px" }}
                        onClick={() => handleNftDetailsUI(nft)}
                      >
                        <Paper
                          component="img"
                          sx={{ width: "100px", height: "100px" }}
                          src={`${nft.uri}`}
                          loading="lazy"
                          onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = default_nft;
                          }}
                        />
                      </NftButton>
                    </Tooltip>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          </Stack>
        )}
        {accountImported && <Footer />}
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <Box
          sx={{
            height: "415px",
            width: "100%",
            border: 0,
            borderColor: "info.main",
            mt: "14px",
            overflow: "hidden",
            overflowY: "visible",
            mb: "-13px",
          }}
        >
          {pending.length > 0 ? (
            pending.map((nft) => (
              <Box key={nft.token_data_id_hash} sx={{ border: 0, mb: "12px" }}>
                <Stack
                  sx={{
                    display: "flex",
                    border: 2,
                    flexDirection: "row",
                    borderRadius: "12px",
                    borderColor: "#9e9e9e",
                    px: "12px",
                    py: "10px",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack sx={{ border: 0, width: "75%", alignItems: "center" }}>
                    <Typography sx={{ fontWeight: "550", fontSize: "17px" }}>{nft.current_token_data.name}</Typography>
                    <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px", mt: "-2px" }}>
                      {nft.current_token_data.collection_name}
                    </Typography>
                    <Stack direction="column" sx={{ alignItems: "center" }}>
                      <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", mt: "8px", mb: "8px" }}>
                        <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px", mr: "8px" }}>
                          Created by
                        </Typography>
                        <Chip
                          sx={{ height: "22px", width: "135px" }}
                          label={
                            <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px" }}>
                              {shortenAddress(nft.current_token_data.creator_address)}
                            </Typography>
                          }
                        />
                      </Stack>
                      <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px", mr: "8px" }}>
                          Offered by
                        </Typography>
                        <Chip
                          sx={{ height: "22px", width: "135px" }}
                          label={
                            <Typography color="textSecondary" sx={{ fontWeight: "450", fontSize: "14px" }}>
                              {shortenAddress(nft.from_address)}
                            </Typography>
                          }
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack
                    sx={{
                      border: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Paper
                      component="img"
                      src={nft.current_token_data.image ? nft.current_token_data.image : default_nft}
                      sx={{ width: "75px", height: "75px" }}
                    />
                    <Button
                      variant="outlined"
                      sx={{ mt: "8px", height: "22px", border: 2 }}
                      onClick={() => estimateClaim(nft)}
                    >
                      Claim
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography sx={{ mt: "65px", mb: "318px" }} variant="h6" align="center" color="textSecondary" gutterBottom>
              Inbox is empty
            </Typography>
          )}
        </Box>
        {accountImported && <Footer />}
      </TabPanel>
      <CreateCollectionDialog />
      <CreateNftDialog />
      <NftDetailsDialog />
      <ClaimDialog pendingClaim={selectedForClaim!} payload={claimPayload!} />
    </Container>
  );
};

export default NFTs;
